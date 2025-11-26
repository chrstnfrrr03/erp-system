<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// AIMS Controllers
use App\Http\Controllers\InventoryController;

// HRMS Controllers
use App\Http\Controllers\HRMS\EmployeeController;
use App\Http\Controllers\HRMS\EmploymentDetailController;
use App\Http\Controllers\HRMS\LeaveTypeController;
use App\Http\Controllers\HRMS\LeaveRequestController;

// ---------------------------------------------------------
// AUTHENTICATED USER
// ---------------------------------------------------------
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// ---------------------------------------------------------
// AIMS (Inventory Management)
// ---------------------------------------------------------
Route::prefix('aims')->group(function () {
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::get('/inventory/{id}', [InventoryController::class, 'show']);
    Route::put('/inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);
});

// ---------------------------------------------------------
// HRMS
// ---------------------------------------------------------
Route::prefix('hrms')->group(function () {

    // ---------------------------------------
    // EMPLOYEES
    // ---------------------------------------
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);

    // ---------------------------------------
    // EMPLOYMENT DETAILS
    // ---------------------------------------
    Route::get('/employees/{id}/employment-detail', [EmploymentDetailController::class, 'show']);
    Route::put('/employees/{id}/employment-detail', [EmploymentDetailController::class, 'update']);

    // ---------------------------------------
    // LEAVE TYPES
    // ---------------------------------------
    Route::get('/leave-types', [LeaveTypeController::class, 'index']);
    Route::post('/leave-types', [LeaveTypeController::class, 'store']);
    Route::put('/leave-types/{id}', [LeaveTypeController::class, 'update']);
    Route::delete('/leave-types/{id}', [LeaveTypeController::class, 'destroy']);

    // ---------------------------------------
    // LEAVE REQUESTS
    // ---------------------------------------
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::get('/leave-requests/{id}', [LeaveRequestController::class, 'show']);
    Route::put('/leave-requests/{id}', [LeaveRequestController::class, 'update']);
    Route::delete('/leave-requests/{id}', [LeaveRequestController::class, 'destroy']);
});
