<?php
declare(strict_types=1);
namespace App\Models;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class AuthModel extends Authenticatable
{
    use LogsActivity, HasApiTokens, HasFactory, Notifiable;
    public function getActivitylogOptions():LogOptions
    {
        $table = $this->getTable();
        return LogOptions::defaults()
        ->setDescriptionForEvent(fn (string $eventName) => "{$table} is  {$eventName}")
        ->useLogName($table)
        ->logAll();
    }
}

