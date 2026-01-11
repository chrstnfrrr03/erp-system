<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Payroll\Payroll;
use Illuminate\Support\Facades\DB;

class PayrollDashboardController extends Controller
{
    public function stats()
    {
        // Total payroll records created
        $totalRuns = Payroll::count();

        // Pending payroll count
        $pendingRuns = Payroll::where('status', 'Pending')->count();

        // ✅ Amount already PAID
        $completedAmount = Payroll::where('status', 'Paid')
            ->sum('net_pay');

        // ✅ Amount still PENDING (real computed payroll)
        $pendingAmount = Payroll::where('status', 'Pending')
            ->sum('net_pay');

        // (Optional but useful) total payroll generated
        $totalPayrollAmount = Payroll::sum('net_pay');

        // Status distribution (for pie / donut charts)
        $statusData = Payroll::select('status', DB::raw('COUNT(*) as value'))
            ->groupBy('status')
            ->get()
            ->map(function ($row) {
                return [
                    'name' => $row->status,
                    'value' => $row->value,
                ];
            });

        // Payroll trend based on pay period
        $trendData = Payroll::select(
                DB::raw("DATE_FORMAT(pay_period_start, '%Y-%m') as month"),
                DB::raw("SUM(net_pay) as amount")
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'totalRuns' => $totalRuns,
            'pendingRuns' => $pendingRuns,

            // 💰 amounts
            'completedAmount' => $completedAmount,
            'pendingAmount' => $pendingAmount,
            'totalPayrollAmount' => $totalPayrollAmount,

            // 📊 charts
            'statusData' => $statusData,
            'trendData' => $trendData,
        ]);
    }
}
