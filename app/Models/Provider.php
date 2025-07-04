<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Provider extends ActiveModel
{
     use HasUuids;

    protected $keyType = 'string'; // Use string for UUIDs

    public $incrementing = false; // Disable auto-incrementing

    protected $table = 'providers'; // Table name

    protected $primaryKey = 'id';    // Primary key field
    protected $fillable = ['provider','provider_id','user_id','avatar'];
    protected $hidden = ['created_at','updated_at'];

}

