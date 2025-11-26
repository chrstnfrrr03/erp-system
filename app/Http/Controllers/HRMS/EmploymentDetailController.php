<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\EmploymentDetail;
use App\Models\HRMS\Employee;
use Illuminate\Http\Request;

class EmploymentDetailController extends Controller
{
    public function index()
    {
        return EmploymentDetail::with('employee')->paginate(10);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'position' => 'required|string',
            'department' => 'required|string',
            'date_hired' => 'required|date',
            'employment_status' => 'required|string',
        ]);

        return EmploymentDetail::create($data);
    }

    public function show($id)
    {
        return EmploymentDetail::with('employee')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $detail = EmploymentDetail::findOrFail($id);

        $data = $request->validate([
            'position' => 'nullable|string',
            'department' => 'nullable|string',
            'date_hired' => 'nullable|date',
            'employment_status' => 'nullable|string',
        ]);

        $detail->update($data);

        return $detail;
    }

    public function destroy($id)
    {
        EmploymentDetail::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
