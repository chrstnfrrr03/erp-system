<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $table = 'applications';

    protected $fillable = [
        'biometric_id',
        'application_type',
        'leave_type',
        'leave_duration',
        'half_day_period',
        'overtime_type',
        'status',
        'date_from',
        'date_to',
        'time_from',
        'time_to',
        'purpose',
    ];

    protected $casts = [
    'date_from' => 'date:Y-m-d',
    'date_to' => 'date:Y-m-d',
];


    // Relationship with Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'biometric_id', 'biometric_id');
    }
}
