<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\Application;
use App\Models\HRMS\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    /**
     * Get all applications for a specific employee
     */
    public function index($biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)->first();

        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        $applications = Application::where('biometric_id', $biometric_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($applications, 200);
    }

    /**
     * Create a new application
     */
    public function store(Request $request, $biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)->first();

        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'application_type' => 'required|string|max:255',
            'leave_type' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'time_from' => 'nullable|date_format:H:i',
            'time_to' => 'nullable|date_format:H:i',
            'purpose' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $application = Application::create([
            'biometric_id' => $biometric_id,
            'application_type' => $request->application_type,
            'leave_type' => $request->leave_type,
            'status' => $request->status ?? 'Pending Supervisor',
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
            'time_from' => $request->time_from,
            'time_to' => $request->time_to,
            'purpose' => $request->purpose,
        ]);

        return response()->json([
            'message' => 'Application created successfully',
            'data' => $application
        ], 201);
    }

    /**
     * Get a specific application
     */
    public function show($id)
    {
        $application = Application::findOrFail($id);
        return response()->json($application, 200);
    }

    /**
     * Update an application
     */
    public function update(Request $request, $id)
    {
        $application = Application::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'application_type' => 'sometimes|required|string|max:255',
            'leave_type' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'date_from' => 'sometimes|required|date',
            'date_to' => 'sometimes|required|date|after_or_equal:date_from',
            'time_from' => 'nullable|date_format:H:i',
            'time_to' => 'nullable|date_format:H:i',
            'purpose' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $application->update($request->all());

        return response()->json([
            'message' => 'Application updated successfully',
            'data' => $application
        ], 200);
    }

    /**
     * Delete an application
     */
    public function destroy($id)
    {
        $application = Application::findOrFail($id);
        $application->delete();

        return response()->json([
            'message' => 'Application deleted successfully'
        ], 200);
    }
}
