<?php

use Illuminate\Support\Facades\Route;

// DASHBOARD
use App\Http\Controllers\DashboardController;

// HRMS
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

// PAYROLL
use App\Http\Controllers\Payroll\PayrollController;
use App\Http\Controllers\Payroll\PayrollEmployeeController;
use App\Http\Controllers\Payroll\PayslipController;
use App\Http\Controllers\Payroll\PayrollDashboardController;

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

    // HRMS DASHBOARD STATS
    Route::get('/stats', [HRMSDashboardController::class, 'getStats']);
    Route::get('/recent-employees', [HRMSDashboardController::class, 'getRecentEmployees']);
    Route::get('/department-distribution', [HRMSDashboardController::class, 'getDepartmentDistribution']);

    // EMPLOYEES
    Route::get('/employees', [HRMSDashboardController::class, 'getEmployees']);
    Route::get('/employee/{biometric_id}', [EmploymentInformationController::class, 'getEmployeeDetails']);

    // EMPLOYEE EXPORTS
    Route::get('/export/employees/csv', [EmployeeExportController::class, 'exportCSV']);
    Route::get('/export/employees/pdf', [EmployeeExportController::class, 'exportPDF']);
    Route::get('/employee/{biometric_id}/export-cv', [EmployeeExportController::class, 'exportEmployeeCV']);

    // FULL PROFILE UPDATE
    Route::post(
        '/employee/{biometric_id}/update-profile',
        [EmploymentInformationController::class, 'updateProfile']
    );

    // PERSONAL INFO (BY EMPLOYEE)
    Route::put(
        '/employee/{biometric_id}/personal',
        [PersonalInformationController::class, 'updateByEmployee']
    );

    // LEAVE CREDITS (BY EMPLOYEE)
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
| PAYROLL MODULE (SEPARATE FROM HRMS)
|--------------------------------------------------------------------------
*/
Route::prefix('payroll')->group(function () {

    // DASHBOARD STATS (Payroll.jsx)
    Route::get('/dashboard-stats', [PayrollDashboardController::class, 'stats']);

    // RUN PAYROLL
    Route::post('/run', [PayrollController::class, 'runPayroll']);

    // EMPLOYEES FOR PAYROLL (RunPayroll.jsx)
    Route::get('/employees', [PayrollEmployeeController::class, 'index']);

    // PAYSLIPS (EmployeePayslips.jsx)
    Route::get('/payslips/{biometric_id}', [PayslipController::class, 'index']);
    Route::get('/payslip/{id}', [PayslipController::class, 'show']);

    // PAYROLL RECORDS (KEEP LAST)
    Route::get('/', [PayrollController::class, 'index']);
    Route::get('/{id}', [PayrollController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| AIMS MODULE (AUTO INVENTORY MANAGEMENT SYSTEM)
|--------------------------------------------------------------------------
*/
Route::prefix('aims')->group(function () {

    // DASHBOARD STATS
    Route::get('/dashboard-stats', [\App\Http\Controllers\AIMS\AIMSDashboardController::class, 'stats']);

    // ITEMS
    Route::apiResource('items', \App\Http\Controllers\AIMS\ItemController::class);

    // CATEGORIES
    Route::apiResource('categories', \App\Http\Controllers\AIMS\CategoryController::class);

    // SUPPLIERS
    Route::apiResource('suppliers', \App\Http\Controllers\AIMS\SupplierController::class);

    // STOCK MOVEMENTS
    Route::get('/stock-movements', [\App\Http\Controllers\AIMS\StockMovementController::class, 'index']);
});
