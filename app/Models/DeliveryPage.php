<?php

namespace App\Models;

class DeliveryPage extends ActiveModel
{
    protected $table = 'delivery_pages';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'content',
        'image_path',
        'video_url',
        'link',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
