<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OrderShop extends ActiveModel
{
    use HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'uuid';

    protected $table = 'order_shop';

    protected $fillable = [
        'order_id',
        'shop_id',
        'status',
        'notes',
        'status_changed_at',
        'status_changed_by',
    ];

    protected $casts = [
        'status_changed_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'status_changed_by');
    }
}
