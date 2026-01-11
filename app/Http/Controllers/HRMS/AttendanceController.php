<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HRMS\Attendance;
use App\Models\HRMS\Employee;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Get attendance records of an employee
     */
    public function index($biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)->firstOrFail();

        return Attendance::where('employee_id', $employee->id)
            ->orderBy('date', 'desc')
            ->get();
    }

    /**
     * Add / Update attendance (Shift-aware)
     */
    public function store(Request $request, $biometric_id)
    {
        $request->merge([
            'am_time_in' => $request->am_time_in ?: null,
            'am_time_out' => $request->am_time_out ?: null,
            'pm_time_in' => $request->pm_time_in ?: null,
            'pm_time_out' => $request->pm_time_out ?: null,
        ]);

        $employee = Employee::with('shift')
            ->where('biometric_id', $biometric_id)
            ->firstOrFail();

        if (!$employee->shift) {
            return response()->json([
                'message' => 'Employee has no assigned shift'
            ], 422);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'am_time_in' => 'nullable|date_format:H:i',
            'am_time_out' => 'nullable|date_format:H:i',
            'pm_time_in' => 'nullable|date_format:H:i',
            'pm_time_out' => 'nullable|date_format:H:i',
        ]);

        // ✅ FIXED: Check BOTH AM and PM time-in
        $status = 'Absent';

        if (!empty($validated['am_time_in']) || !empty($validated['pm_time_in'])) {
            
            // Determine which time to use for comparison
            $timeInToCheck = !empty($validated['am_time_in']) 
                ? $validated['am_time_in'] 
                : $validated['pm_time_in'];
            
            $shiftStart = Carbon::createFromTimeString($employee->shift->start_time);
            $timeIn = Carbon::createFromTimeString($timeInToCheck);
            
            // ✅ Handle night shifts that start after noon
            if ($shiftStart->hour >= 12 && $timeIn->hour < 12) {
                $timeIn->addDay(); // Time-in is next day
            }
            
            // 15-minute grace period
            $status = $timeIn->gt($shiftStart->copy()->addMinutes(15)) ? 'Late' : 'Present';
        }

        Attendance::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'date' => $validated['date'],
            ],
            [
                'am_time_in' => $this->normalizeTime($validated['am_time_in']),
                'am_time_out' => $this->normalizeTime($validated['am_time_out'] ?? null),
                'pm_time_in' => $this->normalizeTime($validated['pm_time_in'] ?? null),
                'pm_time_out' => $this->normalizeTime($validated['pm_time_out'] ?? null),
                'status' => $status,
            ]
        );

        return response()->json([
            'message' => 'Attendance saved',
            'status' => $status
        ], 201);
    }

    /**
     * Mark employee as absent
     */
    public function markAbsent(Request $request, $biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)->firstOrFail();

        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        Attendance::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'date' => $validated['date'],
            ],
            [
                'am_time_in' => null,
                'am_time_out' => null,
                'pm_time_in' => null,
                'pm_time_out' => null,
                'status' => 'Absent',
            ]
        );

        return response()->json(['message' => 'Employee marked absent'], 201);
    }

    /**
     * Manual update (Admin override)
     * Auto-recalculate status when time is updated
     */
    public function update(Request $request, $id)
    {
        $request->merge([
            'am_time_in' => $request->am_time_in ?: null,
            'am_time_out' => $request->am_time_out ?: null,
            'pm_time_in' => $request->pm_time_in ?: null,
            'pm_time_out' => $request->pm_time_out ?: null,
        ]);

        $attendance = Attendance::with('employee.shift')->findOrFail($id);

        $validated = $request->validate([
            'am_time_in' => 'nullable|date_format:H:i',
            'am_time_out' => 'nullable|date_format:H:i',
            'pm_time_in' => 'nullable|date_format:H:i',
            'pm_time_out' => 'nullable|date_format:H:i',
        ]);

        // ✅ FIXED: Check BOTH AM and PM time-in
        $status = 'Absent';

        if (!empty($validated['am_time_in']) || !empty($validated['pm_time_in'])) {
            
            if ($attendance->employee && $attendance->employee->shift) {
                
                // Determine which time to use for comparison
                $timeInToCheck = !empty($validated['am_time_in']) 
                    ? $validated['am_time_in'] 
                    : $validated['pm_time_in'];
                
                $shiftStart = Carbon::createFromTimeString(
                    $attendance->employee->shift->start_time
                );
                $timeIn = Carbon::createFromTimeString($timeInToCheck);
                
                // ✅ Handle night shifts that start after noon
                if ($shiftStart->hour >= 12 && $timeIn->hour < 12) {
                    $timeIn->addDay(); // Time-in is next day
                }
                
                // 15-minute grace period
                $status = $timeIn->gt($shiftStart->copy()->addMinutes(15)) ? 'Late' : 'Present';
            } else {
                $status = 'Present';
            }
        }

        $attendance->update([
            'am_time_in' => $this->normalizeTime($validated['am_time_in'] ?? null),
            'am_time_out' => $this->normalizeTime($validated['am_time_out'] ?? null),
            'pm_time_in' => $this->normalizeTime($validated['pm_time_in'] ?? null),
            'pm_time_out' => $this->normalizeTime($validated['pm_time_out'] ?? null),
            'status' => $status,
        ]);

        return response()->json([
            'message' => 'Attendance updated',
            'status' => $status
        ]);
    }

    private function normalizeTime($time)
    {
        return $time ? $time . ':00' : null;
    }
}