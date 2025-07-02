<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ShopPage extends ActiveModel
{
    use HasUuids;

    protected $table = 'shop_pages';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

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
