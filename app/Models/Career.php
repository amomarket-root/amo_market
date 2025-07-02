<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Career extends ActiveModel
{
    use HasUuids;

    protected $table = 'careers';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'description',
        'image_path',
        'email',
        'benefits',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'benefits'  => 'array',
        'is_active' => 'boolean',
    ];
}
