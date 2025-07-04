<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends AuthModel
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    use HasUuids;

    protected $keyType = 'string'; // Use string for UUIDs

    public $incrementing = false; // Disable auto-incrementing

    protected $table = 'users'; // Table name

    protected $primaryKey = 'id';    // Primary key field

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'role_id',
        'name',
        'email',
        'password',
        'status',
        'avatar_id',
        'number',
        'number_verified_at',
        'otp',
        'otp_expiry',
        'login_time',
        'logout_time',
        'has_entered_details',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function avatar()
    {
        return $this->belongsTo(Avatar::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the shop associated with the user.
     */
    public function shop()
    {
        return $this->hasOne(Shop::class, 'user_id');
    }

    public function providers()
    {
        return $this->hasMany(Provider::class, 'user_id', 'id');
    }
}
