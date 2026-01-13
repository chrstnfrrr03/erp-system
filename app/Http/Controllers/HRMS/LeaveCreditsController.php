<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HRMS\LeaveCredits;
use App\Models\HRMS\Employee;
use Illuminate\Support\Facades\DB;

class LeaveCreditsController extends Controller
{
    /**
     * List all records
     */
    public function index()
    {
        return response()->json(
            LeaveCredits::with('employee')->get()
        );
    }

    /**
     * Show single record by ID
     */
    public function show($id)
    {
        return response()->json(
            LeaveCredits::with('employee')->findOrFail($id)
        );
    }

    /**
     * Show leave credits by biometric_id
     */
    public function showByEmployee($biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)->firstOrFail();

        return response()->json(
            LeaveCredits::where('employee_id', $employee->id)
                ->with('employee')
                ->firstOrFail()
        );
    }

    /**
     * Store (1 record per employee only)
     * Used during Add Employee / Add Credit
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|integer|exists:employees,id',

            'vacation_year' => 'nullable|integer',
            'vacation_total' => 'nullable|numeric|min:0',

            'sick_year' => 'nullable|integer',
            'sick_total' => 'nullable|numeric|min:0',

            'emergency_year' => 'nullable|integer',
            'emergency_total' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {

            $record = LeaveCredits::updateOrCreate(
                ['employee_id' => $validated['employee_id']],
                [
                    // Vacation
                    'vacation_year' => $validated['vacation_year'] ?? null,
                    'vacation_total' => $validated['vacation_total'] ?? null,
                    'vacation_credits' => $validated['vacation_total'] ?? null,

                    // Sick
                    'sick_year' => $validated['sick_year'] ?? null,
                    'sick_total' => $validated['sick_total'] ?? null,
                    'sick_credits' => $validated['sick_total'] ?? null,

                    // Emergency
                    'emergency_year' => $validated['emergency_year'] ?? null,
                    'emergency_total' => $validated['emergency_total'] ?? null,
                    'emergency_credits' => $validated['emergency_total'] ?? null,
                ]
            );

            return response()->json([
                'data' => $record->fresh()->load('employee'),
            ], 201);
        });
    }

    /**
     * Update by record ID (admin edit)
     */
    public function update(Request $request, $id)
    {
        $record = LeaveCredits::findOrFail($id);

        $validated = $request->validate([
            'vacation_year' => 'nullable|integer',
            'vacation_total' => 'nullable|numeric|min:0',
            'vacation_credits' => 'nullable|numeric|min:0',

            'sick_year' => 'nullable|integer',
            'sick_total' => 'nullable|numeric|min:0',
            'sick_credits' => 'nullable|numeric|min:0',

            'emergency_year' => 'nullable|integer',
            'emergency_total' => 'nullable|numeric|min:0',
            'emergency_credits' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($record, $validated) {
            $record->update($validated);

            return response()->json(
                $record->fresh()->load('employee')
            );
        });
    }

    /**
     * Update by biometric_id (used by your UI)
     */
    public function updateByEmployee(Request $request, $biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)->firstOrFail();
        $leaveCredits = LeaveCredits::where('employee_id', $employee->id)->firstOrFail();

        $validated = $request->validate([
            'vacation_year' => 'nullable|integer',
            'vacation_total' => 'nullable|numeric|min:0',
            'vacation_credits' => 'nullable|numeric|min:0',

            'sick_year' => 'nullable|integer',
            'sick_total' => 'nullable|numeric|min:0',
            'sick_credits' => 'nullable|numeric|min:0',

            'emergency_year' => 'nullable|integer',
            'emergency_total' => 'nullable|numeric|min:0',
            'emergency_credits' => 'nullable|numeric|min:0',
        ]);

        $leaveCredits->update($validated);

        return response()->json([
            'message' => 'Leave credits updated successfully',
            'data' => $leaveCredits->fresh()->load('employee'),
        ]);
    }
}
