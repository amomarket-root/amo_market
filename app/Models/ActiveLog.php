<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActiveLog extends Model
{
    use HasFactory;

    protected $table = 'activity_log'; // Table name

    protected $primaryKey = 'id';

    protected $fillable = [
        'causer_id',
        'causer_type',
    ];
}
