<?php

namespace App\Services;

use App\Models\Address;
use Illuminate\Support\Facades\Auth;

class AddressService
{
    /**
     * Get all addresses for the authenticated user.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     *
     * @throws \Exception
     */
    public function getUserAddresses()
    {
        // Ensure the user is authenticated
        $userId = Auth::id();
        if (! $userId) {
            throw new \Exception('User not authenticated');
        }

        // Fetch all addresses for the user
        return Address::where('user_id', $userId)->get();
    }

    /**
     * Store a new address for the authenticated user.
     *
     * @return Address
     *
     * @throws \Exception
     */
    public function storeAddress(array $addressData)
    {
        // Ensure the user is authenticated
        $userId = Auth::id();
        if (! $userId) {
            throw new \Exception('User not authenticated');
        }

        // Add user_id to the address data
        $addressData['user_id'] = $userId;

        // Create a new Address instance
        $address = new Address($addressData);

        // Save the address to the database
        $address->save();

        return $address;
    }

    /**
     * Get a specific address by ID for the authenticated user.
     *
     * @param  int  $addressId
     * @return Address
     *
     * @throws \Exception
     */
    public function getAddressById(string $addressId)
    {
        // Ensure the user is authenticated
        $userId = Auth::id();
        if (! $userId) {
            throw new \Exception('User not authenticated');
        }

        // Find the address by ID and user_id
        $address = Address::where('id', $addressId)
            ->where('user_id', $userId)
            ->first();

        if (! $address) {
            throw new \Exception('Address not found');
        }

        return $address;
    }

    /**
     * Delete an existing address.
     *
     * @param  int  $addressId
     * @return bool
     *
     * @throws \Exception
     */
    public function deleteAddress(string $addressId)
    {
        // Find the address by ID
        $address = Address::find($addressId);

        if (! $address) {
            throw new \Exception('Address not found');
        }

        // Ensure the user owns the address
        $userId = Auth::id();
        if ($address->user_id !== $userId) {
            throw new \Exception('Unauthorized to delete this address');
        }

        // Delete the address
        $address->delete();

        return true;
    }

    /**
     * Update an existing address
     *
     * @throws \Exception
     */
    public function updateAddress(string $addressId, array $addressData): Address
    {
        // Find the address by ID
        $address = Address::find($addressId);

        if (! $address) {
            throw new \Exception('Address not found', 404);
        }

        // Ensure the user owns the address
        $userId = Auth::id();
        if ($address->user_id !== $userId) {
            throw new \Exception('Unauthorized to update this address', 403);
        }

        // Update the address with new data
        $address->update($addressData);

        // Return the fresh instance from database
        return $address->fresh();
    }
}
