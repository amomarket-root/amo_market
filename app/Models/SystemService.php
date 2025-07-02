<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

class SystemService extends ActiveModel
{
    use HasUuids;

    protected $table = 'system_services';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'name',
        'slug',
        'charge',
        'is_active',
        'description',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }

    // Helper method to get a service charge by slug
    public static function getCharge($slug, $default = 0)
    {
        $service = self::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        return $service ? $service->charge : $default;
    }
}
