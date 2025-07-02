<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Cart extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'shop_id',
        'product_id',
        'service_id',
        'quantity',
        'price',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
