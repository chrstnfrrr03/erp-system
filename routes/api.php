<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| AUTH (PUBLIC)
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Auth\AuthenticatedSessionController;

Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| AUTH CHECK (SPA)
|--------------------------------------------------------------------------
*/
Route::get('/me', function (Request $request) {
    $user = $request->user();

    // Load relationships
    $user->load(['permissions', 'employee']);

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,

        'biometric_id' => optional($user->employee)->biometric_id,

        'permissions' => $user->isSystemAdmin()
            ? ['*']
            : $user->getPermissionSlugs()->toArray(),
    ]);
})->middleware('auth:sanctum');




/*
|--------------------------------------------------------------------------
| CONTROLLERS
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;

/* ================= HRMS ================= */
use App\Http\Controllers\HRMS\EmployeeExportController;
use App\Http\Controllers\HRMS\AttendanceController;
use App\Http\Controllers\HRMS\ApplicationController;
use App\Http\Controllers\HRMS\{
    EmploymentInformationController,
    PersonalInformationController,
    AccountInformationController,
    LeaveCreditsController,
    DeminimisController,
    ShiftController,
    HRMSDashboardController,
    DepartmentController,
};

/* ================= PAYROLL ================= */
use App\Http\Controllers\Payroll\PayrollController;
use App\Http\Controllers\Payroll\PayrollEmployeeController;
use App\Http\Controllers\Payroll\PayslipController;
use App\Http\Controllers\Payroll\PayrollDashboardController;

/* ================= AIMS ================= */
use App\Http\Controllers\AIMS\AIMSDashboardController;
use App\Http\Controllers\AIMS\ItemController;
use App\Http\Controllers\AIMS\StockMovementController;
use App\Http\Controllers\AIMS\RequestOrderController;
use App\Http\Controllers\AIMS\SupplierController;
use App\Http\Controllers\AIMS\PurchaseRequestController;
use App\Http\Controllers\AIMS\CustomerController;
use App\Http\Controllers\AIMS\SalesOrderController;

/* ================= REPORTS ================= */
use App\Http\Controllers\ReportsController;

/* ================= SETTINGS ================= */
use App\Http\Controllers\SettingsController;


/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (AUTHENTICATED SPA)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD (ALL ROLES)
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', [DashboardController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | PROFILE (ALL AUTHENTICATED USERS)
    |--------------------------------------------------------------------------
    */
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    /*
    |--------------------------------------------------------------------------
    | PAYROLL - EMPLOYEE PAYSLIP ACCESS (UNIVERSAL)
    | ⚠️ IMPORTANT: This MUST be defined BEFORE the HRMS routes
    | Roles: ALL authenticated users can view their own payslips
    |--------------------------------------------------------------------------
    */
    Route::prefix('payroll')->group(function () {
        // ✅ Employees can view their own payslips (NO permission check)
        Route::get('/payslips/{biometric_id}', [PayslipController::class, 'index']);
        Route::get('/payslip/{id}', [PayslipController::class, 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | HRMS
    | Roles: system_admin, hr, dept_head, employee
    |--------------------------------------------------------------------------
    */
    Route::middleware([
        'role:system_admin,hr,dept_head,employee',
        'permission:access_hrms'
    ])
    ->prefix('hrms')
    ->group(function () {

            Route::apiResource('employment', EmploymentInformationController::class);
            Route::apiResource('personal', PersonalInformationController::class);
            Route::apiResource('account', AccountInformationController::class);
            Route::apiResource('leave-credits', LeaveCreditsController::class);
            Route::apiResource('deminimis', DeminimisController::class);
            Route::apiResource('shifts', ShiftController::class);
            Route::apiResource('departments', DepartmentController::class);

            Route::get('/deminimis/employee/{employeeId}', [DeminimisController::class, 'getByEmployee']);

            Route::get('/stats', [HRMSDashboardController::class, 'getStats'])
                ->middleware('role:system_admin,hr,dept_head');
            Route::get('/recent-employees', [HRMSDashboardController::class, 'getRecentEmployees']);
            Route::get('/department-distribution', [HRMSDashboardController::class, 'getDepartmentDistribution']);

            Route::get('/employees', [HRMSDashboardController::class, 'getEmployees'])
                ->middleware('role:system_admin,hr,dept_head');
            Route::get('/employee/{biometric_id}', [EmploymentInformationController::class, 'getEmployeeDetails']);

            Route::get('/export/employees/csv', [EmployeeExportController::class, 'exportCSV']);
            Route::get('/export/employees/pdf', [EmployeeExportController::class, 'exportPDF']);
            Route::get('/employee/{biometric_id}/export-cv', [EmployeeExportController::class, 'exportEmployeeCV']);

            Route::post('/employee/{biometric_id}/update-profile', [EmploymentInformationController::class, 'updateProfile']);
            Route::put('/employee/{biometric_id}/personal', [PersonalInformationController::class, 'updateByEmployee']);

            Route::get('/employee/{biometric_id}/leave-credits', [LeaveCreditsController::class, 'showByEmployee']);
            Route::put('/employee/{biometric_id}/leave-credits', [LeaveCreditsController::class, 'updateByEmployee']);

            Route::prefix('attendance')->group(function () {
                Route::get('{biometric_id}', [AttendanceController::class, 'index']);
                Route::post('{biometric_id}', [AttendanceController::class, 'store']);
                Route::post('{biometric_id}/absent', [AttendanceController::class, 'markAbsent']);
                Route::put('{id}', [AttendanceController::class, 'update']);
            });
            

            // ✅ APPLICATION ROUTES
            // Get all applications (for managers/HR)
            Route::get('/applications', [ApplicationController::class, 'getAllApplications']);
            
            // Get employee's own applications
            Route::get('/applications/{biometric_id}', [ApplicationController::class, 'index']);
            
            // Create new application
            Route::post('/applications/{biometric_id}', [ApplicationController::class, 'store']);
            
            // Get single application
            Route::get('/applications/show/{id}', [ApplicationController::class, 'show']);
            
            // Update application (approve/reject)
            Route::put('/applications/{id}', [ApplicationController::class, 'update']);
            
            // Delete application
            Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);
        });

    /*
    |--------------------------------------------------------------------------
    | PAYROLL - ADMIN ACCESS
    | Roles: system_admin, hr
    |--------------------------------------------------------------------------
    */
    Route::middleware([
        'role:system_admin,hr',
        'permission:access_payroll'
    ])
    ->prefix('payroll')
    ->group(function () {

            Route::get('/dashboard-stats', [PayrollDashboardController::class, 'stats']);
            Route::post('/run', [PayrollController::class, 'runPayroll']);

            Route::get('/employees', [PayrollEmployeeController::class, 'index']);

            Route::post('/{id}/generate-payslip', [PayslipController::class, 'generate']);

            Route::put('/{id}/status', [PayrollController::class, 'updateStatus']);
            Route::post('/bulk-approve', [PayrollController::class, 'bulkApprove']);

            Route::get('/', [PayrollController::class, 'index']);
            Route::get('/{id}', [PayrollController::class, 'show']);
        });

    /*
    |--------------------------------------------------------------------------
    | AIMS
    | Roles: system_admin, hr
    |--------------------------------------------------------------------------
    */
    Route::middleware([
        'role:system_admin,hr',
        'permission:access_aims'
    ])
    ->prefix('aims')
    ->group(function () {

            Route::get('/dashboard', [AIMSDashboardController::class, 'index']);
            Route::get('/dashboard/stock-distribution', [AIMSDashboardController::class, 'stockDistribution']);
            Route::get('/dashboard/low-stock-trend', [AIMSDashboardController::class, 'lowStockTrend']);

            Route::apiResource('items', ItemController::class);
            Route::get('/items/low-stock/list', [ItemController::class, 'lowStock']);
            Route::get('/items/out-of-stock/list', [ItemController::class, 'outOfStock']);

            Route::get('/suppliers', [SupplierController::class, 'index']);
            Route::post('/suppliers', [SupplierController::class, 'store']);

            Route::get('/stock-movements', [StockMovementController::class, 'index']);
            Route::get('/stock-movements/{id}', [StockMovementController::class, 'show']);
            Route::post('/stock-in', [StockMovementController::class, 'stockIn']);
            Route::post('/stock-out', [StockMovementController::class, 'stockOut']);

            Route::get('/purchase-requests', [PurchaseRequestController::class, 'index']);
            Route::get('/purchase-requests/latest', [PurchaseRequestController::class, 'latest']);
            Route::post('/purchase-requests', [PurchaseRequestController::class, 'store']);
            Route::get('/purchase-requests/{id}', [PurchaseRequestController::class, 'show']);
            Route::post('/purchase-requests/{id}/approve', [PurchaseRequestController::class, 'approve']);
            Route::post('/purchase-requests/{id}/reject', [PurchaseRequestController::class, 'reject']);

            Route::get('/request-orders', [RequestOrderController::class, 'index']);
            Route::post('/request-orders', [RequestOrderController::class, 'store']);
            Route::get('/request-orders/{id}', [RequestOrderController::class, 'show']);
            Route::post('/request-orders/{id}/approve', [RequestOrderController::class, 'approve']);
            Route::post('/request-orders/{id}/receive', [RequestOrderController::class, 'receive']);
            Route::post('/request-orders/{id}/cancel', [RequestOrderController::class, 'cancel']);

            Route::apiResource('customers', CustomerController::class);
            Route::apiResource('sales-orders', SalesOrderController::class);
            Route::post('/sales-orders/{id}/fulfill',[SalesOrderController::class, 'fulfill']);
        });

    /*
    |--------------------------------------------------------------------------
    | REPORTS
    | Roles: system_admin, hr, dept_head
    |--------------------------------------------------------------------------
    */
    Route::middleware([
        'role:system_admin,hr,dept_head',
        'permission:access_reports'
    ])
    ->prefix('reports')
    ->group(function () {
        
        // Dashboard/Summary data for each tab
        Route::get('/summary/{module}', [ReportsController::class, 'getSummary']);
        
        // Get list of available reports
        Route::get('/list', [ReportsController::class, 'getReportsList']);
        
        // View report data
        Route::post('/view', [ReportsController::class, 'viewReport']);
        
        // Generate report (with data)
        Route::post('/generate', [ReportsController::class, 'generateReport']);
        
        // Export report (CSV or PDF)
        Route::post('/export', [ReportsController::class, 'exportReport']);
    });

    /*
    |--------------------------------------------------------------------------
    | AUDIT TRAIL
    | Roles: system_admin, hr
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:system_admin,hr'])
        ->prefix('audit-logs')
        ->group(function () {
            Route::get('/', [AuditLogController::class, 'index']);
            Route::get('/statistics', [AuditLogController::class, 'statistics']);
            Route::get('/recent', [AuditLogController::class, 'recentActivity']);
            Route::get('/{id}', [AuditLogController::class, 'show']);
            Route::post('/model-logs', [AuditLogController::class, 'getModelLogs']);
        });

    /*
    |--------------------------------------------------------------------------
    | SETTINGS
    | Roles: system_admin
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:system_admin'])
        ->prefix('settings')
        ->group(function () {

            Route::get('/general', [SettingsController::class, 'show']);
            Route::post('/general', [SettingsController::class, 'store']);

            Route::post('/modules', [SettingsController::class, 'saveModules']);
        });

    /*
    |--------------------------------------------------------------------------
    | USER MANAGEMENT
    | Roles: system_admin ONLY
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:system_admin'])
        ->group(function () {
            Route::get('/users', [UserManagementController::class, 'index']);
            Route::put('/users/{id}', [UserManagementController::class, 'update']);
            Route::post('/users/{id}/reset-password', [UserManagementController::class, 'resetPassword']);
            Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
        });
});