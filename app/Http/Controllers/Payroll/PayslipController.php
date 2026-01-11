<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\HRMS\Employee;
use App\Models\Payroll\Payroll;

class PayslipController extends Controller
{
    /**
     * Employee payslip list
     */
    public function index($biometric_id)
    {
        $employee = Employee::where('biometric_id', $biometric_id)
            ->firstOrFail();

        $payrolls = Payroll::where('employee_id', $employee->id)
            ->orderBy('payment_date', 'desc')
            ->get([
                'id',
                'pay_period_start',
                'pay_period_end',
                'payment_date',
                'gross_pay',
                'deductions',
                'net_pay',
                'status',
            ]);

        return response()->json($payrolls);
    }

    /**
     * Single payslip view
     */
    public function show($id)
    {
        $payroll = Payroll::with('employee')
            ->findOrFail($id);

        return response()->json($payroll);
    }
}
