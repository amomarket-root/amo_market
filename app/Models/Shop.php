<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Shop extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'shops'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'user_id',
        'shop_document_id',
        'name',
        'shop_type_id',
        'number',
        'image',
        'profile_picture',
        'rating',
        'review',
        'time',
        'offer',
        'description',
        'location',
        'latitude',
        'longitude',
        'online_status',
        'status',
    ];

    /**
     * Get the user that owns the shop.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function advisementPages()
    {
        return $this->hasMany(AdvisementPage::class);
    }

    public function bannerPages()
    {
        return $this->hasOne(BannerPage::class);
    }

    public function shopDocument()
    {
        return $this->hasOne(ShopDocument::class, 'shop_id');
    }

    public function orderFeedbacks()
    {
        return $this->hasMany(OrderFeedback::class);
    }

    public function updateRating()
    {
        $this->rating = $this->orderFeedbacks()->avg('shop_rating');
        $this->save();
    }

    public function shopType()
    {
        return $this->belongsTo(ShopType::class, 'shop_type_id');
    }
}
