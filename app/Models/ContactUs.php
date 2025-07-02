<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ContactUs extends ActiveModel
{
    use HasUuids;

    protected $table = 'contact_us';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'company_name',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'phone_numbers',
        'email',
        'social_media',
    ];

    protected $casts = [
        'social_media' => 'array',
    ];
}
