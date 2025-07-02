<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ActiveModel extends Model
{
    use HasFactory;
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        $table = $this->getTable();

        return LogOptions::defaults()
            ->setDescriptionForEvent(fn (string $eventName) => "{$table} is  {$eventName}")
            ->useLogName($table)
            ->logAll();
    }
}
