<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\Employee;

class EmployeeController extends Controller
{
    public function index()
    {
        return response()->json(Employee::all());
    }
}
