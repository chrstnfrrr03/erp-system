<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HRMS\Employee;

class EmployeeController extends Controller
{
    // -------------------------------------------------------
    // LIST ALL EMPLOYEES
    // -------------------------------------------------------
    public function index()
    {
        return Employee::all();
    }

    // -------------------------------------------------------
    // CREATE NEW EMPLOYEE
    // -------------------------------------------------------
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_no'   => 'required|unique:employees,employee_no',
            'first_name'    => 'required',
            'middle_name'   => 'nullable',
            'last_name'     => 'required',
            'gender'        => 'nullable',

            // Contact
            'email'         => 'nullable|email|unique:employees,email',
            'mobile_number' => 'nullable',

            // Employment
            'department'    => 'nullable',
            'position'      => 'nullable',
            'date_started'  => 'nullable|date',
            'date_ended'    => 'nullable|date',
            'user_id'       => 'nullable|exists:users,id',
        ]);

        $employee = Employee::create($validated);

        return response()->json([
            'message' => 'Employee created successfully',
            'data' => $employee
        ], 201);
    }

    // -------------------------------------------------------
    // SHOW SINGLE EMPLOYEE
    // -------------------------------------------------------
    public function show($id)
    {
        $employee = Employee::findOrFail($id);
        return response()->json($employee);
    }

    // -------------------------------------------------------
    // UPDATE EMPLOYEE
    // -------------------------------------------------------
    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'employee_no'   => 'nullable|unique:employees,employee_no,' . $id,
            'first_name'    => 'nullable',
            'middle_name'   => 'nullable',
            'last_name'     => 'nullable',
            'gender'        => 'nullable',

            'email'         => 'nullable|email|unique:employees,email,' . $id,
            'mobile_number' => 'nullable',

            'department'    => 'nullable',
            'position'      => 'nullable',
            'date_started'  => 'nullable|date',
            'date_ended'    => 'nullable|date',
            'user_id'       => 'nullable|exists:users,id',
        ]);

        $employee->update($validated);

        return response()->json([
            'message' => 'Employee updated successfully',
            'data' => $employee
        ]);
    }

    // -------------------------------------------------------
    // DELETE EMPLOYEE
    // -------------------------------------------------------
    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();

        return response()->json([
            'message' => 'Employee deleted successfully'
        ]);
    }
}
