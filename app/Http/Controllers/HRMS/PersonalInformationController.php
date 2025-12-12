<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\HRMS\PersonalInformation;
use App\Models\HRMS\Employee;

class PersonalInformationController extends Controller
{
    /**
     * List all personal info records.
     */
    public function index()
    {
        return response()->json(
            PersonalInformation::with('employee')->get()
        );
    }

    /**
     * Show single personal info record.
     */
    public function show($id)
    {
        return response()->json(
            PersonalInformation::with('employee')->findOrFail($id)
        );
    }

    /**
     * Store or update personal info (1 per employee).
     * Employee must already exist — created from EmploymentInformationController.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'        => 'required|string|max:150',
            'middle_name'       => 'nullable|string|max:150',
            'last_name'         => 'required|string|max:150',

            'birthdate'         => 'nullable|date',
            'age'               => 'nullable|integer',
            'birthplace'        => 'nullable|string|max:255',
            'nationality'       => 'nullable|string|max:100',
            'civil_status'      => 'nullable|string|max:50',
            'religion'          => 'nullable|string|max:100',
            'gender'            => 'nullable|string|max:20',

            'present_address'   => 'nullable|string|max:255',
            'home_address'      => 'nullable|string|max:255',

            'email_address'     => 'nullable|email|max:150',
            'mobile_number'     => 'nullable|string|max:20',

            'dependents'        => 'nullable|integer',
            'lodged'            => 'nullable|string|max:10',

            'emergency_contact' => 'nullable|string|max:150',
            'emergency_number'  => 'nullable|string|max:20',

            'shift_id'          => 'nullable|integer|exists:shifts,id',
        ]);

        return DB::transaction(function () use ($validated) {

            /**
             * 1. Find existing employee (NEVER create new employee here)
             */
            $query = Employee::where('first_name', $validated['first_name'])
                ->where('last_name', $validated['last_name']);

            // Handle middle name comparison safely
            if (!empty($validated['middle_name'])) {
                $query->where('middle_name', $validated['middle_name']);
            } else {
                $query->whereNull('middle_name');
            }

            $employee = $query->firstOrFail();

            /**
             * 2. Update employee shift if included
             */
            if (array_key_exists('shift_id', $validated) && $validated['shift_id']) {
                $employee->shift_id = $validated['shift_id'];
                $employee->save();
            }

            /**
             * 3. Create or update personal information
             */
            $record = PersonalInformation::updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'birthdate'         => $validated['birthdate'] ?? null,
                    'age'               => $validated['age'] ?? null,
                    'birthplace'        => $validated['birthplace'] ?? null,
                    'nationality'       => $validated['nationality'] ?? null,
                    'civil_status'      => $validated['civil_status'] ?? null,
                    'religion'          => $validated['religion'] ?? null,
                    'gender'            => $validated['gender'] ?? null,

                    'present_address'   => $validated['present_address'] ?? null,
                    'home_address'      => $validated['home_address'] ?? null,

                    'email_address'     => $validated['email_address'] ?? null,
                    'mobile_number'     => $validated['mobile_number'] ?? null,

                    'dependents'        => $validated['dependents'] ?? null,
                    'lodged'            => $validated['lodged'] ?? null,

                    'emergency_contact' => $validated['emergency_contact'] ?? null,
                    'emergency_number'  => $validated['emergency_number'] ?? null,
                ]
            );

            return response()->json([
                'message' => 'Personal information saved successfully.',
                'employee_id' => $employee->id,
                'record' => $record
            ], 201);
        });
    }

    /**
     * Update personal info
     */
    public function update(Request $request, $id)
    {
        $record = PersonalInformation::findOrFail($id);

        $validated = $request->validate([
            'birthdate'         => 'nullable|date',
            'age'               => 'nullable|integer',
            'birthplace'        => 'nullable|string|max:255',
            'nationality'       => 'nullable|string|max:100',
            'civil_status'      => 'nullable|string|max:50',
            'religion'          => 'nullable|string|max:100',
            'gender'            => 'nullable|string|max:20',

            'present_address'   => 'nullable|string|max:255',
            'home_address'      => 'nullable|string|max:255',

            'email_address'     => 'nullable|email|max:150',
            'mobile_number'     => 'nullable|string|max:20',

            'dependents'        => 'nullable|integer',
            'lodged'            => 'nullable|string|max:10',

            'emergency_contact' => 'nullable|string|max:150',
            'emergency_number'  => 'nullable|string|max:20',
        ]);

        $record->update($validated);

        return response()->json([
            'message' => 'Personal information updated successfully.',
            'record'  => $record->fresh()
        ]);
    }

    /**
     * Delete personal info record
     */
    public function destroy($id)
    {
        PersonalInformation::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Record deleted successfully'
        ]);
    }
}
