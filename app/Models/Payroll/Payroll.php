<?php

namespace App\Models\Payroll;

use Illuminate\Database\Eloquent\Model;
use App\Models\HRMS\Employee;

class Payroll extends Model
{
    protected $fillable = [
        'employee_id',
        'pay_period_start',
        'pay_period_end',
        'payment_date',
        'pay_type',
        'base_salary',
        'total_hours',
        'overtime_hours',        
        'overtime_pay',         
        'gross_pay',
        'bonuses',
        'deductions',            
        'tax',
        'nasfund',
        'other_deductions',
        'late_deduction',        
        'net_pay',
        'status',
        'days_worked',           
        'days_absent',           
        'days_late',            
        'notes',                 
    ];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        'payment_date' => 'date',
        'base_salary' => 'decimal:2',
        'total_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'gross_pay' => 'decimal:2',
        'bonuses' => 'decimal:2',
        'deductions' => 'decimal:2',
        'tax' => 'decimal:2',
        'nasfund' => 'decimal:2',
        'other_deductions' => 'decimal:2',
        'late_deduction' => 'decimal:2',  
        'net_pay' => 'decimal:2',
        'days_worked' => 'integer',
        'days_absent' => 'integer',
        'days_late' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}