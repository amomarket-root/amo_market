<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AboutUs extends ActiveModel
{
    use HasUuids;

    protected $table = 'about_us';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'content',
        'image_path',
    ];
}
