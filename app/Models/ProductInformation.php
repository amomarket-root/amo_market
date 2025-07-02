<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProductInformation extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'product_information'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'product_id',
        'product_type',
        'product_flavour',
        'product_Ingredients',
        'product_attraction',
        'key_features',
        'fssai_license',
        'other_license',
        'shelf_life',
        'manufacturer_details',
        'seller',
        'seller_fssai',
        'country_of_origin',
        'state_of_origin',
        'return_policy',
        'disclaimer',
        'second_unit_weight',
        'second_unit_price',
        'second_unit_original_price',
        'second_unit_discount',
        'total_second_unit',
        'second_unit_image',
        'third_unit_weight',
        'third_unit_price',
        'third_unit_original_price',
        'third_unit_discount',
        'total_third_unit',
        'third_unit_image',
        'product_image_one',
        'product_image_two',
        'product_image_three',
        'product_image_four',
        'product_image_five',
        'product_extra_image',
        'status',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
