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
| AIMS (AUTO INVENTORY MANAGEMENT SYSTEM)
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\AIMS\AIMSDashboardController;
use App\Http\Controllers\AIMS\ItemController;
use App\Http\Controllers\AIMS\CategoryController;
use App\Http\Controllers\AIMS\SupplierController;
use App\Http\Controllers\AIMS\StockMovementController;
use App\Http\Controllers\AIMS\RequestOrderController;
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

    // CORE RESOURCES
    Route::apiResource('employment', EmploymentInformationController::class);
    Route::apiResource('personal', PersonalInformationController::class);
    Route::apiResource('account', AccountInformationController::class);
    Route::apiResource('leave-credits', LeaveCreditsController::class);
    Route::apiResource('deminimis', DeminimisController::class);
    Route::apiResource('shifts', ShiftController::class);
    Route::apiResource('departments', DepartmentController::class);

    // ✅ ADD THIS LINE - Deminimis by Employee
    Route::get('/deminimis/employee/{employeeId}', [DeminimisController::class, 'getByEmployee']);

    // DASHBOARD
    Route::get('/stats', [HRMSDashboardController::class, 'getStats']);
    Route::get('/recent-employees', [HRMSDashboardController::class, 'getRecentEmployees']);
    Route::get('/department-distribution', [HRMSDashboardController::class, 'getDepartmentDistribution']);

    // EMPLOYEES
    Route::get('/employees', [HRMSDashboardController::class, 'getEmployees']);
    Route::get('/employee/{biometric_id}', [EmploymentInformationController::class, 'getEmployeeDetails']);

    // EXPORTS
    Route::get('/export/employees/csv', [EmployeeExportController::class, 'exportCSV']);
    Route::get('/export/employees/pdf', [EmployeeExportController::class, 'exportPDF']);
    Route::get('/employee/{biometric_id}/export-cv', [EmployeeExportController::class, 'exportEmployeeCV']);

    // PROFILE UPDATE
    Route::post(
        '/employee/{biometric_id}/update-profile',
        [EmploymentInformationController::class, 'updateProfile']
    );

    // PERSONAL INFO
    Route::put(
        '/employee/{biometric_id}/personal',
        [PersonalInformationController::class, 'updateByEmployee']
    );

    // LEAVE CREDITS
    Route::get(
        '/employee/{biometric_id}/leave-credits',
        [LeaveCreditsController::class, 'showByEmployee']
    );

    Route::put(
        '/employee/{biometric_id}/leave-credits',
        [LeaveCreditsController::class, 'updateByEmployee']
    );

    // ATTENDANCE
    Route::prefix('attendance')->group(function () {
        Route::get('{biometric_id}', [AttendanceController::class, 'index']);
        Route::post('{biometric_id}', [AttendanceController::class, 'store']);
        Route::post('{biometric_id}/absent', [AttendanceController::class, 'markAbsent']);
        Route::put('{id}', [AttendanceController::class, 'update']);
    });

    // APPLICATIONS
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

    Route::get('/', [PayrollController::class, 'index']);
    Route::get('/{id}', [PayrollController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| AIMS MODULE
|--------------------------------------------------------------------------
*/
Route::prefix('aims')->group(function () {

    // DASHBOARD
    Route::get('/dashboard-stats', [AIMSDashboardController::class, 'stats']);

    // MASTER DATA
    Route::apiResource('items', ItemController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('suppliers', SupplierController::class);

    // OPERATIONS
    Route::apiResource('stock-movements', StockMovementController::class);
    Route::apiResource('request-orders', RequestOrderController::class);
    Route::apiResource('purchase-requests', PurchaseRequestController::class);
});
