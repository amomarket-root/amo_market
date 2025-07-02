<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Blog extends ActiveModel
{
    use HasUuids;

    protected $table = 'blogs';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'main_title',
        'category',
        'date',
        'location',
        'custom_url',
        'multimedia',  // Either an image or video URL
        'header',
        'description',
        'other_images', // Array of image URLs
    ];

    /**
     * Cast attributes to their respective data types.
     */
    protected $casts = [
        'date'         => 'date',
        'multimedia'   => 'json',
        'other_images' => 'json',
    ];
}
