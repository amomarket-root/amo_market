<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PrivacyPolicy extends ActiveModel
{
    use HasUuids;

    protected $table = 'privacy_policies';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'introduction',
        'sections',
        'image_path',
        'company_description',
        'is_active',
    ];

    protected $casts = [
        'sections'  => 'array',
        'is_active' => 'boolean',
    ];
}
