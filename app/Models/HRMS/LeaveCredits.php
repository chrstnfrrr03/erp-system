<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\HRMS\Employee;
use App\Traits\Auditable;

class LeaveCredits extends Model
{
    use HasFactory;
    use Auditable;

    protected $table = 'leave_credits';

    protected $fillable = [
        'employee_id',

        'vacation_year',
        'vacation_total',
        'vacation_credits',

        'sick_year',
        'sick_total',
        'sick_credits',

        'emergency_year',
        'emergency_total',
        'emergency_credits',
    ];

    protected $casts = [
        'vacation_year' => 'integer',
        'vacation_total' => 'decimal:2',
        'vacation_credits' => 'decimal:2',

        'sick_year' => 'integer',
        'sick_total' => 'decimal:2',
        'sick_credits' => 'decimal:2',

        'emergency_year' => 'integer',
        'emergency_total' => 'decimal:2',
        'emergency_credits' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
