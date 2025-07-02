<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Category extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'categories'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'shop_id',
        'name',
        'description',
        'content_image',
        'image',
        'status',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function sub_category()
    {
        return $this->hasMany(SubCategory::class);
    }
}
