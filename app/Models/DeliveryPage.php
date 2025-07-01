<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\ActiveModel;


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
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];
}