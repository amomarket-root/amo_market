<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OrderFeedback extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'order_feedbacks'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'order_id',
        'user_id',
        'shop_id',
        'delivery_person_id',
        'shop_rating',
        'delivery_rating',
        'packaging_quality',
        'comments',
    ];

    protected $casts = [
        'id'                 => 'string',
        'order_id'           => 'string',
        'user_id'            => 'string',
        'shop_id'            => 'string',
        'delivery_person_id' => 'string',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function deliveryPerson()
    {
        return $this->belongsTo(DeliveryPerson::class);
    }
}
