<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Service extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'services';

    protected $fillable = [
        'sub_category_id',
        'shop_id',
        'name',
        'description',
        'base_price',
        'discount_price',
        'options',
        'file_paths',
        'status',
    ];

    protected $casts = [
        'options'    => 'array',
        'file_paths' => 'array',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }
}
