<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AccountDeletion extends ActiveModel
{
    use HasUuids;

    protected $table = 'account_deletions';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['user_name', 'user_email', 'user_contact_number', 'reason', 'feedback'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
