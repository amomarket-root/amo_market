<?php

namespace App\Services;

use App\Models\UserCart;
use Illuminate\Support\Facades\Log;

class UserCartService
{
    public function getUserCart($userId)
    {
        // Fetch the user's latest cart
        return UserCart::where('user_id', $userId)->where('status', 0)->latest()->first();
    }

    public function storeCart(array $cartData)
    {
        // Create a new UserCart instance
        $userCart = new UserCart([
            'user_id'                        => $cartData['user_id'],
            'cart_items'                     => $cartData['cart_items'],
            'delivery_charge'                => $cartData['delivery_charge']                ?? 0,
            'platform_charge'                => $cartData['platform_charge']                ?? 0,
            'feeding_india_donation'         => $cartData['feeding_india_donation']         ?? false,
            'india_armed_force_contribution' => $cartData['india_armed_force_contribution'] ?? false,
            'tip_amount'                     => $cartData['tip_amount']                     ?? null,
            'subtotal'                       => $cartData['subtotal']                       ?? 0,
            'grand_total'                    => $cartData['grand_total']                    ?? 0,
            'status'                         => $cartData['status'],
            'address_id'                     => $cartData['address_id'] ?? null, // Save address_id
        ]);

        // Save the cart to the database
        $userCart->save();

        return $userCart;
    }

    public function updateCart($cartId, array $cartData)
    {
        // Find the cart by ID
        $userCart = UserCart::findOrFail($cartId);

        // Update the cart data
        $userCart->update([
            'cart_items'                     => $cartData['cart_items'],
            'delivery_charge'                => $cartData['delivery_charge']                ?? 0,
            'platform_charge'                => $cartData['platform_charge']                ?? 0,
            'feeding_india_donation'         => $cartData['feeding_india_donation']         ?? false,
            'india_armed_force_contribution' => $cartData['india_armed_force_contribution'] ?? false,
            'tip_amount'                     => $cartData['tip_amount']                     ?? null,
            'subtotal'                       => $cartData['subtotal']                       ?? 0,
            'grand_total'                    => $cartData['grand_total']                    ?? 0,
            'status'                         => $cartData['status'],
            'address_id'                     => $cartData['address_id'] ?? null, // Update address_id
        ]);

        return $userCart;
    }

    /**
     * Update the address in the user's cart.
     *
     * @param  int  $userId
     * @param  int  $addressId
     * @return bool
     */
    public function updateAddress($userId, $addressId)
    {
        try {
            // Find the user's cart
            $userCart = UserCart::where('user_id', $userId)->first();

            if ($userCart) {
                // Update the address_id in the user_cart table
                $userCart->address_id = $addressId;
                $userCart->save();

                return true;
            }

            return false;
        } catch (\Exception $e) {
            // Log the error (optional)
            Log::error('Error updating address in cart: ' . $e->getMessage());

            return false;
        }
    }

    public function getLastCartRecordByUserId($userId)
    {
        return UserCart::with('user')
            ->where('user_id', $userId)
            ->where('status', 1)
            ->latest() // Order by the latest created_at
            ->first(); // Get the first record in the ordered list
    }

    public function getUserCartById($userCartId, $userId)
    {
        return UserCart::with('user')
            ->where('id', $userCartId)
            ->where('user_id', $userId)
            ->first();
    }
}
