<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\ActiveModel;

class Role extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string'; // Use string for UUIDs
    public $incrementing = false; // Disable auto-incrementing
    protected $table = 'roles'; // Table name
    protected $primaryKey = 'id';    // Primary key field
    protected $fillable = [
        'name',
        'parent_id',
        'score',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function parent()
    {
        return $this->hasOne(Role::class, 'id', 'parent_id');
    }
}
