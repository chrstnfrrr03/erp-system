<?php

namespace App\Models\HRMS;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\HRMS\Shift;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';

    protected $fillable = [
        'biometric_id',
        'employee_number',

        // Full name (moved from employment info)
        'first_name',
        'middle_name',
        'last_name',

        // Shift
        'shift_id',
    ];

    protected $casts = [
        'biometric_id' => 'string',
        'employee_number' => 'string',
        'shift_id' => 'integer',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    // -----------------------------
    // Relationships
    // -----------------------------

    public function employmentInformation()
{
    return $this->hasOne(EmploymentInformation::class, 'employee_id', 'id');
}


    public function personalInformation()
{
    return $this->hasOne(PersonalInformation::class, 'employee_id');
}

    public function accountInformation()
    {
        return $this->hasOne(AccountInformation::class);
    }

    public function leaveCredits()
    {
        return $this->hasOne(LeaveCredits::class);
    }

    public function deminimis()
    {
        return $this->hasOne(Deminimis::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
