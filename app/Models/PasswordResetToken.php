<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetToken extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'email',
        'token',
    ];

    protected $keyType = 'string'; // Use string for UUIDs

    public $incrementing = false; // Disable auto-incrementing
}
