<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DeliveryPersonOrder extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'delivery_person_orders';

    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'delivery_person_id',
        'order_id',
        'generate_order_id',
        'delivery_amount',
        'payment_status',
        'payment_method',
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
    public function deliveryPerson()
    {
        return $this->belongsTo(DeliveryPerson::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
