<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\ActiveModel;

class ShopDocument extends ActiveModel
{
    use SoftDeletes;
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'shop_documents'; // Table name
    protected $primaryKey = 'id';    // Primary key field
    protected $fillable = [
        'shop_id',
        'PAN_Number',
        'PAN_Photo',
        'FSSAI_Licence',
        'FSSAI_Licence_Document',
        'GST_number',
        'GST_Document',
        'Shop_Licence',
        'Shop_Licence_Document',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }
}
