<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Subscriber extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'subscribers';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'email',
        'subscribed_at',
    ];

    /**
     * Automatically cast dates for this model.
     *
     * @var array
     */
    protected $casts = [
        'subscribed_at' => 'datetime',
    ];
}
