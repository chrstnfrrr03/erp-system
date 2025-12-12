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
     * Show single record.
     */
    public function show($id)
    {
        return response()->json(
            LeaveCredits::with('employee')->findOrFail($id)
        );
    }

    /**
     * Store (1 record per employee).
     * Employee MUST already exist from Employment tab.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id'        => 'required|integer|exists:employees,id',

            'vacation_year'      => 'nullable|integer',
            'vacation_credits'   => 'nullable|numeric',

            'sick_year'          => 'nullable|integer',
            'sick_credits'       => 'nullable|numeric',

            'emergency_year'     => 'nullable|integer',
            'emergency_credits'  => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($validated) {

            // Get the employee (already validated it exists)
            $employee = Employee::findOrFail($validated['employee_id']);

            // Create or update leave credits for this employee
            // Convert empty strings to null, but keep 0 as valid
            $record = LeaveCredits::updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'vacation_year'      => $validated['vacation_year'] !== '' && $validated['vacation_year'] !== null ? $validated['vacation_year'] : null,
                    'vacation_credits'   => $validated['vacation_credits'] !== '' && $validated['vacation_credits'] !== null ? $validated['vacation_credits'] : null,

                    'sick_year'          => $validated['sick_year'] !== '' && $validated['sick_year'] !== null ? $validated['sick_year'] : null,
                    'sick_credits'       => $validated['sick_credits'] !== '' && $validated['sick_credits'] !== null ? $validated['sick_credits'] : null,

                    'emergency_year'     => $validated['emergency_year'] !== '' && $validated['emergency_year'] !== null ? $validated['emergency_year'] : null,
                    'emergency_credits'  => $validated['emergency_credits'] !== '' && $validated['emergency_credits'] !== null ? $validated['emergency_credits'] : null,
                ]
            );

            // Standard response
            $response = $record->toArray();
            $response['employee_id']  = $employee->id;
            $response['biometric_id'] = $employee->biometric_id;

            return response()->json($response, 201);
        });
    }

    /**
     * Update record.
     */
    public function update(Request $request, $id)
    {
        $record = LeaveCredits::findOrFail($id);

        $validated = $request->validate([
            'vacation_year'      => 'nullable|integer',
            'vacation_credits'   => 'nullable|numeric',

            'sick_year'          => 'nullable|integer',
            'sick_credits'       => 'nullable|numeric',

            'emergency_year'     => 'nullable|integer',
            'emergency_credits'  => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($record, $validated) {
            $record->update($validated);
            return response()->json(
                $record->fresh()->load('employee')
            );
        });
    }

    /**
     * Delete record.
     */
    public function destroy($id)
    {
        LeaveCredits::findOrFail($id)->delete();
        return response()->json(['message' => 'Record deleted successfully']);
    }
}