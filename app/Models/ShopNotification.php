<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ShopNotification extends Model
{
    use HasUuids;

    protected $table = 'shop_notifications';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'shop_id',
        'order_id',
        'total_amount',
        'is_read',
    ];

    public function shop()
    {
        return $this->belongsTo(DeliveryPerson::class, 'shop_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
