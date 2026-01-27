<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [

            /*
            |--------------------------------------------------------------------------
            | Module Access
            |--------------------------------------------------------------------------
            */
            ['slug' => 'access_hrms', 'description' => 'Access HR Management System'],
            ['slug' => 'access_payroll', 'description' => 'Access Payroll System'],
            ['slug' => 'access_aims', 'description' => 'Access Inventory Management'],
            ['slug' => 'access_moms', 'description' => 'Access Machine Operations System'],
            ['slug' => 'access_accounting', 'description' => 'Access Accounting System'],
            ['slug' => 'access_crm', 'description' => 'Access CRM System'],

            /*
            |--------------------------------------------------------------------------
            | Employee Management
            |--------------------------------------------------------------------------
            */
            ['slug' => 'employee.view', 'description' => 'View employee information'],
            ['slug' => 'employee.create', 'description' => 'Create employee records'],
            ['slug' => 'employee.update', 'description' => 'Update employee records'],
            ['slug' => 'employee.delete', 'description' => 'Delete employee records'],

            /*
            |--------------------------------------------------------------------------
            | Leave Management
            |--------------------------------------------------------------------------
            */
            ['slug' => 'leave.view', 'description' => 'View leave records'],
            ['slug' => 'leave.create', 'description' => 'File leave'],
            ['slug' => 'leave.approve', 'description' => 'Approve or reject leave'],
            ['slug' => 'leave.manage', 'description' => 'Manage all leave records'],

            /*
            |--------------------------------------------------------------------------
            | Overtime
            |--------------------------------------------------------------------------
            */
            ['slug' => 'ot.create', 'description' => 'File overtime'],
            ['slug' => 'ot.approve', 'description' => 'Approve overtime'],
            ['slug' => 'ot.manage', 'description' => 'Manage overtime records'],

            /*
            |--------------------------------------------------------------------------
            | Attendance
            |--------------------------------------------------------------------------
            */
            ['slug' => 'attendance.view', 'description' => 'View attendance'],
            ['slug' => 'attendance.manage', 'description' => 'Manage attendance records'],

            /*
            |--------------------------------------------------------------------------
            | Payslip
            |--------------------------------------------------------------------------
            */
            ['slug' => 'payslip.view', 'description' => 'View payslip'],

             /*
            |--------------------------------------------------------------------------
            | User Account Management (ADMIN ONLY)
            |--------------------------------------------------------------------------
            */
            ['slug' => 'user.create', 'description' => 'Create user login accounts'],
        ];

        

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                ['description' => $permission['description']]
            );
        }
    }
}
