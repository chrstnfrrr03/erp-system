<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HRMS\Employee;
use App\Models\Payroll\Payroll;
use App\Models\HRMS\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayrollController extends Controller
{
    private const TAX_RATE = 0.10;
    private const NASFUND_RATE = 0.06;
    private const STANDARD_HOURS_PER_DAY = 8;
    private const STANDARD_DAYS_PER_MONTH = 22; // Mon-Fri only
    private const STANDARD_DAYS_WITH_SATURDAY = 26; // Mon-Sat

    public function index(Request $request)
    {
        $query = Payroll::with(['employee.employmentInformation']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('pay_period_start', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $query->orderBy('created_at', 'desc');
        $payrolls = $query->paginate($request->get('per_page', 15));

        return response()->json($payrolls);
    }

    public function show($id)
    {
        $payroll = Payroll::with([
            'employee.employmentInformation',
            'employee.accountInformation',
            'employee.personalInformation'
        ])->findOrFail($id);

        return response()->json([
            'data' => $payroll
        ]);
    }

    public function runPayroll(Request $request)
    {
        Log::info('RUN PAYROLL PAYLOAD', $request->all());

        $validated = $request->validate([
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date|after_or_equal:pay_period_start',
            'payment_date' => 'required|date',
            'pay_type' => 'required|in:Monthly,Semi-Monthly,Bi-Weekly,Weekly',
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            $created = 0;
            $errors = [];

            foreach ($validated['employee_ids'] as $biometric_id) {
                $employee = Employee::where('biometric_id', $biometric_id)
                    ->with(['employmentInformation', 'accountInformation'])
                    ->first();

                if (!$employee) {
                    $errors[] = "Employee not found: {$biometric_id}";
                    continue;
                }

                $fullName = trim($employee->first_name . ' ' . 
                                ($employee->middle_name ? $employee->middle_name . ' ' : '') . 
                                $employee->last_name);

                $employment = $employee->employmentInformation;

                if (!$employment || $employment->rate <= 0) {
                    $errors[] = "Invalid rate for {$fullName}";
                    continue;
                }

                $attendance = $this->calculateAttendanceData(
                    $employee->id,
                    $validated['pay_period_start'],
                    $validated['pay_period_end']
                );

                if ($attendance['days_worked'] === 0) {
                    $errors[] = "No attendance found for {$fullName}";
                    continue;
                }

                $gross = $this->calculateGrossPay(
                    $employment->rate,
                    $employment->rate_type,
                    $attendance
                );

                $overtimePay = $this->calculateOvertimePay(
                    $employment->rate,
                    $employment->rate_type,
                    $attendance['overtime_hours']
                );

                $grossTotal = $gross + $overtimePay;

                // Calculate late deduction
                $lateDeduction = $this->calculateLateDeduction(
                    $employment->rate,
                    $employment->rate_type,
                    $attendance['late_minutes']
                );

                $deductions = $this->calculateDeductions($grossTotal, $employee, $lateDeduction);
                $net = $grossTotal - $deductions['total'];

                Log::info('PAYROLL COMPUTATION', [
                    'employee_name' => $fullName,
                    'employee_id' => $employee->id,
                    'rate' => $employment->rate,
                    'rate_type' => $employment->rate_type,
                    'attendance' => $attendance,
                    'gross' => $gross,
                    'overtime' => $overtimePay,
                    'late_deduction' => $lateDeduction,
                    'deductions' => $deductions,
                    'net' => $net
                ]);

                Payroll::create([
                    'employee_id' => $employee->id,
                    'pay_period_start' => $validated['pay_period_start'],
                    'pay_period_end' => $validated['pay_period_end'],
                    'payment_date' => $validated['payment_date'],
                    'pay_type' => $validated['pay_type'],
                    'base_salary' => $employment->rate,
                    'total_hours' => $attendance['regular_hours'],
                    'overtime_hours' => $attendance['overtime_hours'],
                    'overtime_pay' => $overtimePay,
                    'gross_pay' => $grossTotal,
                    'bonuses' => 0,
                    'deductions' => $deductions['total'],
                    'tax' => $deductions['tax'],
                    'nasfund' => $deductions['nasfund'],
                    'other_deductions' => $deductions['other'],
                    'net_pay' => $net,
                    'status' => 'Pending',
                    'days_worked' => $attendance['days_worked'],
                    'days_absent' => $attendance['days_absent'],
                    'days_late' => $attendance['days_late'],
                ]);

                $created++;
            }

            if ($created === 0) {
                DB::rollBack();
                return response()->json([
                    'message' => 'No payroll records were created',
                    'errors' => $errors
                ], 422);
            }

            DB::commit();

            return response()->json([
                'message' => 'Payroll processed successfully',
                'records' => $created,
                'errors' => $errors,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PAYROLL FAILED', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Payroll failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function calculateAttendanceData($employeeId, $startDate, $endDate)
    {
        $periodStart = Carbon::parse($startDate)->startOfDay();
        $periodEnd   = Carbon::parse($endDate)->endOfDay();

        $attendances = Attendance::where('employee_id', $employeeId)
            ->whereBetween('date', [
                Carbon::parse($startDate)->toDateString(),
                Carbon::parse($endDate)->toDateString(),
            ])
            ->get();

        $regularMinutes = 0;
        $overtimeMinutes = 0;
        $daysWorked = 0;
        $daysLate = 0;
        $lateMinutes = 0;

        // Count working days (Mon–Fri by default)
        $totalWorkingDays = 0;
        for ($d = $periodStart->copy(); $d->lte($periodEnd); $d->addDay()) {
            if (!$d->isWeekend()) {
                $totalWorkingDays++;
            }
            // For Mon-Sat (uncomment if needed):
            // if ($d->dayOfWeek !== Carbon::SUNDAY) {
            //     $totalWorkingDays++;
            // }
        }

        foreach ($attendances as $attendance) {
            if (!in_array(strtolower($attendance->status), ['present', 'late'])) {
                continue;
            }

            $dayMinutes = 0;

            // AM
            $amIn  = $this->buildDateTime($attendance->date, $attendance->am_time_in);
            $amOut = $this->buildDateTime($attendance->date, $attendance->am_time_out);

            if ($amIn && $amOut) {
                if ($amOut->lt($amIn)) {
                    $amOut->addDay();
                }
                $dayMinutes += $amIn->diffInMinutes($amOut);
            }

            // PM
            $pmIn  = $this->buildDateTime($attendance->date, $attendance->pm_time_in);
            $pmOut = $this->buildDateTime($attendance->date, $attendance->pm_time_out);

            if ($pmIn && $pmOut) {
                if ($pmOut->lt($pmIn)) {
                    $pmOut->addDay();
                }
                $dayMinutes += $pmIn->diffInMinutes($pmOut);
            }

            if ($dayMinutes <= 0) {
                continue;
            }

            $daysWorked++;

            $standardMinutes = self::STANDARD_HOURS_PER_DAY * 60;

            if ($dayMinutes > $standardMinutes) {
                $regularMinutes += $standardMinutes;
                $overtimeMinutes += ($dayMinutes - $standardMinutes);
            } else {
                $regularMinutes += $dayMinutes;
            }

            // Late check
            if ($amIn) {
                $scheduleStart = Carbon::parse($attendance->date)
                    ->startOfDay()
                    ->addHours(8);

                $grace = $scheduleStart->copy()->addMinutes(15);

                if ($amIn->gt($grace)) {
                    $daysLate++;
                    $lateMinutes += $amIn->diffInMinutes($scheduleStart);
                }
            }
        }

        return [
            'regular_hours' => round($regularMinutes / 60, 2),
            'overtime_hours' => round($overtimeMinutes / 60, 2),
            'days_worked' => $daysWorked,
            'days_absent' => max(0, $totalWorkingDays - $daysWorked),
            'days_late' => $daysLate,
            'late_minutes' => $lateMinutes,
            'total_working_days' => $totalWorkingDays,
        ];
    }

    private function calculateGrossPay($rate, $rateType, $attendanceData)
    {
        switch ($rateType) {
            case 'Hourly':
                return $rate * $attendanceData['regular_hours'];
            case 'Daily':
                return $rate * $attendanceData['days_worked'];
            case 'Monthly':
                $dailyRate = $rate / self::STANDARD_DAYS_PER_MONTH;
                return $dailyRate * $attendanceData['days_worked'];
            case 'Annual':
                $monthlyRate = $rate / 12;
                $dailyRate = $monthlyRate / self::STANDARD_DAYS_PER_MONTH;
                return $dailyRate * $attendanceData['days_worked'];
            default:
                return 0;
        }
    }

    private function calculateOvertimePay($rate, $rateType, $overtimeHours)
    {
        if ($overtimeHours <= 0) return 0;
        $hourlyRate = $this->convertToHourlyRate($rate, $rateType);
        return $hourlyRate * $overtimeHours * 1.5;
    }

    private function convertToHourlyRate($rate, $rateType)
    {
        switch ($rateType) {
            case 'Hourly':
                return $rate;
            case 'Daily':
                return $rate / self::STANDARD_HOURS_PER_DAY;
            case 'Monthly':
                return $rate / (self::STANDARD_DAYS_PER_MONTH * self::STANDARD_HOURS_PER_DAY);
            case 'Annual':
                return $rate / (self::STANDARD_DAYS_PER_MONTH * 12 * self::STANDARD_HOURS_PER_DAY);
            default:
                return 0;
        }
    }

    private function calculateLateDeduction($rate, $rateType, $lateMinutes)
    {
        if ($lateMinutes <= 0) return 0;
        $hourlyRate = $this->convertToHourlyRate($rate, $rateType);
        return round(($lateMinutes / 60) * $hourlyRate, 2);
    }

    private function calculateDeductions($grossPay, $employee, $lateDeduction = 0)
    {
        $tax = $grossPay * self::TAX_RATE;
        $nasfund = 0;

        // Check if employee is NASFUND member (boolean flag)
        if ($employee->accountInformation && 
            $employee->accountInformation->nasfund === true) {
            $nasfund = $grossPay * self::NASFUND_RATE;
        }

        // Other deductions include late penalties
        $other = $lateDeduction;

        return [
            'tax' => round($tax, 2),
            'nasfund' => round($nasfund, 2),
            'other' => round($other, 2),
            'total' => round($tax + $nasfund + $other, 2),
        ];
    }

    private function buildDateTime($date, $time)
    {
        if (!$time || $time === '00:00:00') {
            return null;
        }

        $dateString = $date instanceof Carbon 
            ? $date->format('Y-m-d') 
            : Carbon::parse($date)->format('Y-m-d');

        $timeParts = explode(':', $time);
        $hours = (int)$timeParts[0];
        $minutes = (int)$timeParts[1];
        $seconds = (int)($timeParts[2] ?? 0);

        return Carbon::parse($dateString)
            ->setTime($hours, $minutes, $seconds);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Approved,Paid,Rejected',
            'notes' => 'nullable|string'
        ]);

        $payroll = Payroll::findOrFail($id);
        $payroll->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $payroll->notes
        ]);

        return response()->json([
            'message' => 'Payroll status updated successfully',
            'data' => $payroll->load('employee')
        ]);
    }

    public function bulkApprove(Request $request)
    {
        $validated = $request->validate([
            'payroll_ids' => 'required|array',
            'payroll_ids.*' => 'exists:payrolls,id'
        ]);

        DB::beginTransaction();
        try {
            Payroll::whereIn('id', $validated['payroll_ids'])
                ->where('status', 'Pending')
                ->update(['status' => 'Approved']);
            DB::commit();
            return response()->json(['message' => 'Payrolls approved successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to approve payrolls',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $payroll = Payroll::findOrFail($id);
        if ($payroll->status === 'Paid') {
            return response()->json([
                'message' => 'Cannot delete paid payroll records'
            ], 403);
        }
        $payroll->delete();
        return response()->json(['message' => 'Payroll record deleted successfully']);
    }

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $summary = Payroll::whereBetween(
                'pay_period_start',
                [$validated['start_date'], $validated['end_date']]
            )
            ->selectRaw('
                DATE_FORMAT(pay_period_start, "%Y-%m") as period,
                SUM(net_pay) as amount
            ')
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return response()->json($summary);
    }
}