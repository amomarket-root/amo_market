<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function store(Request $request)
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            $validatedData = $request->validate([
                'address_id' => 'required|exists:addresses,id',
                'user_cart_id' => 'required|exists:user_carts,id',
                'shop_ids' => 'required|array',
                'shop_ids.*' => 'uuid|exists:shops,id',
                'total_amount' => 'required|numeric',
                'order_status' => 'required|string|in:pending,accepted,preparing,on_the_way,reached,delivered',
                'payment_method' => 'required|string',
                'payment_id' => 'nullable|string',
                'payment_status' => 'required|string|in:pending,success,failed',
                'cart_items' => 'required|array'
            ]);

            $validatedData['user_id'] = $userId;
            $order = $this->orderService->createOrderWithShops($validatedData);

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Order creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Something went wrong while creating the order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getOrderCurrentUser(Request $request, $orderId)
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            $orderData = $this->orderService->getOrderCurrentUser($userId, $orderId);

            return response()->json([
                'message' => 'Current User Order fetched successfully',
                'orderDetails' => $orderData['order'],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong while fetching order details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getOrderSummary(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status' => false,
                'message' => 'User is not authenticated.',
            ], 401);
        }

        $orderSummary = $this->orderService->getOrderSummary($userId);

        return response()->json([
            'status' => !$orderSummary->isEmpty(),
            'data' => $orderSummary->isEmpty() ? null : $orderSummary,
            'message' => $orderSummary->isEmpty() ? 'No orders found.' : null,
        ], $orderSummary->isEmpty() ? 404 : 200);
    }

    public function getOrderHistory(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status' => false,
                'message' => 'User is not authenticated.',
            ], 401);
        }

        $orderSummary = $this->orderService->getOrderHistory($userId);
        if (!$orderSummary) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch order summary.',
            ], 400);
        }

        return response()->json([
            'status' => true,
            'data' => $orderSummary,
        ]);
    }

    public function getOrderDetails(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'User is not authenticated.',
                ], 401);
            }

            $orderDetails = $this->orderService->getOrderDetails($userId, $request->input('order_id'));
            if (!$orderDetails['order']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Current user order fetched successfully.',
                'orderDetails' => $orderDetails['order'],
                'shops' => $orderDetails['shops'],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching order details', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while fetching the order details.',
            ], 500);
        }
    }
    public function getDeliveredOrderForFeedback(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'User is not authenticated.',
                ], 401);
            }

            $orderDetails = $this->orderService->getDeliveredOrderForFeedback($userId, $request->input('order_id'));
            if (!$orderDetails['order']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Current user order fetched successfully.',
                'orderDetails' => $orderDetails['order'],
                'shops' => $orderDetails['shops'],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching order details', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while fetching the order details.',
            ], 500);
        }
    }
    public function storeFeedback(Request $request)
    {
        try {
            $order = Order::findOrFail($request->order_id);
            $feedbackData = [
                'order_id' => $request->order_id,
                'shop_id' => $order->shops()->first()->id,
                'delivery_person_id' => $order->delivery_person_id,
                'shop_rating' => $request->shop_rating,
                'delivery_rating' => $request->delivery_rating,
                'packaging_quality' => $request->packaging_quality,
                'comments' => $request->comments
            ];

            $feedback = $this->orderService->storeFeedback($feedbackData);

            return response()->json([
                'status' => true,
                'message' => 'Feedback submitted successfully',
                'data' => $feedback
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
