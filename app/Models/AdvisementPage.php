<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AdvisementPage extends ActiveModel
{
    use HasUuids;

    protected $table = 'advisement_pages';

    protected $primaryKey = 'id';

    public $incrementing = false; // Since 'id' is a UUID

    protected $keyType = 'string';

    protected $fillable = [
        'shop_id',
        'title',
        'content_image',
        'description',
        'status',

    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
