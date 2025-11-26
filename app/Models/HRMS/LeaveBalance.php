<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Model;

class LeaveBalance extends Model
{
    protected $fillable = ['employee_id', 'leave_type_id', 'days_available'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
