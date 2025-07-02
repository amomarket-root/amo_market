<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DeliveryNotification extends ActiveModel
{
    use HasUuids;

    protected $table = 'delivery_notifications';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'delivery_person_id',
        'order_id',
        'total_amount',
        'is_read',
    ];

    public function deliveryPerson()
    {
        return $this->belongsTo(DeliveryPerson::class, 'delivery_person_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
