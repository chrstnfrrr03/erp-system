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

    /**
     * Automatically cast these columns to Carbon dates.
     */
    protected $casts = [
        'date_started' => 'date',
        'date_ended' => 'date',
    ];

    /**
     * RELATIONSHIPS
     */

    // One employee has one employment detail
    public function employmentDetail()
    {
        return $this->hasOne(EmploymentDetail::class);
    }

    // One employee can have many leave requests
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    // If employee is linked to a User account
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
