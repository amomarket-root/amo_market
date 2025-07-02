<?php

namespace App\Http\Controllers\Address;

use App\Http\Controllers\Controller;
use App\Services\AddressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    protected $addressService;

    public function __construct(AddressService $addressService)
    {
        $this->addressService = $addressService;
    }

    /**
     * Get all addresses for the authenticated user.
     */
    public function index()
    {
        try {
            // Ensure the user is authenticated
            $userId = Auth::id();
            if (! $userId) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Use the service to fetch all addresses for the user
            $addresses = $this->addressService->getUserAddresses();

            // Return success response
            return response()->json([
                'status'  => true,
                'message' => 'Addresses fetched successfully',
                'data'    => $addresses,
            ], 200);
        } catch (\Throwable $th) {
            // Handle exceptions
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new address for the authenticated user.
     */
    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validateAddress = Validator::make($request->all(), [
                'full_name'          => 'required|string|max:255',
                'phone_number'       => 'required|string|max:15',
                'alternative_number' => 'nullable|string|max:15',
                'pin_code'           => 'required|string|max:10',
                'state'              => 'required|string|max:255',
                'city'               => 'required|string|max:255',
                'building_details'   => 'required|string|max:255',
                'location'           => 'required|string|max:255',
                'is_default'         => 'nullable|string|max:255',
                'address_type'       => 'nullable|string|max:255',
                'delivery_note'      => 'nullable|string|max:255',
                'status'             => 'required|integer',
                'full_address'       => 'required|string|max:255',
                'latitude'           => 'required|numeric',
                'longitude'          => 'required|numeric',
            ]);

            // If validation fails, return error response
            if ($validateAddress->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validateAddress->errors(),
                ], 422);
            }

            // Ensure the user is authenticated
            $userId = Auth::id();
            if (! $userId) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Add user_id to the validated data
            $validatedData            = $validateAddress->validated();
            $validatedData['user_id'] = $userId;

            // Use the service to store the address data
            $address = $this->addressService->storeAddress($validatedData);

            // Return success response
            return response()->json([
                'status'  => true,
                'message' => 'Address stored successfully',
                'data'    => $address,
            ], 201);
        } catch (\Throwable $th) {
            // Handle exceptions
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific address by ID for the authenticated user.
     */
    public function show($addressId)
    {
        try {
            // Ensure the user is authenticated
            $userId = Auth::id();
            if (! $userId) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Use the service to fetch the address by ID
            $address = $this->addressService->getAddressById($addressId);

            // Return success response
            return response()->json([
                'status'  => true,
                'message' => 'Address fetched successfully',
                'data'    => $address,
            ], 200);
        } catch (\Throwable $th) {
            // Handle exceptions
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an existing address.
     */
    public function destroy($addressId)
    {
        try {
            // Ensure the user is authenticated
            $userId = Auth::id();
            if (! $userId) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Use the service to delete the address
            $this->addressService->deleteAddress($addressId);

            // Return success response
            return response()->json([
                'status'  => true,
                'message' => 'Address deleted successfully',
            ], 200);
        } catch (\Throwable $th) {
            // Handle exceptions
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing address.
     */
    public function update(Request $request, $addressId)
    {
        try {
            // Validate the request data
            $validateAddress = Validator::make($request->all(), [
                'full_name'          => 'required|string|max:255',
                'phone_number'       => 'required|string|max:15',
                'alternative_number' => 'nullable|string|max:15',
                'pin_code'           => 'required|string|max:10',
                'state'              => 'required|string|max:255',
                'city'               => 'required|string|max:255',
                'building_details'   => 'required|string|max:255',
                'location'           => 'required|string|max:255',
                'is_default'         => 'nullable|string|max:255',
                'address_type'       => 'nullable|string|max:255',
                'delivery_note'      => 'nullable|string|max:255',
                'status'             => 'required|integer',
                'full_address'       => 'required|string|max:255',
                'latitude'           => 'required|numeric',
                'longitude'          => 'required|numeric',
            ]);

            if ($validateAddress->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validateAddress->errors(),
                ], 422);
            }

            $userId = Auth::id();
            if (! $userId) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Get the updated address data
            $address = $this->addressService->updateAddress($addressId, $validateAddress->validated());

            return response()->json([
                'status'  => true,
                'message' => 'Address updated successfully',
                'data'    => $address,
            ], 200);
        } catch (\Throwable $th) {
            $statusCode = $th->getCode() > 0 ? $th->getCode() : 500;

            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], $statusCode);
        }
    }
}
