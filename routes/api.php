<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| HRMS
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| PAYROLL
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Payroll\PayrollController;
use App\Http\Controllers\Payroll\PayrollEmployeeController;
use App\Http\Controllers\Payroll\PayslipController;
use App\Http\Controllers\Payroll\PayrollDashboardController;

/*
|--------------------------------------------------------------------------
| AIMS
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\AIMS\AIMSDashboardController;
use App\Http\Controllers\AIMS\ItemController;
use App\Http\Controllers\AIMS\StockMovementController;
use App\Http\Controllers\AIMS\RequestOrderController;
use App\Http\Controllers\AIMS\SupplierController;
use App\Http\Controllers\AIMS\PurchaseRequestController;

/*
|--------------------------------------------------------------------------
| GLOBAL DASHBOARD
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', [DashboardController::class, 'index']);

/*
|--------------------------------------------------------------------------
| HRMS MODULE
|--------------------------------------------------------------------------
*/
Route::prefix('hrms')->group(function () {

    Route::apiResource('employment', EmploymentInformationController::class);
    Route::apiResource('personal', PersonalInformationController::class);
    Route::apiResource('account', AccountInformationController::class);
    Route::apiResource('leave-credits', LeaveCreditsController::class);
    Route::apiResource('deminimis', DeminimisController::class);
    Route::apiResource('shifts', ShiftController::class);
    Route::apiResource('departments', DepartmentController::class);

    Route::get('/deminimis/employee/{employeeId}', [DeminimisController::class, 'getByEmployee']);

    Route::get('/stats', [HRMSDashboardController::class, 'getStats']);
    Route::get('/recent-employees', [HRMSDashboardController::class, 'getRecentEmployees']);
    Route::get('/department-distribution', [HRMSDashboardController::class, 'getDepartmentDistribution']);

    Route::get('/employees', [HRMSDashboardController::class, 'getEmployees']);
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

    Route::get('/applications/{biometric_id}', [ApplicationController::class, 'index']);
    Route::post('/applications/{biometric_id}', [ApplicationController::class, 'store']);
    Route::get('/applications/show/{id}', [ApplicationController::class, 'show']);
    Route::put('/applications/{id}', [ApplicationController::class, 'update']);
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| PAYROLL MODULE
|--------------------------------------------------------------------------
*/
Route::prefix('payroll')->group(function () {

    Route::get('/dashboard-stats', [PayrollDashboardController::class, 'stats']);
    Route::post('/run', [PayrollController::class, 'runPayroll']);

    Route::get('/employees', [PayrollEmployeeController::class, 'index']);

    Route::get('/payslips/{biometric_id}', [PayslipController::class, 'index']);
    Route::get('/payslip/{id}', [PayslipController::class, 'show']);
    Route::post('/{id}/generate-payslip', [PayslipController::class, 'generate']);

    Route::put('/{id}/status', [PayrollController::class, 'updateStatus']);
    Route::post('/bulk-approve', [PayrollController::class, 'bulkApprove']);

    Route::get('/', [PayrollController::class, 'index']);
    Route::get('/{id}', [PayrollController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| AIMS MODULE (AUTO INVENTORY MANAGEMENT SYSTEM)
|--------------------------------------------------------------------------
*/
Route::prefix('aims')->group(function () {

    /*
    | DASHBOARD
    */
    Route::get('/dashboard', [AIMSDashboardController::class, 'index']);
    Route::get('/dashboard/stock-distribution', [AIMSDashboardController::class, 'stockDistribution']);
    Route::get('/dashboard/low-stock-trend', [AIMSDashboardController::class, 'lowStockTrend']);

    /*
    | ITEMS
    */
    Route::apiResource('items', ItemController::class);
    Route::get('/items/low-stock/list', [ItemController::class, 'lowStock']);
    Route::get('/items/out-of-stock/list', [ItemController::class, 'outOfStock']);

    /*
    | SUPPLIERS
    */
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/suppliers', [SupplierController::class, 'store']);

    /*
    | STOCK MOVEMENTS
    */
    Route::get('/stock-movements', [StockMovementController::class, 'index']);
    Route::get('/stock-movements/{id}', [StockMovementController::class, 'show']);

    Route::post('/stock-in', [StockMovementController::class, 'stockIn']);
    Route::post('/stock-out', [StockMovementController::class, 'stockOut']);

    /*
    | PURCHASE REQUESTS (PR)
    */
    Route::get('/purchase-requests', [PurchaseRequestController::class, 'index']);
    Route::get('/purchase-requests/latest', [PurchaseRequestController::class, 'latest']);
    Route::post('/purchase-requests', [PurchaseRequestController::class, 'store']);
    Route::get('/purchase-requests/{id}', [PurchaseRequestController::class, 'show']);
    Route::post('/purchase-requests/{id}/approve', [PurchaseRequestController::class, 'approve']);
    Route::post('/purchase-requests/{id}/reject', [PurchaseRequestController::class, 'reject']);

    /*
    | REQUEST ORDERS (PO)
    */
    Route::get('/request-orders', [RequestOrderController::class, 'index']);
    Route::post('/request-orders', [RequestOrderController::class, 'store']);
    Route::get('/request-orders/{id}', [RequestOrderController::class, 'show']);
    Route::post('/request-orders/{id}/approve', [RequestOrderController::class, 'approve']);
    Route::post('/request-orders/{id}/cancel', [RequestOrderController::class, 'cancel']);
});
