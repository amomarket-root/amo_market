<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserCart extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'address_id',
        'cart_items',
        'delivery_charge',
        'platform_charge',
        'feeding_india_donation',
        'india_armed_force_contribution',
        'tip_amount',
        'subtotal',
        'grand_total',
        'status',
    ];

    protected $casts = [
        'cart_items'                     => 'array',
        'delivery_charge'                => 'decimal:2',
        'platform_charge'                => 'decimal:2',
        'tip_amount'                     => 'decimal:2',
        'subtotal'                       => 'decimal:2',
        'grand_total'                    => 'decimal:2',
        'feeding_india_donation'         => 'boolean',
        'india_armed_force_contribution' => 'boolean',
    ];

    // Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the address associated with the user cart.
     */
    public function address()
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
