<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\LeaveRequest;
use App\Models\HRMS\Employee;
use App\Models\HRMS\LeaveType;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function index()
    {
        return LeaveRequest::with(['employee', 'leaveType'])->paginate(10);
    }

    public function store(Request $request)
{
    $data = $request->validate([
        'employee_id' => 'required|exists:employees,id',
        'leave_type_id' => 'required|exists:leave_types,id',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'reason' => 'nullable|string',
        'status' => 'nullable|string'
    ]);

    if (!isset($data['status'])) {
        $data['status'] = 'pending';
    }

    return LeaveRequest::create($data);
}


    public function show($id)
    {
        return LeaveRequest::with(['employee', 'leaveType'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $leave = LeaveRequest::findOrFail($id);

        $data = $request->validate([
            'leave_type_id' => 'nullable|exists:leave_types,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $leave->update($data);

        return $leave;
    }

    public function destroy($id)
    {
        LeaveRequest::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
