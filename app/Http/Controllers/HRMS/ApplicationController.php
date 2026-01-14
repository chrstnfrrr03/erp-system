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

            'date_from' => 'required|date',
            'date_to'   => 'required|date|after_or_equal:date_from',

            'time_from' => 'nullable|required_if:application_type,Overtime|date_format:H:i',
            'time_to'   => 'nullable|required_if:application_type,Overtime|date_format:H:i|after:time_from',

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

            $application = Application::create([
                'biometric_id'     => $biometric_id,
                'application_type' => $request->application_type,
                'leave_type'       => $request->application_type === 'Leave'
                    ? $request->leave_type
                    : null,
                'time_from'        => $request->application_type === 'Overtime'
                    ? $request->time_from
                    : null,
                'time_to'          => $request->application_type === 'Overtime'
                    ? $request->time_to
                    : null,
                'date_from'        => $request->date_from,
                'date_to'          => $request->date_to,
                'status'           => $request->status ?? 'Pending Supervisor',
                'purpose'          => $request->purpose,
            ]);



            // 🔽 DEDUCT if already approved
            if (
                strtolower($application->application_type) === 'leave' &&
                $application->status === 'Approved' &&
                $application->leave_type !== 'Unpaid Leave'
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
     * ✔ Deduct on approve
     * ✔ Restore on reject/cancel
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
     */
    private function processDeduction(Application $application, Employee $employee)
    {
        $credits = LeaveCredits::where('employee_id', $employee->id)->firstOrFail();

        $days = Carbon::parse($application->date_from)
            ->diffInDays(Carbon::parse($application->date_to)) + 1;

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
     */
    private function processRestore(Application $application, Employee $employee)
    {
        $credits = LeaveCredits::where('employee_id', $employee->id)->firstOrFail();

        $days = Carbon::parse($application->date_from)
            ->diffInDays(Carbon::parse($application->date_to)) + 1;

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
