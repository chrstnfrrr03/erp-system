<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HRMS\EmploymentDetail;
use App\Models\HRMS\Employee;

class EmploymentDetailController extends Controller
{
    // Show employment detail by employee ID
    public function show($id)
    {
        $employee = Employee::with('employmentDetail')->findOrFail($id);

        return response()->json([
            'employment_detail' => $employee->employmentDetail
        ], 200);
    }

    // Update or create employment detail
    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        $data = $request->validate([
            'department' => 'nullable|string',
            'position' => 'nullable|string',
            'employment_type' => 'nullable|string',
            'employment_status' => 'nullable|string',
            'date_hired' => 'nullable|date',
            'date_terminated' => 'nullable|date',
            'rate' => 'nullable|numeric',
            'rate_type' => 'nullable|string',
        ]);

        $detail = EmploymentDetail::updateOrCreate(
            ['employee_id' => $employee->id],
            $data
        );

        return response()->json([
            'message' => 'Employment detail updated successfully',
            'employment_detail' => $detail
        ], 200);
    }
}
