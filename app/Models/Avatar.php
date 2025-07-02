<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Avatar extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'avatars'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'path',
    ];

    public function user()
    {
        return $this->hasMany(User::class);
    }
}
