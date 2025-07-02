<?php

namespace App\Services;

use App\Events\NewOrderNotificationForShopEvent;
use App\Models\Cart;
use App\Models\DeliveryPerson;
use App\Models\Order;
use App\Models\OrderFeedback;
use App\Models\OrderShop;
use App\Models\Shop;
use App\Models\ShopNotification;
use App\Models\UserCart;
use App\Notifications\NewOrderNotificationForShop;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderService
{
    public function createOrderWithShops(array $data)
    {
        try {
            $randomString = strtoupper(Str::random(6));
            $randomDigits = mt_rand(1000, 9999);

            $order = Order::create([
                'order_id'       => 'ORD#'.$randomString.$randomDigits,
                'user_id'        => $data['user_id'],
                'address_id'     => $data['address_id'],
                'user_cart_id'   => $data['user_cart_id'],
                'total_amount'   => $data['total_amount'],
                'order_status'   => $data['order_status'],
                'payment_method' => $data['payment_method'],
                'payment_id'     => $data['payment_id'] ?? null,
                'payment_status' => $data['payment_status'],
            ]);

            foreach ($data['shop_ids'] as $shopId) {
                $shopTotal = collect($data['cart_items'])
                    ->where('shop_id', $shopId)
                    ->sum(function ($item) {
                        return $item['price'] * $item['quantity'];
                    });

                // Explicitly create the OrderShop record with UUID
                OrderShop::create([
                    'id'                => Str::uuid(), // Add this line
                    'order_id'          => $order->id,
                    'shop_id'           => $shopId,
                    'status'            => 'pending',
                    'status_changed_at' => now(),
                    'status_changed_by' => $data['user_id'],
                ]);

                $this->notifyShop($shopId, $order, $shopTotal);
            }

            if ($data['payment_status'] === 'success') {
                $this->updateCartStatuses($data);
            }

            return $order->load('shops');
        } catch (Exception $e) {
            Log::error('Order creation failed', [
                'error' => $e->getMessage(),
                'data'  => $data,
            ]);
            throw $e;
        }
    }

    protected function notifyShop($shopId, $order, $shopTotal)
    {
        $shop = Shop::with('user')->find($shopId);

        if ($shop && $shop->user) {
            $shop->user->notify(new NewOrderNotificationForShop($order));

            ShopNotification::create([
                'shop_id'      => $shopId,
                'order_id'     => $order->id,
                'total_amount' => $shopTotal,
                'message'      => 'You have received a new order!',
                'is_read'      => false,
            ]);

            try {
                broadcast(new NewOrderNotificationForShopEvent([
                    'id'           => $order->id,
                    'shop_id'      => $shopId,
                    'order_id'     => $order->order_id,
                    'total_amount' => $shopTotal,
                    'message'      => 'You have received a new order!',
                ]))->toOthers();
            } catch (\Exception $e) {
                Log::error('WebSocket broadcasting failed', [
                    'error'    => $e->getMessage(),
                    'shop_id'  => $shopId,
                    'order_id' => $order->id,
                ]);
            }
        }
    }

    protected function updateCartStatuses(array $data)
    {
        Cart::where('user_id', $data['user_id'])->update(['status' => 1]);
        UserCart::where('user_id', $data['user_id'])->where('id', $data['user_cart_id'])->update(['status' => 0]);
    }

    public function getOrderCurrentUser($userId, $orderId)
    {
        try {
            $order = Order::with(['userCart', 'address', 'deliveryPerson', 'shops'])
                ->where('user_id', $userId)
                ->where('id', $orderId)
                ->firstOrFail();

            return [
                'order' => $order,
            ];
        } catch (Exception $e) {
            Log::error('Fetching order failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function getOrderSummary($userId)
    {
        return Order::with('shops')
            ->select('id', 'total_amount', 'order_status')
            ->where('user_id', $userId)
            ->where('order_status', '!=', 'delivered')
            ->get();
    }

    public function getOrderHistory($userId)
    {
        return Order::with(['userCart', 'shops'])
            ->where('user_id', $userId)
            ->where('order_status', 'delivered')
            ->get();
    }

    public function getOrderDetails($userId, $orderId)
    {
        $order = Order::with(['userCart', 'address', 'deliveryPerson', 'shops'])
            ->where('user_id', $userId)
            ->where('id', $orderId)
            ->firstOrFail();

        return [
            'order' => $order,
            'shops' => $order->shops,
        ];
    }

    public function getDeliveredOrderForFeedback($userId, $orderId)
    {
        $order = Order::with(['userCart', 'address', 'deliveryPerson', 'shops'])
            ->where('user_id', $userId)
            ->where('id', $orderId)
            ->where('order_status', 'delivered')
            ->firstOrFail();

        if ($order->deliveryPerson) {
            $order->deliveryPerson->total_deliveries = Order::where('delivery_person_id', $order->delivery_person_id)
                ->where('order_status', 'delivered')
                ->count();
        }

        return [
            'order' => $order,
            'shops' => $order->shops,
        ];
    }

    public function storeFeedback(array $data)
    {
        $validator = Validator::make($data, [
            'order_id'          => 'required|uuid|exists:orders,id',
            'shop_id'           => 'required|uuid|exists:shops,id',
            'shop_rating'       => 'required|integer|min:1|max:5',
            'delivery_rating'   => 'nullable|integer|min:1|max:5',
            'packaging_quality' => 'nullable|in:good,bad',
            'comments'          => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            throw new \InvalidArgumentException($validator->errors()->first());
        }

        $userId   = Auth::id();
        $feedback = OrderFeedback::create([
            'order_id'           => $data['order_id'],
            'user_id'            => $userId,
            'shop_id'            => $data['shop_id'],
            'delivery_person_id' => $data['delivery_person_id'] ?? null,
            'shop_rating'        => $data['shop_rating'],
            'delivery_rating'    => $data['delivery_rating']   ?? null,
            'packaging_quality'  => $data['packaging_quality'] ?? null,
            'comments'           => $data['comments']          ?? null,
        ]);

        $shop = Shop::find($data['shop_id']);
        if ($shop) {
            $shop->updateRating();
        }

        if (! empty($data['delivery_person_id'])) {
            $deliveryPerson = DeliveryPerson::find($data['delivery_person_id']);
            if ($deliveryPerson) {
                $deliveryPerson->updateRating();
            }
        }

        return $feedback;
    }
}
