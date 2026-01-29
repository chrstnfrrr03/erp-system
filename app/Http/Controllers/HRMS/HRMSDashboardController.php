<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\Employee;
use App\Models\HRMS\EmploymentInformation;
use App\Models\HRMS\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
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
        $employees = Employee::with('employmentInformation.department')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->biometric_id,
                    'name' => trim($employee->first_name . ' ' . ($employee->middle_name ? $employee->middle_name . ' ' : '') . $employee->last_name),
                    'department' => $employee->employmentInformation->department->name ?? 'N/A',
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
        $distribution = DB::table('employment_information')
            ->leftJoin('departments', 'employment_information.department_id', '=', 'departments.id')
            ->select('departments.name as department', DB::raw('count(*) as employees'))
            ->whereNotNull('employment_information.department_id')
            ->groupBy('departments.id', 'departments.name')
            ->orderBy('employees', 'desc')
            ->get();

        return response()->json($distribution);
    }

    /**
     * ✅ Get all employees - WITH ROLE-BASED FILTERING
     */
    public function getEmployees(Request $request)
    {
        $user = Auth::user();

        if (!$user instanceof User) {
            abort(401, 'Unauthenticated.');
        }

        // ✅ EMPLOYEES: Can only view themselves
        if ($user->role === 'employee') {
            $employee = Employee::with(['employmentInformation.department'])
                ->where('user_id', $user->id)
                ->first();

            if (!$employee) {
                // If no employee record linked, try by biometric_id
                $employee = Employee::with(['employmentInformation.department'])
                    ->where('biometric_id', $user->biometric_id)
                    ->first();
            }

            if (!$employee) {
                return response()->json([], 200);
            }

            return response()->json([
                [
                    'id' => $employee->id,
                    'biometric_id' => $employee->biometric_id,
                    'employee_number' => $employee->employee_number,
                    'fullname' => trim($employee->first_name . ' ' . 
                                 ($employee->middle_name ? $employee->middle_name . ' ' : '') . 
                                 $employee->last_name),
                    'department' => $employee->employmentInformation->department->name ?? 'N/A',
                    'position' => $employee->employmentInformation->position ?? 'N/A',
                    'status' => $employee->employmentInformation->employment_classification ?? 'N/A',
                    'hireDate' => $employee->employmentInformation->date_started ?? null,
                ]
            ], 200);
        }

        // ✅ HR, DEPT_HEAD, SYSTEM_ADMIN: Can view all employees
        $query = DB::table('employees')
            ->leftJoin('employment_information', 'employees.id', '=', 'employment_information.employee_id')
            ->leftJoin('departments', 'employment_information.department_id', '=', 'departments.id')
            ->select(
                'employees.id',
                'employees.biometric_id',
                'employees.employee_number',
                DB::raw("CONCAT_WS(' ', employees.first_name, employees.middle_name, employees.last_name) AS fullname"),
                'departments.name as department',
                'employment_information.position',
                'employment_information.employment_classification as status',
                DB::raw('employment_information.date_started as hireDate')
            );

        // ✅ Apply filters if provided
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('employees.first_name', 'like', "%{$search}%")
                  ->orWhere('employees.last_name', 'like', "%{$search}%")
                  ->orWhere('employees.biometric_id', 'like', "%{$search}%")
                  ->orWhere('employees.employee_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('department') && $request->department !== 'All') {
            $query->where('departments.name', $request->department);
        }

        if ($request->has('status') && $request->status !== 'All') {
            $query->where('employment_information.employment_classification', $request->status);
        }

        $employees = $query->orderBy('employees.id', 'DESC')->get();

        return response()->json($employees);
    }
}