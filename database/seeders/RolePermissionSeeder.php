<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $map = [

            'hr' => [
                'access_hrms',
                'access_payroll',

                'employee.view',
                'employee.create',
                'employee.update',
                'employee.delete',

                'leave.view',
                'leave.manage',

                'ot.manage',
                'attendance.manage',
                'payslip.view',
            ],

            'dept_head' => [
                'access_hrms',

                'employee.view',

                'leave.view',
                'leave.approve',

                'ot.approve',
                'attendance.view',
            ],

            'employee' => [
                'access_hrms',

                'employee.view',

                'leave.view',
                'leave.create',

                'ot.create',
                'attendance.view',
                'payslip.view',
            ],
        ];

        foreach ($map as $role => $permissionSlugs) {
            $users = User::where('role', $role)->get();

            $permissionIds = Permission::whereIn('slug', $permissionSlugs)
                ->pluck('id')
                ->toArray();

            foreach ($users as $user) {
                $user->permissions()->syncWithoutDetaching($permissionIds);
            }
        }
    }
}
