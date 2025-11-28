<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmploymentDetail extends Model
{
    use HasFactory;

    protected $table = 'employment_details';

    protected $fillable = [
        'employee_id',
        'department',
        'position',
        'employment_type',
        'employment_status',
        'date_hired',
        'date_terminated',
        'rate',
        'rate_type',
    ];

    protected $casts = [
        'date_hired' => 'date',
        'date_terminated' => 'date'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
