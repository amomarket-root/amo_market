<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Term extends ActiveModel
{
    use HasUuids;

    protected $table = 'terms';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'content',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
