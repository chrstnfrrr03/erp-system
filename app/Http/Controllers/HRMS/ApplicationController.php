<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Models\HRMS\Application;
use App\Models\HRMS\Employee;
use App\Models\HRMS\LeaveCredits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ApplicationController extends Controller
{
    public function index($biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        return response()->json(
            Application::where('biometric_id', $biometric_id)
                ->orderBy('created_at', 'desc')
                ->get(),
            200
        );
    }

    /**
     * Create new application
     * ✔ Deduct immediately IF status is Approved
     * ✔ Supports Half-Day Leave
     * ✔ Supports Holiday Leave
     */
    public function store(Request $request, $biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'application_type' => 'required|string',

            'leave_type' => 'nullable|required_if:application_type,Leave|string',
            'leave_duration' => 'nullable|string', // Full Day or Half Day
            'half_day_period' => 'nullable|string', // AM or PM

            'overtime_type' => 'nullable|string', // Regular OT, Holiday OT, Rest Day OT

            'date_from' => 'required|date',
            'date_to'   => 'required|date|after_or_equal:date_from',

            'time_from' => 'nullable|date_format:H:i',
            'time_to'   => 'nullable|date_format:H:i',

            'status'  => 'nullable|string',
            'purpose' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        return DB::transaction(function () use ($request, $biometric_id, $employee) {

            // ✅ Build the data array explicitly
            $data = [
                'biometric_id'     => $biometric_id,
                'application_type' => $request->application_type,
                'date_from'        => $request->date_from,
                'date_to'          => $request->date_to,
                'status'           => $request->status ?? 'Pending Supervisor',
                'purpose'          => $request->purpose,
            ];

            // ✅ Only add Leave-specific fields if it's a Leave application
            if ($request->application_type === 'Leave') {
                $data['leave_type'] = $request->leave_type;
                $data['leave_duration'] = $request->leave_duration ?? 'Full Day';
                $data['half_day_period'] = $request->half_day_period;
            }

            // ✅ Only add Overtime-specific fields if it's an Overtime application
            if ($request->application_type === 'Overtime') {
                $data['overtime_type'] = $request->overtime_type;
            }

            // ✅ Add time fields if they exist
            $data['time_from'] = $request->time_from;
            $data['time_to'] = $request->time_to;

            $application = Application::create($data);

            // 🔽 DEDUCT if already approved
            if (
                strtolower($application->application_type) === 'leave' &&
                $application->status === 'Approved' &&
                !in_array($application->leave_type, ['Unpaid Leave'])
            ) {
                $this->processDeduction($application, $employee);
            }

            return response()->json([
                'message' => 'Application created successfully',
                'data'    => $application
            ], 201);
        });
    }

    public function show($id)
    {
        return response()->json(Application::findOrFail($id), 200);
    }

    /**
     * Update application
     * ✔ Deduct on approve (supports half-day)
     * ✔ Restore on reject/cancel (supports half-day)
     */
    public function update(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {

            $application = Application::findOrFail($id);
            $oldStatus = $application->status;

            $application->update($request->all());
            $newStatus = $application->status;

            if (strtolower($application->application_type) !== 'leave') {
                return response()->json(['message' => 'Updated'], 200);
            }

            if ($application->leave_type === 'Unpaid Leave') {
                return response()->json(['message' => 'Updated'], 200);
            }


            $employee = Employee::where('biometric_id', $application->biometric_id)->firstOrFail();

            if ($oldStatus !== 'Approved' && $newStatus === 'Approved') {
                $this->processDeduction($application, $employee);
            }

            if ($oldStatus === 'Approved' && in_array($newStatus, ['Rejected', 'Cancelled'])) {
                $this->processRestore($application, $employee);
            }

            return response()->json([
                'message' => 'Application updated successfully',
                'data' => $application->fresh()
            ], 200);
        });
    }

    /**
     * Shared deduction logic
     * ✔ Supports Half-Day Leave (0.5 days)
     */
    private function processDeduction(Application $application, Employee $employee)
    {
        $credits = LeaveCredits::where('employee_id', $employee->id)->firstOrFail();

        // Calculate days
        if ($application->leave_duration === 'Half Day') {
            $days = 0.5; // Half day = 0.5 days
        } else {
            $days = Carbon::parse($application->date_from)
                ->diffInDays(Carbon::parse($application->date_to)) + 1;
        }

        $column = match (strtolower($application->leave_type)) {
            'vacation', 'vacation leave'   => 'vacation_credits',
            'sick', 'sick leave'           => 'sick_credits',
            'emergency', 'emergency leave' => 'emergency_credits',
            default                        => null,
        };

        if (!$column) return;

        if ($credits->$column < $days) {
            abort(422, 'Insufficient leave credits');
        }

        $credits->$column -= $days;
        $credits->save();
    }

    /**
     * Restore credits
     * ✔ Supports Half-Day Leave (0.5 days)
     */
    private function processRestore(Application $application, Employee $employee)
    {
        $credits = LeaveCredits::where('employee_id', $employee->id)->firstOrFail();

        // Calculate days
        if ($application->leave_duration === 'Half Day') {
            $days = 0.5; // Half day = 0.5 days
        } else {
            $days = Carbon::parse($application->date_from)
                ->diffInDays(Carbon::parse($application->date_to)) + 1;
        }

        $column = match (strtolower($application->leave_type)) {
            'vacation', 'vacation leave'   => 'vacation_credits',
            'sick', 'sick leave'           => 'sick_credits',
            'emergency', 'emergency leave' => 'emergency_credits',
            default                        => null,
        };

        if (!$column) return;

        $credits->$column += $days;
        $credits->save();
    }

    public function destroy($id)
    {
        Application::findOrFail($id)->delete();

        return response()->json(['message' => 'Application deleted successfully'], 200);
    }
}
