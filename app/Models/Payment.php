<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'amount',
        'payment_id',
        'order_id',
        'status',
        'other',
    ];

    protected $casts = [
        'other'  => 'array',
        'status' => 'boolean',
    ];

    protected $primaryKey = 'id';

    protected $table = 'payments';

    protected $keyType = 'string';

    public $incrementing = false;
}
