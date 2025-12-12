<?php

namespace App\Http\Controllers;

use App\Models\HRMS\Employee;
use App\Models\HRMS\EmploymentInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            "employees"      => Employee::count(),
            "payroll"        => 0, 
            "inventory"      => 0, 
            "lowStock"       => 0,
            "systemUsers"    => DB::table('users')->count(),
            "recentActivity" => "System loaded successfully."
        ]);
    }
}
