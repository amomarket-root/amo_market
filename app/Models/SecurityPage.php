<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SecurityPage extends ActiveModel
{
    use HasUuids;

    protected $table = 'security_pages';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'introduction',
        'content_sections',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'content_sections' => 'array',
        'is_active'        => 'boolean',
    ];
}
