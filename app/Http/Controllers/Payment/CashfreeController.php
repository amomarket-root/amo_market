<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CashfreeController extends Controller
{
    public function createOrder(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|digits:10',
            'amount' => 'required|numeric|min:1',
        ]);

        // Generate unique order IDs
        $orderId = 'order_' . Str::uuid()->toString();
        $customerId = 'customer_' . Str::uuid()->toString();

        $baseUrl = config('services.cashfree.env') === 'sandbox'
            ? 'https://sandbox.cashfree.com/pg/orders'
            : 'https://api.cashfree.com/pg/orders';

        // Use frontend checkout route for redirection
        $returnUrl = config('app.url') . '/checkout?payment_status=processing';

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'x-api-version' => '2022-01-01',
            'x-client-id' => config('services.cashfree.api_key'),
            'x-client-secret' => config('services.cashfree.api_secret'),
        ])->post($baseUrl, [
            'order_id' => $orderId,
            'order_amount' => $request->amount,
            'order_currency' => 'INR',
            'customer_details' => [
                'customer_id' => $customerId,
                'customer_name' => $request->name,
                'customer_email' => $request->email,
                'customer_phone' => $request->phone,
            ],
            'order_meta' => [
                'return_url' => $returnUrl . '&order_id={order_id}&order_token={order_token}',
                'notify_url' => config('app.url')  . '/api/portal/cashfree/success'
            ],
        ]);

        if ($response->failed()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment order',
                'error' => $response->json()
            ], 400);
        }

        // Store payment details in database
        $payment = Payment::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'amount' => $request->amount,
            'order_id' => $orderId,
            'status' => false // pending
        ]);

        return response()->json([
            'success' => true,
            'payment_link' => $response->json('payment_link'),
            'order_id' => $orderId,
            'payment_id' => $payment->id,
        ]);
    }

    public function paymentSuccess(Request $request)
    {
        try {
            $orderId = $request->input('order_id');

            if (!$orderId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Missing order ID'
                ], 400);
            }

            $baseUrl = config('services.cashfree.env') === 'sandbox'
                ? 'https://sandbox.cashfree.com/pg/orders/'
                : 'https://api.cashfree.com/pg/orders/';

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-api-version' => '2022-01-01',
                'x-client-id' => config('services.cashfree.api_key'),
                'x-client-secret' => config('services.cashfree.api_secret'),
            ])->get($baseUrl . $orderId);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment verification failed'
                ], 400);
            }

            $responseData = $response->json();

            // Update payment status in database
            $payment = Payment::where('order_id', $orderId)->first();

            if ($payment) {
                $status = ($responseData['order_status'] === 'PAID') ? true : false;

                $payment->update([
                    'status' => $status,
                    'other' => json_encode($responseData),
                    'payment_id' => $responseData['cf_order_id'] ?? null,
                ]);

                // Return minimal data needed for frontend
                return response()->json([
                    'success' => $status,
                    'message' => $status ? 'Payment Successful!' : 'Payment verification failed',
                    'payment_id' => $payment->id,
                    'order_id' => $orderId,
                    'amount' => $payment->amount,
                    'redirect' => true
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment record not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing payment: ' . $e->getMessage()
            ], 500);
        }
    }
}
