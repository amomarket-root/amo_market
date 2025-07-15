<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\UserCart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CashfreeController extends Controller
{
    public function createOrder(Request $request)
    {
        $request->validate([
            'name'         => 'required|string',
            'email'        => 'required|email',
            'phone'        => 'required|digits:10',
            'amount'       => 'required|numeric|min:1',
            'user_cart_id' => 'required|uuid|exists:user_carts,id', // Changed to user_cart_id
        ]);

        // Verify the user cart belongs to the authenticated user
        $userCart = UserCart::where('id', $request->user_cart_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $userCart) {
            return response()->json([
                'success' => false,
                'message' => 'User cart not found or does not belong to you',
            ], 404);
        }

        $orderId    = 'order_'.Str::uuid()->toString();
        $customerId = 'customer_'.Str::uuid()->toString();

        $baseUrl = config('services.cashfree.env') === 'sandbox'
            ? 'https://sandbox.cashfree.com/pg/orders'
            : 'https://api.cashfree.com/pg/orders';

        $returnUrl = config('app.url').'/checkout?payment_status=processing&user_cart_id='.$request->user_cart_id;

        $response = Http::withHeaders([
            'Content-Type'    => 'application/json',
            'x-api-version'   => '2022-01-01',
            'x-client-id'     => config('services.cashfree.api_key'),
            'x-client-secret' => config('services.cashfree.api_secret'),
        ])->post($baseUrl, [
            'order_id'         => $orderId,
            'order_amount'     => $request->amount,
            'order_currency'   => 'INR',
            'customer_details' => [
                'customer_id'    => $customerId,
                'customer_name'  => $request->name,
                'customer_email' => $request->email,
                'customer_phone' => $request->phone,
            ],
            'order_meta' => [
                'return_url' => $returnUrl.'&order_id={order_id}&order_token={order_token}',
                'notify_url' => config('app.url').'/api/portal/cashfree/success?user_cart_id='.$request->user_cart_id,
            ],
        ]);

        if ($response->failed()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment order',
                'error'   => $response->json(),
            ], 400);
        }

        $payment = Payment::create([
            'id'           => Str::uuid()->toString(),
            'user_id'      => $request->user()->id,
            'name'         => $request->name,
            'email'        => $request->email,
            'phone'        => $request->phone,
            'amount'       => $request->amount,
            'order_id'     => $orderId,
            'user_cart_id' => $request->user_cart_id, // Changed to user_cart_id
            'status'       => false,
        ]);

        return response()->json([
            'success'      => true,
            'payment_link' => $response->json('payment_link'),
            'order_id'     => $orderId,
            'payment_id'   => $payment->id,
            'user_cart_id' => $request->user_cart_id, // Changed to user_cart_id
        ]);
    }

    public function paymentSuccess(Request $request)
    {
        try {
            $orderId    = $request->input('order_id');
            $userCartId = $request->input('user_cart_id'); // Changed to user_cart_id

            if (! $orderId || ! $userCartId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Missing order ID or user cart ID',
                ], 400);
            }

            $baseUrl = config('services.cashfree.env') === 'sandbox'
                ? 'https://sandbox.cashfree.com/pg/orders/'
                : 'https://api.cashfree.com/pg/orders/';

            $response = Http::withHeaders([
                'Content-Type'    => 'application/json',
                'x-api-version'   => '2022-01-01',
                'x-client-id'     => config('services.cashfree.api_key'),
                'x-client-secret' => config('services.cashfree.api_secret'),
            ])->get($baseUrl.$orderId);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment verification failed',
                ], 400);
            }

            $responseData = $response->json();
            $status       = ($responseData['order_status'] === 'PAID');

            $payment = Payment::where('order_id', $orderId)->first();
            if ($payment) {
                $payment->update([
                    'status'     => $status,
                    'other'      => json_encode($responseData),
                    'payment_id' => $responseData['cf_order_id'] ?? null,
                ]);
            }

            return response()->json([
                'success'      => $status,
                'message'      => $status ? 'Payment Successful!' : 'Payment verification failed',
                'payment_id'   => $payment->id ?? null,
                'order_id'     => $orderId,
                'user_cart_id' => $userCartId, // Changed to user_cart_id
                'amount'       => $payment->amount ?? 0,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing payment: '.$e->getMessage(),
            ], 500);
        }
    }
}
