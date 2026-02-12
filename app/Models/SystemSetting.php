<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'company_name',
        'company_address',
        'email',
        'phone',
        'country',
        'timezone',
        'currency',
        'date_format',
    ];
}
