<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Address extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'addresses'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'user_id',
        'full_name',
        'phone_number',
        'alternative_number',
        'pin_code',
        'state',
        'city',
        'building_details',
        'location',
        'is_default',
        'address_type',
        'delivery_note',
        'status',
        'full_address',
        'latitude',
        'longitude',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user carts associated with the address.
     */
    public function userCarts()
    {
        return $this->hasMany(UserCart::class, 'address_id');
    }

    // public function order()
    // {
    //     return $this->belongsTo(Orders::class);
    // }
}
