<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\Employee;
use App\Models\HRMS\EmploymentInformation;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HRMSDashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        // Total Employees
        $totalEmployees = Employee::count();

        // New Hires (last 30 days)
        $newHires = Employee::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        // Active vs Inactive
        $activeCount = EmploymentInformation::where('employment_status', 'Active')->count();
        $inactiveCount = EmploymentInformation::where('employment_status', '!=', 'Active')->count();

        return response()->json([
            'totalEmployees' => $totalEmployees,
            'newHires' => $newHires,
            'activeInactive' => [
                'active' => $activeCount,
                'inactive' => $inactiveCount,
            ],
        ]);
    }

    /**
     * Get recent employees (last 10)
     */
    public function getRecentEmployees()
    {
        $employees = Employee::with('employmentInformation')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->biometric_id,
                    'name' => trim($employee->first_name . ' ' . ($employee->middle_name ? $employee->middle_name . ' ' : '') . $employee->last_name),
                    'department' => $employee->employmentInformation->department ?? 'N/A',
                    'position' => $employee->employmentInformation->position ?? 'N/A',
                    'status' => $employee->employmentInformation->employment_status ?? 'N/A',
                ];
            });

        return response()->json($employees);
    }

    /**
     * Get department distribution
     */
    public function getDepartmentDistribution()
    {
        $distribution = EmploymentInformation::select('department', DB::raw('count(*) as employees'))
            ->whereNotNull('department')
            ->groupBy('department')
            ->orderBy('employees', 'desc')
            ->get();

        return response()->json($distribution);
    }

    /**
     * Get all employees for main table
     */
    public function getEmployees()
{
    $employees = DB::table('employees')
        ->leftJoin('employment_information', 'employees.id', '=', 'employment_information.employee_id')
        ->leftJoin('personal_information', 'employees.id', '=', 'personal_information.employee_id')
        ->select(
            'employees.id',
            'employees.biometric_id',
            DB::raw("CONCAT_WS(' ', employees.first_name, employees.middle_name, employees.last_name) AS fullname"),
            'employment_information.department',
            'employment_information.position',

            
            'employment_information.employment_classification as status',

            DB::raw('employment_information.date_started as hireDate')
        )
        ->orderBy('employees.id', 'DESC')
        ->get();

    return response()->json($employees);
}

}
