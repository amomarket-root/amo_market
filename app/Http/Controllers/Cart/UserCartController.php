<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Services\UserCartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class UserCartController extends Controller
{
    protected $userCartService;

    public function __construct(UserCartService $userCartService)
    {
        $this->userCartService = $userCartService;
    }

    public function store(Request $request)
    {
        try {
            // Validate the request
            $validateCart = Validator::make($request->all(), [
                'subtotal' => 'required|numeric',
                'cart_items' => 'required|json',
                'delivery_charge' => 'nullable|numeric',
                'platform_charge' => 'nullable|numeric',
                'feeding_india_donation' => 'nullable|boolean',
                'india_armed_force_contribution' => 'nullable|boolean',
                'tip_amount' => 'nullable|integer',
                'grand_total' => 'required|numeric',
                'address_id' => 'nullable|string',
                'status' => 'required|numeric|in:0,1', // Ensuring status is either 0 or 1
            ]);

            // If validation fails, return error response
            if ($validateCart->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateCart->errors(),
                ], 401);
            }

            // Ensure the user is authenticated
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Add user_id to the validated data
            $validatedData = $validateCart->validated();
            $validatedData['user_id'] = $userId;

            // Logic based on status
            if ($validatedData['status'] == 0) {
                // Check if the user already has a cart
                $existingCart = $this->userCartService->getUserCart($userId);
                if ($existingCart) {
                    // Update the existing cart
                    $userCart = $this->userCartService->updateCart($existingCart->id, $validatedData);
                    $message = 'Cart updated successfully';
                } else {
                    // If no existing cart, create a new one
                    $userCart = $this->userCartService->storeCart($validatedData);
                    $message = 'Cart stored successfully';
                }
            } else {
                // If status == 1, insert new cart record (even if one exists)
                $userCart = $this->userCartService->storeCart($validatedData);
                $message = 'New cart created successfully';
            }

            // Return success response
            return response()->json([
                'status' => true,
                'message' => $message,
                'data' => $userCart,
            ], 201);
        } catch (\Throwable $th) {
            // Handle exceptions
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the address in the user's cart.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAddress(Request $request)
    {
        // Validate the request
        $request->validate([
            'address_id' => 'required|string|exists:addresses,id',
        ]);

        // Get the authenticated user
        $user = Auth::user();

        // Call the service to update the address
        $result = $this->userCartService->updateAddress($user->id, $request->address_id);

        if ($result) {
            return response()->json([
                'status' => true,
                'message' => 'Address updated successfully.',
            ]);
        }

        return response()->json([
            'status' => false,
            'message' => 'Failed to update address.',
        ], 500);
    }

    public function getLastCartRecord(Request $request)
    {
        try {
            // Automatically get the authenticated user's ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            // Fetch the last cart record for the authenticated user
            $lastCartRecord = $this->userCartService->getLastCartRecordByUserId($userId);

            if ($lastCartRecord) {
                return response()->json($lastCartRecord, 200);
            } else {
                return response()->json(['message' => 'No record found'], 404);
            }
        } catch (Exception $e) {
            // Log the error (optional)
            Log::error('Error fetching last cart record: ' . $e->getMessage());

            // Return a generic error response
            return response()->json([
                'message' => 'An error occurred while fetching the cart record. Please try again later.',
            ], 500);
        }
    }
}
