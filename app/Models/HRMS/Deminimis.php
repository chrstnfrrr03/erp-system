<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\HRMS\Employee;

class Deminimis extends Model
{
    use HasFactory;

    protected $table = 'deminimis';

    protected $fillable = [
        'employee_id',
        'clothing_allowance',
        'meal_allowance',
        'rice_subsidy',
        'transportation_allowance',
    ];

    protected $casts = [
        'clothing_allowance' => 'decimal:2',
        'meal_allowance' => 'decimal:2',
        'rice_subsidy' => 'decimal:2',
        'transportation_allowance' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
