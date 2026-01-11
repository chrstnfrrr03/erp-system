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
     * List all records.
     */
    public function index()
    {
        return response()->json(
            LeaveCredits::with('employee')->get()
        );
    }

    /**
     * Show single record by ID (apiResource default).
     */
    public function show($id)
    {
        return response()->json(
            LeaveCredits::with('employee')->findOrFail($id)
        );
    }

    /**
     * Show leave credits by biometric_id
     * PHASE 5
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
     * Used during Add Employee
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id'        => 'required|integer|exists:employees,id',

            'vacation_year'      => 'nullable|integer',
            'vacation_credits'   => 'nullable|numeric|min:0',

            'sick_year'          => 'nullable|integer',
            'sick_credits'       => 'nullable|numeric|min:0',

            'emergency_year'     => 'nullable|integer',
            'emergency_credits'  => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {

            $employee = Employee::findOrFail($validated['employee_id']);

            $record = LeaveCredits::updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'vacation_year'      => $validated['vacation_year'] ?? null,
                    'vacation_credits'   => $validated['vacation_credits'] ?? null,

                    'sick_year'          => $validated['sick_year'] ?? null,
                    'sick_credits'       => $validated['sick_credits'] ?? null,

                    'emergency_year'     => $validated['emergency_year'] ?? null,
                    'emergency_credits'  => $validated['emergency_credits'] ?? null,
                ]
            );

            return response()->json([
                'data' => $record->load('employee'),
            ], 201);
        });
    }

    /**
     * Update record by ID (apiResource default)
     */
    public function update(Request $request, $id)
    {
        $record = LeaveCredits::findOrFail($id);

        $validated = $request->validate([
            'vacation_year'      => 'nullable|integer',
            'vacation_credits'   => 'nullable|numeric|min:0',

            'sick_year'          => 'nullable|integer',
            'sick_credits'       => 'nullable|numeric|min:0',

            'emergency_year'     => 'nullable|integer',
            'emergency_credits'  => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($record, $validated) {
            $record->update($validated);

            return response()->json(
                $record->fresh()->load('employee')
            );
        });
    }

    public function updateByEmployee(Request $request, $biometric_id)
{
    $employee = Employee::where('biometric_id', $biometric_id)->firstOrFail();

    $leaveCredits = LeaveCredits::where('employee_id', $employee->id)->firstOrFail();

    $validated = $request->validate([
        'vacation_year'      => 'nullable|integer',
        'vacation_credits'   => 'nullable|numeric|min:0',

        'sick_year'          => 'nullable|integer',
        'sick_credits'       => 'nullable|numeric|min:0',

        'emergency_year'     => 'nullable|integer',
        'emergency_credits'  => 'nullable|numeric|min:0',
    ]);

    $leaveCredits->update($validated);

    return response()->json([
        'message' => 'Leave credits updated successfully',
        'data' => $leaveCredits->fresh()->load('employee'),
    ]);
}

}
