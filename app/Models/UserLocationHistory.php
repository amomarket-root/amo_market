<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLocationHistory extends Model
{
    use HasFactory;

    protected $table = 'user_location_history';

    protected $fillable = [
        'ip_address',
        'latitude',
        'longitude',
        'state',
        'city',
    ];

    protected $casts = [
        'latitude'  => 'float',
        'longitude' => 'float',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];
}
