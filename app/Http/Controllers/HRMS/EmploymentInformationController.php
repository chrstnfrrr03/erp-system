<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use App\Models\HRMS\EmploymentInformation;
use App\Models\HRMS\Employee;
use App\Models\HRMS\PersonalInformation;
use App\Models\HRMS\AccountInformation;
use App\Models\HRMS\Department;

class EmploymentInformationController extends Controller
{
    /**
     * Generate biometric ID for attendance/access control
     * Format: JD-12345 (initials + random number)
     */
    private function createBiometricsData(string $firstName, string $lastName): string
    {
        $firstInitial = strtoupper(substr($firstName, 0, 1));
        $lastInitial  = strtoupper(substr($lastName, 0, 1));

        $middleInitial = '';
        if (str_contains($firstName, ' ')) {
            $parts = explode(' ', $firstName);
            $firstInitial = strtoupper(substr($parts[0], 0, 1));
            $middleInitial = strtoupper(substr(end($parts), 0, 1));
        }

        $initials = preg_replace('/\s+/', '', $firstInitial . $middleInitial . $lastInitial);

        do {
            $random = rand(10000, 99999);
            $biometricId = $initials . '-' . $random;
        } while (Employee::where('biometric_id', $biometricId)->exists());

        return $biometricId;
    }

    /**
     * Generate department-based employee number
     * Format: DEPT-0001, DEPT-0002, etc.
     */
    private function createEmployeeNumber(int $departmentId): string
    {
        $department = Department::findOrFail($departmentId);

        // Get department prefix (e.g., "IT", "HR", "SALES")
        $prefix = $department->prefix ?? strtoupper(substr($department->name, 0, 3));

        // Find the highest employee number for this department
        $lastEmployee = Employee::whereHas('employmentInformation', function ($query) use ($departmentId) {
            $query->where('department_id', $departmentId);
        })
            ->where('employee_number', 'LIKE', $prefix . '-%')
            ->orderByRaw('CAST(SUBSTRING(employee_number, ' . (strlen($prefix) + 2) . ') AS UNSIGNED) DESC')
            ->first();

        if ($lastEmployee) {
            // Extract the number part and increment
            $lastNumber = intval(substr($lastEmployee->employee_number, strlen($prefix) + 1));
            $nextNumber = $lastNumber + 1;
        } else {
            // First employee in this department
            $nextNumber = 1;
        }

        // Format: DEPT-0001
        return $prefix . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public function index()
    {
        return response()->json(
            EmploymentInformation::with(['employee.shift', 'department'])->get()
        );
    }

    public function show($id)
    {
        return response()->json(
            EmploymentInformation::with(['employee.shift', 'department'])->findOrFail($id)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // EMPLOYEE NAME
            'first_name'    => 'required|string|max:150',
            'middle_name'   => 'nullable|string|max:150',
            'last_name'     => 'required|string|max:150',

            'shift_id'      => 'nullable|integer|exists:shifts,id',

            // EMPLOYMENT FIELDS
            'department_id'     => 'required|integer|exists:departments,id',
            'position'          => 'required|string|max:150',
            'department_head'   => 'nullable|string|max:150',
            'supervisor'        => 'nullable|string|max:150',
            'job_location'      => 'nullable|string|max:150',
            'employee_type'     => 'required|string|max:100',
            'employment_status' => 'required|string|max:100',
            'employment_classification' => 'nullable|string|max:150',

            'company_email'     => 'nullable|email|max:150',
            'rate'              => 'nullable|numeric',
            'rate_type'         => 'nullable|string|max:50',
            'date_started'      => 'nullable|date',
            'date_ended'        => 'nullable|date',
        ]);

        return DB::transaction(function () use ($validated) {

            // SEARCH IF EMPLOYEE EXISTS BY NAME
            $existingEmployee = Employee::where('first_name', $validated['first_name'])
                ->where('last_name', $validated['last_name'])
                ->where('middle_name', $validated['middle_name'] ?? null)
                ->first();

            if ($existingEmployee) {
                $employee = $existingEmployee;
            } else {
                // GENERATE BIOMETRIC ID (for attendance/access control)
                $biometric_id = $this->createBiometricsData(
                    $validated['first_name'],
                    $validated['last_name']
                );

                // GENERATE EMPLOYEE NUMBER based on department
                $employee_number = $this->createEmployeeNumber($validated['department_id']);

                $employee = Employee::create([
                    'biometric_id'    => $biometric_id,
                    'employee_number' => $employee_number,
                    'first_name'      => $validated['first_name'],
                    'middle_name'     => $validated['middle_name'] ?? null,
                    'last_name'       => $validated['last_name'],
                    'shift_id'        => $validated['shift_id'] ?? null,
                ]);
            }

            // CREATE OR UPDATE EMPLOYMENT RECORD
            $record = EmploymentInformation::updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'department_id'        => $validated['department_id'],
                    'position'             => $validated['position'],
                    'department_head'      => $validated['department_head'] ?? null,
                    'supervisor'           => $validated['supervisor'] ?? null,
                    'job_location'         => $validated['job_location'] ?? null,
                    'employee_type'        => $validated['employee_type'],
                    'employment_status'    => $validated['employment_status'],
                    'employment_classification' => $validated['employment_classification'] ?? null,
                    'company_email'        => $validated['company_email'] ?? null,
                    'rate'                 => $validated['rate'] ?? null,
                    'rate_type'            => $validated['rate_type'] ?? null,
                    'date_started'         => $validated['date_started'] ?? null,
                    'date_ended'           => $validated['date_ended'] ?? null,
                ]
            );

            return response()->json([
                'message'         => 'Employment info saved successfully.',
                'employee_id'     => $employee->id,
                'biometric_id'    => $employee->biometric_id,
                'employee_number' => $employee->employee_number, // NOW SHOWS DEPT-BASED NUMBER
                'employee'        => $employee,
                'employment'      => $record,
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $record = EmploymentInformation::findOrFail($id);

        $validated = $request->validate([
            'department_id'     => 'nullable|integer|exists:departments,id',
            'position'          => 'nullable|string|max:150',
            'department_head'   => 'nullable|string|max:150',
            'supervisor'        => 'nullable|string|max:150',
            'job_location'      => 'nullable|string|max:150',
            'employee_type'     => 'nullable|string|max:100',
            'employment_status' => 'nullable|string|max:100',
            'employment_classification' => 'nullable|string|max:150',
            'company_email'     => 'nullable|email|max:150',
            'rate'              => 'nullable|numeric',
            'rate_type'         => 'nullable|string|max:50',
            'date_started'      => 'nullable|date',
            'date_ended'        => 'nullable|date',
            'shift_id'          => 'nullable|integer|exists:shifts,id',
        ]);

        $record->update($validated);

        // UPDATE EMPLOYEE SHIFT
        if (array_key_exists('shift_id', $validated)) {
            $employee = $record->employee;
            if ($employee) {
                $employee->shift_id = $validated['shift_id'];
                $employee->save();
            }
        }

        return response()->json(
            $record->fresh()->load(['employee.shift', 'department'])
        );
    }

    public function destroy($id)
    {
        EmploymentInformation::findOrFail($id)->delete();
        return response()->json(['message' => 'Record deleted successfully']);
    }


    /**
     * GET FULL EMPLOYEE DETAILS INCLUDING ALL TABLES
     */
    public function getEmployeeDetails($biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)
            ->with([
                'employmentInformation.department',
                'personalInformation',
                'accountInformation',
                'leaveCredits',
                'deminimis'
            ])
            ->firstOrFail();

        // BUILD RESPONSE
        return response()->json([
            'biometric_id' => $employee->biometric_id,
            'employee_number' => $employee->employee_number,

            'employment_information' => [
                'department_id' => $employee->employmentInformation->department_id ?? null,
                'position' => $employee->employmentInformation->position ?? null,
            ],

            'shift' => [
                'shift_id' => $employee->shift_id,
            ],

            'fullname' => trim(
                $employee->first_name . ' ' .
                    ($employee->middle_name ? $employee->middle_name . ' ' : '') .
                    $employee->last_name
            ),

            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,

            'department' => $employee->employmentInformation->department->name ?? 'N/A',
            'position' => $employee->employmentInformation->position ?? 'N/A',
            'department_head' => $employee->employmentInformation->department_head ?? 'N/A',
            'supervisor' => $employee->employmentInformation->supervisor ?? 'N/A',
            'job_location' => $employee->employmentInformation->job_location ?? 'N/A',
            'employment_status' => $employee->employmentInformation->employment_status ?? 'N/A',
            'employment_classification' => $employee->employmentInformation->employment_classification ?? 'N/A',
            'employee_type' => $employee->employmentInformation->employee_type ?? 'N/A',

            'company_email' => $employee->employmentInformation->company_email ?? 'N/A',
            'rate' => $employee->employmentInformation->rate ?? '0.00',
            'rate_type' => $employee->employmentInformation->rate_type ?? 'N/A',
            'date_started' => $employee->employmentInformation->date_started ?? 'N/A',
            'date_ended' => $employee->employmentInformation->date_ended ?? 'N/A',

            // PERSONAL INFO
            'mobile_number' => $employee->personalInformation->mobile_number ?? 'N/A',
            'birthdate' => $employee->personalInformation->birthdate ?? null,
            'age' => $employee->personalInformation->age ?? null,
            'birthplace' => $employee->personalInformation->birthplace ?? null,
            'nationality' => $employee->personalInformation->nationality ?? null,
            'civil_status' => $employee->personalInformation->civil_status ?? null,
            'religion' => $employee->personalInformation->religion ?? null,
            'gender' => $employee->personalInformation->gender ?? null,
            'present_address' => $employee->personalInformation->present_address ?? null,
            'home_address' => $employee->personalInformation->home_address ?? null,
            'email_address' => $employee->personalInformation->email_address ?? null,
            'dependents' => $employee->personalInformation->dependents ?? null,
            'lodged' => $employee->personalInformation->lodged ?? null,
            'emergency_contact' => $employee->personalInformation->emergency_contact ?? null,
            'emergency_number' => $employee->personalInformation->emergency_number ?? null,

            'personal_info' => $employee->personalInformation
                ? ['id' => $employee->personalInformation->id]
                : null,

            // ACCOUNT INFO - ADD NASFUND_MEMBER HERE
            'nasfund_member' => $employee->accountInformation->nasfund_member ?? 'No', // ADD THIS
            'nasfund_number' => $employee->accountInformation->nasfund_number ?? null,
            'tin_number' => $employee->accountInformation->tin_number ?? null,
            'work_permit_number' => $employee->accountInformation->work_permit_number ?? null,
            'work_permit_expiry' => $employee->accountInformation->work_permit_expiry ?? null,
            'visa_number' => $employee->accountInformation->visa_number ?? null,
            'visa_expiry' => $employee->accountInformation->visa_expiry ?? null,
            'account_number' => $employee->accountInformation->account_number ?? null,
            'account_name' => $employee->accountInformation->account_name ?? null,
            'bank_name' => $employee->accountInformation->bank_name ?? null,
            'bsb_code' => $employee->accountInformation->bsb_code ?? null,

            // LEAVE
            'vacation_year' => $employee->leaveCredits->vacation_year ?? null,
            'vacation_credits' => $employee->leaveCredits->vacation_credits ?? 0,
            'sick_year' => $employee->leaveCredits->sick_year ?? null,
            'sick_credits' => $employee->leaveCredits->sick_credits ?? 0,
            'emergency_year' => $employee->leaveCredits->emergency_year ?? null,
            'emergency_credits' => $employee->leaveCredits->emergency_credits ?? 0,

            // DEMINIMIS
            'clothing_allowance' => $employee->deminimis->clothing_allowance ?? 0,
            'meal_allowance' => $employee->deminimis->meal_allowance ?? 0,
            'rice_subsidy' => $employee->deminimis->rice_subsidy ?? 0,
            'transportation_allowance' => $employee->deminimis->transportation_allowance ?? 0,

            // PROFILE PICTURE
            'profile_picture' => $employee->profile_picture
                ? asset('storage/' . $employee->profile_picture)
                : null,
        ]);
    }


    /**
     * UPDATE PROFILE (with image upload)
     */
    public function updateProfile(Request $request, $biometric_id)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'middle_name' => 'nullable|string',

            'employee_type' => 'nullable|string',
            'rate_type' => 'nullable|string',
            'department_id' => 'nullable|integer|exists:departments,id',
            'position' => 'nullable|string',
            'employment_classification' => 'nullable|string',
            'rate' => 'nullable|numeric',

            'date_started' => 'nullable|date',
            'date_ended' => 'nullable|date',

            'department_head' => 'nullable|string',
            'supervisor' => 'nullable|string',
            'job_location' => 'nullable|string',
            'company_email' => 'nullable|email',

            // ACCOUNT
            'nasfund_member' => 'nullable|string|in:Yes,No',
            'nasfund_number' => 'nullable|string',
            'tin_number' => 'nullable|string',
            'account_number' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'account_name' => 'nullable|string',
            'bsb_code' => 'nullable|string',

            'work_permit_number' => 'nullable|string',
            'work_permit_expiry' => 'nullable|date',
            'visa_number' => 'nullable|string',
            'visa_expiry' => 'nullable|date',

            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'shift_id' => 'nullable|integer|exists:shifts,id'
        ]);

        DB::beginTransaction();

        try {
            $employee = Employee::where('biometric_id', $biometric_id)->firstOrFail();

            // UPDATE employee table
            $employee->update([
                'first_name'  => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name'   => $request->last_name,
                'shift_id'    => $request->shift_id
            ]);

            // PERSONAL INFO
            $personal = PersonalInformation::where('employee_id', $employee->id)->firstOrFail();
            $personal->update([
                'first_name'  => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name'   => $request->last_name
            ]);

            // EMPLOYMENT INFO - ADD DATE FIELDS HERE
            $employment = EmploymentInformation::where('employee_id', $employee->id)->firstOrFail();
            $employment->update([
                'employee_type'             => $request->employee_type,
                'rate_type'                 => $request->rate_type,
                'rate'                      => $request->rate,
                'department_id'             => $request->department_id,
                'position'                  => $request->position,
                'employment_classification' => $request->employment_classification,
                'department_head'           => $request->department_head,
                'supervisor'                => $request->supervisor,
                'job_location'              => $request->job_location,
                'company_email'             => $request->company_email,
                'date_started'              => $request->date_started, // ADD THIS
                'date_ended'                => $request->date_ended,   // ADD THIS
            ]);

            // ACCOUNT INFO - ADD NASFUND_MEMBER HERE
            $account = AccountInformation::where('employee_id', $employee->id)->firstOrFail();
            $account->update([
                'nasfund_member'     => $request->nasfund_member, // ADD THIS
                'nasfund_number'     => $request->nasfund_number,
                'tin_number'         => $request->tin_number,
                'account_number'     => $request->account_number,
                'bank_name'          => $request->bank_name,
                'account_name'       => $request->account_name,
                'bsb_code'           => $request->bsb_code,
                'work_permit_number' => $request->work_permit_number,
                'work_permit_expiry' => $request->work_permit_expiry,
                'visa_number'        => $request->visa_number,
                'visa_expiry'        => $request->visa_expiry,
            ]);

            // PROFILE PICTURE
            if ($request->hasFile('profile_picture')) {

                if (
                    $employee->profile_picture &&
                    Storage::exists('public/' . $employee->profile_picture)
                ) {
                    Storage::delete('public/' . $employee->profile_picture);
                }

                $path = $request->file('profile_picture')->store('profile_pictures', 'public');

                $employee->profile_picture = $path;
                $employee->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Profile updated successfully.',
                'profile_picture' => $employee->profile_picture
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
