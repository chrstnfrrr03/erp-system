<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'am_time_in',
        'am_time_out',
        'pm_time_in',   
        'pm_time_out',  
        'status',
    ];

    protected $casts = [
        
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}