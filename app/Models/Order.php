<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Order extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'orders'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'order_id',
        'user_id',
        'address_id',
        'delivery_person_id',
        'user_cart_id',
        'total_amount',
        'order_status',
        'payment_method',
        'payment_id',
        'payment_status',
        'estimated_delivery',
    ];

    protected $casts = [
        'total_amount'       => 'decimal:2',
        'estimated_delivery' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function userCart()
    {
        return $this->belongsTo(UserCart::class);
    }

    public function deliveryPerson()
    {
        return $this->belongsTo(DeliveryPerson::class, 'delivery_person_id');
    }

    public function shops()
    {
        return $this->belongsToMany(Shop::class, 'order_shop')
            ->withPivot('status', 'notes', 'status_changed_at', 'status_changed_by')
            ->withTimestamps();
    }
}
