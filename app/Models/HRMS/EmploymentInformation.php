<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\HRMS\Employee;

class EmploymentInformation extends Model
{
    use HasFactory;

    protected $table = 'employment_information'; 

    protected $fillable = [
        'employee_id',
        'department',
        'position',
        'department_head',
        'supervisor',
        'job_location',
        'employee_type',             
        'employment_status',         
        'employment_classification', 
        'company_email',
        'rate',
        'rate_type',
        'date_started',
        'date_ended',
    ];

    protected $casts = [
        'date_started' => 'date',
        'date_ended'   => 'date',
        'rate'         => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }
}
