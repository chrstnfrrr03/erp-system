<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\Deminimis;
use App\Models\HRMS\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeminimisController extends Controller
{
    /**
     * List all records.
     */
    public function index()
    {
        return response()->json(
            Deminimis::with('employee')->get()
        );
    }

    /**
     * Show single record.
     */
    public function show($id)
    {
        return response()->json(
            Deminimis::with('employee')->findOrFail($id)
        );
    }

    /**
     * Store (1 record per employee).
     * Employee MUST already exist from Employment tab.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id'             => 'required|integer|exists:employees,id',
            'clothing_allowance'      => 'nullable|numeric',
            'meal_allowance'          => 'nullable|numeric',
            'rice_subsidy'            => 'nullable|numeric',
            'transportation_allowance' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($validated) {

            // Get the employee (already validated it exists)
            $employee = Employee::findOrFail($validated['employee_id']);

            // Create or update deminimis for this employee
            // Convert empty strings to null, but keep 0 as valid
            $record = Deminimis::updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'clothing_allowance'      => $validated['clothing_allowance'] !== '' && $validated['clothing_allowance'] !== null ? $validated['clothing_allowance'] : null,
                    'meal_allowance'          => $validated['meal_allowance'] !== '' && $validated['meal_allowance'] !== null ? $validated['meal_allowance'] : null,
                    'rice_subsidy'            => $validated['rice_subsidy'] !== '' && $validated['rice_subsidy'] !== null ? $validated['rice_subsidy'] : null,
                    'transportation_allowance' => $validated['transportation_allowance'] !== '' && $validated['transportation_allowance'] !== null ? $validated['transportation_allowance'] : null,
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
        $record = Deminimis::findOrFail($id);

        $validated = $request->validate([
            'clothing_allowance'      => 'nullable|numeric',
            'meal_allowance'          => 'nullable|numeric',
            'rice_subsidy'            => 'nullable|numeric',
            'transportation_allowance' => 'nullable|numeric',
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
        Deminimis::findOrFail($id)->delete();
        return response()->json(['message' => 'Record deleted successfully']);
    }
}