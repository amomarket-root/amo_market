<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'products'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'sub_category_id',
        'name',
        'image',
        'weight',
        'price',
        'original_price',
        'discount',
        'delivery_time',
        'about_product',
        'unit',
        'product_code',
        'status',
    ];

    public function sub_category()
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function product_information()
    {
        return $this->hasMany(ProductInformation::class);
    }
}
