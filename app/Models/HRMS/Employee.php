<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';

    protected $fillable = [
        'employee_no',
        'first_name',
        'middle_name',
        'last_name',
        'gender',
        'email',
        'mobile_number',
        'department',
        'position',
        'date_started',
        'date_ended',
        'user_id',
    ];
}
