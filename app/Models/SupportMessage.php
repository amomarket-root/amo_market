<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SupportMessage extends ActiveModel
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'support_messages'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'message',
        'type',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
