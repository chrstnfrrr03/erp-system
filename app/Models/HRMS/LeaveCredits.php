<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\HRMS\Employee;

class LeaveCredits extends Model
{
    use HasFactory;

    protected $table = 'leave_credits';

    protected $fillable = [
        'employee_id',
        'vacation_year',
        'vacation_credits',
        'sick_year',
        'sick_credits',
        'emergency_year',
        'emergency_credits',
    ];

    protected $casts = [
        'vacation_year' => 'integer',
        'vacation_credits' => 'decimal:2',
        'sick_year' => 'integer',
        'sick_credits' => 'decimal:2',
        'emergency_year' => 'integer',
        'emergency_credits' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
