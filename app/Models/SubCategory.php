<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubCategory extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'sub_categories'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'category_id',
        'name',
        'image',
        'description',
        'product_code',
        'status',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function product()
    {
        return $this->hasMany(Product::class);
    }

    public function wishlist()
    {
        return $this->belongsTo(WishList::class);
    }

    /**
     * Get the service information for the subcategory.
     */
    public function serviceInformations(): HasMany
    {
        return $this->hasMany(ServiceInformation::class, 'sub_category_id');
    }
}
