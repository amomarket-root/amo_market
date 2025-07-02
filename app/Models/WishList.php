<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WishList extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'wishlist'; // Table name

    protected $primaryKey = 'id';  // Primary key field

    protected $fillable = [
        'user_id',
        'sub_category_id',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sub_category()
    {
        return $this->belongsTo(SubCategory::class);
    }
}
