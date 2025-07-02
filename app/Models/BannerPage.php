<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BannerPage extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'shop_id',
        'title',
        'content_image',
        'status',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
