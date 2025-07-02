<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ShopOrder extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'shop_orders';

    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'shop_id',
        'order_id',
        'generate_order_id',
        'payment_status',
        'total_amount',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'payment_status' => 'string',
        'status'         => 'string',
        'total_amount'   => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
