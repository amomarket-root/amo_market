<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

class ShopType extends ActiveModel
{
    use HasUuids;

    protected $table = 'shop_types';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['id', 'name', 'has_services', 'delivery_charge', 'platform_charge']; // Updated

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

    public function shops()
    {
        return $this->hasMany(Shop::class);
    }
}
