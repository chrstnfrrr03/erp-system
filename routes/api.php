<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HRMS\EmployeeExportController;
use App\Http\Controllers\HRMS\{
    EmploymentInformationController,
    PersonalInformationController,
    AccountInformationController,
    LeaveCreditsController,
    DeminimisController,
    ShiftController,
    HRMSDashboardController,
};

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::prefix('hrms')->group(function () {

    // Resources
    Route::apiResource('employment', EmploymentInformationController::class);
    Route::apiResource('personal', PersonalInformationController::class);
    Route::apiResource('account', AccountInformationController::class);
    Route::apiResource('leave-credits', LeaveCreditsController::class);
    Route::apiResource('deminimis', DeminimisController::class);
    Route::apiResource('shifts', ShiftController::class);

    // Dashboard Stats
    Route::get('/stats', [HRMSDashboardController::class, 'getStats']);
    Route::get('/recent-employees', [HRMSDashboardController::class, 'getRecentEmployees']);
    Route::get('/department-distribution', [HRMSDashboardController::class, 'getDepartmentDistribution']);

    // Employee Lists + Employee Details
    Route::get('/employees', [HRMSDashboardController::class, 'getEmployees']);
    Route::get('/employee/{biometric_id}', [EmploymentInformationController::class, 'getEmployeeDetails']);

    // Employee CV / Exporting
    Route::get('/export/employees/csv', [EmployeeExportController::class, 'exportCSV']);
    Route::get('/export/employees/pdf', [EmployeeExportController::class, 'exportPDF']);
    Route::get('/employee/{biometric_id}/export-cv', [EmployeeExportController::class, 'exportEmployeeCV']);

    // *** FULL PROFILE UPDATE (Photo + Names + Employment Info + Rate Type) ***
    Route::post('/employee/{biometric_id}/update-profile',
        [EmploymentInformationController::class, 'updateProfile']);
});
