<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportsController extends Controller
{
    /**
     * Get summary data for each module tab
     */
    public function getSummary(Request $request, $module)
    {
        try {
            switch ($module) {
                case 'hrms':
                    return $this->getHRMSSummary();
                
                case 'payroll':
                    return $this->getPayrollSummary();
                
                case 'aims':
                    return $this->getAIMSSummary();
                
                case 'moms':
                    return $this->getMOMSSummary();
                
                default:
                    return response()->json(['error' => 'Invalid module'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Reports Summary Error', [
                'module' => $module,
                'message' => $e->getMessage(),
            ]);
            
            return response()->json([
                'total_employees' => 0,
                'present_today' => 0,
                'on_leave' => 0,
            ]);
        }
    }

    /**
     * Get HRMS summary data
     */
    private function getHRMSSummary()
    {
        $data = [
            'total_employees' => 0,
            'present_today' => 0,
            'on_leave' => 0,
        ];

        try {
            if (Schema::hasTable('employees')) {
                $data['total_employees'] = DB::table('employees')->count();
            }
        } catch (\Exception $e) {
            Log::error('Error calculating total employees:', ['message' => $e->getMessage()]);
        }

        try {
            if (Schema::hasTable('attendances')) {
                $data['present_today'] = DB::table('attendances')
                    ->whereDate('date', today())
                    ->whereIn('status', ['Present', 'Late'])
                    ->count();
            }
        } catch (\Exception $e) {
            Log::error('Error calculating present today:', ['message' => $e->getMessage()]);
        }

        try {
            if (Schema::hasTable('applications')) {
                $data['on_leave'] = DB::table('applications')
                    ->where('status', 'approved')
                    ->where('application_type', 'leave')
                    ->whereDate('date_from', '<=', today())
                    ->whereDate('date_to', '>=', today())
                    ->count();
            }
        } catch (\Exception $e) {
            Log::error('Error calculating on leave:', ['message' => $e->getMessage()]);
        }

        return response()->json($data);
    }

    /**
     * Get Payroll summary data
     */
    private function getPayrollSummary()
    {
        $data = [
            'total_payroll' => '$0.00',
            'paid_this_month' => '$0.00',
            'pending' => '$0.00',
        ];

        try {
            if (!Schema::hasTable('payrolls')) {
                return response()->json($data);
            }

            $currentMonth = now()->month;
            $currentYear = now()->year;
            
            $totalPayroll = DB::table('payrolls')
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->sum('net_pay') ?? 0;
            
            $paidThisMonth = DB::table('payrolls')
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('status', 'Paid')
                ->sum('net_pay') ?? 0;
            
            $pending = $totalPayroll - $paidThisMonth;

            $data = [
                'total_payroll' => '$' . number_format($totalPayroll, 2),
                'paid_this_month' => '$' . number_format($paidThisMonth, 2),
                'pending' => '$' . number_format($pending, 2),
            ];
            
        } catch (\Exception $e) {
            Log::error('Payroll Summary Error:', ['message' => $e->getMessage()]);
        }

        return response()->json($data);
    }

    /**
     * Get AIMS summary data
     */
    private function getAIMSSummary()
    {
        $data = [
            'total_orders' => 0,
            'completed' => 0,
            'pending' => 0,
        ];

        try {
            if (!Schema::hasTable('sales_orders')) {
                return response()->json($data);
            }

            $data['total_orders'] = DB::table('sales_orders')->count();
            $data['completed'] = DB::table('sales_orders')->where('status', 'fulfilled')->count();
            $data['pending'] = DB::table('sales_orders')->where('status', 'pending')->count();
            
        } catch (\Exception $e) {
            Log::error('AIMS Summary Error:', ['message' => $e->getMessage()]);
        }

        return response()->json($data);
    }

    /**
     * Get MOMS summary data
     */
    private function getMOMSSummary()
    {
        return response()->json([
            'machine_usage_hours' => '—',
            'breakdown_this_period' => '—',
            'maintenance_completed' => '—',
        ]);
    }

    /**
     * Get list of available reports
     */
    public function getReportsList(Request $request)
    {
        $module = $request->query('module', 'hrms');
        
        $reports = [
            'hrms' => [
                ['id' => 1, 'title' => 'Employee Attendance Report', 'type' => 'attendance'],
                ['id' => 2, 'title' => 'Leave Applications Report', 'type' => 'leave'],
                ['id' => 3, 'title' => 'Employee Directory', 'type' => 'employees'],
                ['id' => 4, 'title' => 'Department Distribution', 'type' => 'departments'],
                ['id' => 5, 'title' => 'Employee Status Report', 'type' => 'employment_status'],
            ],
            'payroll' => [
                ['id' => 6, 'title' => 'Monthly Payroll Summary', 'type' => 'payroll_summary'],
                ['id' => 7, 'title' => 'Salary Register', 'type' => 'salary'],
                ['id' => 8, 'title' => 'Deductions Report', 'type' => 'deductions'],
                ['id' => 9, 'title' => 'Tax Report', 'type' => 'tax'],
                ['id' => 10, 'title' => 'Benefits Report', 'type' => 'benefits'],
            ],
            'aims' => [
                ['id' => 11, 'title' => 'Inventory Stock Report', 'type' => 'inventory'],
                ['id' => 12, 'title' => 'Sales Orders Report', 'type' => 'sales'],
                ['id' => 13, 'title' => 'Stock Movements Report', 'type' => 'stock_movements'],
                ['id' => 14, 'title' => 'Purchase Requests Report', 'type' => 'purchase_requests'],
                ['id' => 15, 'title' => 'Low Stock Items', 'type' => 'low_stock'],
            ],
            'moms' => [
                ['id' => 16, 'title' => 'Machine Usage Report', 'type' => 'machine_usage'],
                ['id' => 17, 'title' => 'Production Summary', 'type' => 'production'],
                ['id' => 18, 'title' => 'Maintenance Schedule', 'type' => 'maintenance'],
            ],
        ];

        return response()->json($reports[$module] ?? []);
    }

    /**
     * Generate report
     */
    public function generateReport(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|string',
            'date_range' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'filters' => 'nullable|array',
        ]);

        try {
            $data = $this->getReportData($validated['report_type'], $validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Report generated successfully',
                'report' => [
                    'id' => rand(1000, 9999),
                    'type' => $validated['report_type'],
                    'generated_at' => now()->format('m/d/Y'),
                    'data' => $data,
                    'total_records' => count($data),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Report Generation Error:', [
                'type' => $validated['report_type'],
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Route to correct report data method
     */
    private function getReportData($type, $filters)
    {
        switch ($type) {
            case 'attendance':
                return $this->getAttendanceReportData($filters);
            
            case 'leave':
                return $this->getLeaveReportData($filters);
            
            case 'employees':
                return $this->getEmployeesReportData($filters);
            
            case 'departments':
                return $this->getDepartmentsReportData($filters);
            
            case 'employment_status':
                return $this->getEmploymentStatusReportData($filters);
            
            case 'payroll_summary':
            case 'salary':
            case 'deductions':
            case 'tax':
            case 'benefits':
                return $this->getPayrollReportData($filters);
            
            case 'inventory':
                return $this->getInventoryReportData($filters);
            
            case 'sales':
                return $this->getSalesReportData($filters);
            
            case 'stock_movements':
                return $this->getStockMovementsReportData($filters);
            
            case 'purchase_requests':
                return $this->getPurchaseRequestsReportData($filters);
            
            case 'low_stock':
                return $this->getLowStockReportData($filters);
            
            default:
                return [];
        }
    }

    /**
     * HRMS Reports
     */
    private function getAttendanceReportData($filters)
    {
        try {
            if (!Schema::hasTable('attendances') || !Schema::hasTable('employees')) {
                return [];
            }

            $query = DB::table('attendances')
                ->join('employees', 'attendances.employee_id', '=', 'employees.id')
                ->select(
                    'employees.biometric_id',
                    DB::raw("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name"),
                    'attendances.date',
                    'attendances.am_time_in',
                    'attendances.am_time_out',
                    'attendances.pm_time_in',
                    'attendances.pm_time_out',
                    'attendances.status'
                );

            $this->applyDateFilter($query, 'attendances.date', $filters);

            return $query->orderBy('attendances.date', 'desc')->get()->toArray();
        } catch (\Exception $e) {
            Log::error('Attendance Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getLeaveReportData($filters)
    {
        try {
            if (!Schema::hasTable('applications') || !Schema::hasTable('employees')) {
                return [];
            }

            $query = DB::table('applications')
                ->join('employees', 'applications.biometric_id', '=', 'employees.biometric_id')
                ->select(
                    'employees.biometric_id',
                    DB::raw("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name"),
                    'applications.leave_type',
                    'applications.date_from as start_date',
                    'applications.date_to as end_date',
                    'applications.leave_duration',
                    'applications.status',
                    'applications.purpose as reason'
                )
                ->where('applications.application_type', 'leave');

            $this->applyDateFilter($query, 'applications.date_from', $filters);

            return $query->orderBy('applications.date_from', 'desc')->get()->toArray();
        } catch (\Exception $e) {
            Log::error('Leave Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getEmployeesReportData($filters)
    {
        if (!Schema::hasTable('employees')) {
            return [];
        }

        return DB::table('employees')
            ->select(
                'biometric_id',
                'employee_number',
                DB::raw("CONCAT(first_name, ' ', last_name) as full_name"),
                'created_at as date_hired'
            )
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    private function getDepartmentsReportData($filters)
    {
        try {
            $employmentTable = Schema::hasTable('employment_information') 
                ? 'employment_information' 
                : (Schema::hasTable('employment_informations') ? 'employment_informations' : null);

            if (!$employmentTable || !Schema::hasTable('departments')) {
                return [];
            }

            return DB::table($employmentTable)
                ->join('departments', "$employmentTable.department_id", '=', 'departments.id')
                ->select(
                    'departments.name as department_name',
                    DB::raw("COUNT(DISTINCT $employmentTable.employee_id) as employee_count")
                )
                ->where("$employmentTable.employment_status", 'Active')
                ->groupBy('departments.id', 'departments.name')
                ->orderBy('employee_count', 'desc')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Departments Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getEmploymentStatusReportData($filters)
    {
        try {
            $employmentTable = Schema::hasTable('employment_information') 
                ? 'employment_information' 
                : (Schema::hasTable('employment_informations') ? 'employment_informations' : null);

            if (!$employmentTable || !Schema::hasTable('employees')) {
                return [];
            }

            $query = DB::table($employmentTable)
                ->join('employees', "$employmentTable.employee_id", '=', 'employees.id')
                ->join('departments', "$employmentTable.department_id", '=', 'departments.id')
                ->select(
                    'employees.biometric_id',
                    DB::raw("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name"),
                    'departments.name as department',
                    "$employmentTable.position",
                    "$employmentTable.employee_type",
                    "$employmentTable.employment_status",
                    "$employmentTable.date_started"
                );

            if (isset($filters['filters']['status']) && $filters['filters']['status'] !== 'all') {
                $query->where("$employmentTable.employment_status", ucfirst($filters['filters']['status']));
            }

            return $query->orderBy('employees.first_name')->get()->toArray();
        } catch (\Exception $e) {
            Log::error('Employment Status Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Payroll Reports
     */
    private function getPayrollReportData($filters)
    {
        try {
            if (!Schema::hasTable('payrolls') || !Schema::hasTable('employees')) {
                return [];
            }

            $query = DB::table('payrolls')
                ->join('employees', 'payrolls.employee_id', '=', 'employees.id')
                ->select(
                    'employees.biometric_id',
                    'employees.employee_number',
                    DB::raw("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name"),
                    'payrolls.pay_period_start',
                    'payrolls.pay_period_end',
                    'payrolls.base_salary',
                    'payrolls.gross_pay',
                    'payrolls.deductions',
                    'payrolls.tax',
                    'payrolls.net_pay',
                    'payrolls.status'
                );

            $this->applyDateFilter($query, 'payrolls.created_at', $filters);

            return $query->orderBy('payrolls.created_at', 'desc')->get()->toArray();
        } catch (\Exception $e) {
            Log::error('Payroll Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * AIMS Reports
     */
    private function getInventoryReportData($filters)
    {
        try {
            if (!Schema::hasTable('items')) {
                return [];
            }

            $query = DB::table('items')
                ->leftJoin('suppliers', 'items.supplier_id', '=', 'suppliers.id')
                ->select(
                    'items.sku',
                    'items.name as item_name',
                    'items.category',
                    'items.brand',
                    'items.unit',
                    'items.current_stock',
                    'items.cost_price',
                    'items.selling_price',
                    DB::raw('items.current_stock * items.cost_price as total_value'),
                    'items.status',
                    'suppliers.name as supplier_name'
                );

            // Filter by status if provided
            if (isset($filters['filters']['status']) && $filters['filters']['status'] !== 'all') {
                $query->where('items.status', ucfirst($filters['filters']['status']));
            }

            return $query->orderBy('items.name')->get()->toArray();
        } catch (\Exception $e) {
            Log::error('Inventory Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getSalesReportData($filters)
    {
        try {
            if (!Schema::hasTable('sales_orders') || !Schema::hasTable('customers')) {
                return [];
            }

            $query = DB::table('sales_orders')
                ->join('customers', 'sales_orders.customer_id', '=', 'customers.id')
                ->select(
                    'sales_orders.so_number',
                    'customers.name as customer_name',
                    'sales_orders.order_date',
                    'sales_orders.total_amount',
                    'sales_orders.status'
                );

            $this->applyDateFilter($query, 'sales_orders.order_date', $filters);

            return $query->orderBy('sales_orders.order_date', 'desc')->get()->toArray();
        } catch (\Exception $e) {
            Log::error('Sales Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getStockMovementsReportData($filters)
    {
        try {
            if (!Schema::hasTable('stock_movements') || !Schema::hasTable('items')) {
                return [];
            }

            $query = DB::table('stock_movements')
                ->join('items', 'stock_movements.item_id', '=', 'items.id')
                ->select(
                    'items.sku',
                    'items.name as item_name',
                    'stock_movements.type',
                    'stock_movements.quantity',
                    'stock_movements.reference',
                    'stock_movements.notes',
                    'stock_movements.created_at as movement_date'
                );

            $this->applyDateFilter($query, 'stock_movements.created_at', $filters);

            return $query->orderBy('stock_movements.created_at', 'desc')->get()->toArray();
        } catch (\Exception $e) {
            Log::error('Stock Movements Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getPurchaseRequestsReportData($filters)
    {
        try {
            if (!Schema::hasTable('purchase_requests')) {
                return [];
            }

            $query = DB::table('purchase_requests')
                ->leftJoin('users as requester', 'purchase_requests.requested_by', '=', 'requester.id')
                ->leftJoin('users as approver', 'purchase_requests.approved_by', '=', 'approver.id')
                ->select(
                    'purchase_requests.pr_number',
                    'purchase_requests.request_date',
                    'requester.name as requested_by',
                    'approver.name as approved_by',
                    'purchase_requests.status',
                    'purchase_requests.approved_at',
                    'purchase_requests.notes'
                );

            $this->applyDateFilter($query, 'purchase_requests.request_date', $filters);

            return $query->orderBy('purchase_requests.request_date', 'desc')->get()->toArray();
        } catch (\Exception $e) {
            Log::error('Purchase Requests Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getLowStockReportData($filters)
    {
        try {
            if (!Schema::hasTable('items')) {
                return [];
            }

            return DB::table('items')
                ->select(
                    'sku',
                    'name as item_name',
                    'category',
                    'current_stock',
                    'minimum_stock',
                    'reorder_quantity',
                    DB::raw('minimum_stock - current_stock as stock_deficit'),
                    'status'
                )
                ->whereRaw('current_stock <= minimum_stock')
                ->where('status', 'Active')
                ->orderBy('stock_deficit', 'desc')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Low Stock Report Error:', ['message' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Helper Methods
     */
    private function applyDateFilter($query, $dateColumn, $filters)
    {
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween($dateColumn, [$filters['start_date'], $filters['end_date']]);
        } elseif (isset($filters['date_range'])) {
            switch ($filters['date_range']) {
                case 'today':
                    $query->whereDate($dateColumn, today());
                    break;
                case 'week':
                    $query->whereBetween($dateColumn, [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'month':
                    $query->whereMonth($dateColumn, now()->month)
                          ->whereYear($dateColumn, now()->year);
                    break;
                case 'year':
                    $query->whereYear($dateColumn, now()->year);
                    break;
            }
        }
    }

    /**
     * Export Methods
     */
    public function exportReport(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|string',
            'format' => 'required|in:csv,pdf',
            'data' => 'required|array',
            'title' => 'required|string',
        ]);

        try {
            if ($validated['format'] === 'csv') {
                return $this->exportToCsv($validated['data'], $validated['title']);
            } else {
                return $this->exportToPdf($validated['data'], $validated['title'], $validated['report_type']);
            }
        } catch (\Exception $e) {
            Log::error('Export Error:', ['message' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Export failed'], 500);
        }
    }

    private function exportToCsv($data, $title)
    {
        $filename = str_replace(' ', '_', strtolower($title)) . '_' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            if (!empty($data)) {
                fputcsv($file, array_keys((array)$data[0]));
                foreach ($data as $row) {
                    fputcsv($file, (array)$row);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($data, $title, $type)
    {
        $filename = str_replace(' ', '_', strtolower($title)) . '_' . now()->format('Y-m-d') . '.pdf';
        
        $pdf = Pdf::loadView('reports.pdf-template', [
            'title' => $title,
            'data' => $data,
            'type' => $type,
            'generated_at' => now()->format('F d, Y'),
        ]);

        return $pdf->download($filename);
    }

    /**
     * View report details
     */
    public function viewReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'report_type' => 'required|string',
                'date_range' => 'nullable|string',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'filters' => 'nullable|array',
            ]);

            Log::info('View Report Request:', $validated);

            $data = $this->getReportData($validated['report_type'], $validated);
            
            Log::info('Report Data Retrieved:', [
                'type' => $validated['report_type'],
                'count' => count($data)
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'total_records' => count($data),
            ]);
        } catch (\Exception $e) {
            Log::error('View Report Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load report data',
            ], 500);
        }
    }
}