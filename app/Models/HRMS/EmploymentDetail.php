<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Model;

class EmploymentDetail extends Model
{
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
