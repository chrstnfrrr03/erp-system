<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\LeaveBalance;
use Illuminate\Http\Request;

class LeaveBalanceController extends Controller
{
    public function index()
    {
        return LeaveBalance::with(['employee'])->paginate(10);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'remaining_days' => 'required|integer|min:0',
        ]);

        return LeaveBalance::create($data);
    }

    public function show($id)
    {
        return LeaveBalance::with(['employee'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $balance = LeaveBalance::findOrFail($id);

        $data = $request->validate([
            'remaining_days' => 'nullable|integer|min:0',
        ]);

        $balance->update($data);

        return $balance;
    }

    public function destroy($id)
    {
        LeaveBalance::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
