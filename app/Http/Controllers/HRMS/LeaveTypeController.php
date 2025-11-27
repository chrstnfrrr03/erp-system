<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;  
use App\Models\HRMS\LeaveType;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    // Show list
    public function index()
    {
        $leaveTypes = LeaveType::orderBy('name', 'asc')->get();
        return response()->json($leaveTypes);
    }

    // Store new leave type
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'default_days'  => 'required|integer|min:0',
            'description'   => 'nullable|string',
            'is_active'     => 'boolean',
        ]);

        $leaveType = LeaveType::create($validated);

        return response()->json([
            'message' => 'Leave type created successfully.',
            'data' => $leaveType
        ], 201);
    }

    // Show single leave type
    public function show($id)
    {
        $leaveType = LeaveType::findOrFail($id);
        return response()->json($leaveType);
    }

    // Update leave type
    public function update(Request $request, $id)
    {
        $leaveType = LeaveType::findOrFail($id);

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'default_days'  => 'required|integer|min:0',
            'description'   => 'nullable|string',
            'is_active'     => 'boolean',
        ]);

        $leaveType->update($validated);

        return response()->json([
            'message' => 'Leave type updated successfully.',
            'data' => $leaveType
        ]);
    }

    // Delete leave type
    public function destroy($id)
    {
        $leaveType = LeaveType::findOrFail($id);
        $leaveType->delete();

        return response()->json([
            'message' => 'Leave type deleted successfully.'
        ]);
    }
}
