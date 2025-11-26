<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\LeaveType;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    /**
     * Display all leave types.
     */
    public function index()
    {
        return response()->json(LeaveType::all());
    }

    /**
     * Store a new leave type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'days_allowed' => 'required|integer|min:1',
        ]);

        $leaveType = LeaveType::create($validated);

        return response()->json([
            'message' => 'Leave type created successfully',
            'data'    => $leaveType
        ], 201);
    }

    /**
     * Show a specific leave type.
     */
    public function show($id)
    {
        $leaveType = LeaveType::findOrFail($id);

        return response()->json($leaveType, 200);
    }

    /**
     * Update an existing leave type.
     */
    public function update(Request $request, $id)
    {
        $leaveType = LeaveType::findOrFail($id);

        $validated = $request->validate([
            'name'         => 'sometimes|required|string|max:255',
            'description'  => 'nullable|string',
            'days_allowed' => 'sometimes|required|integer|min:1',
        ]);

        $leaveType->update($validated);

        return response()->json([
            'message' => 'Leave type updated successfully',
            'data'    => $leaveType
        ], 200);
    }

    /**
     * Delete a leave type.
     */
    public function destroy($id)
    {
        $leaveType = LeaveType::findOrFail($id);
        $leaveType->delete();

        return response()->json([
            'message' => 'Leave type deleted successfully'
        ], 200);
    }
}
