<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // System Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@erp.test'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password123'),
                'role' => 'system_admin',
                'is_active' => true,
            ]
        );

        // HR User
        User::firstOrCreate(
            ['email' => 'hr@erp.test'],
            [
                'name' => 'HR User',
                'password' => Hash::make('password123'),
                'role' => 'hr',
                'is_active' => true,
            ]
        );

        // Department Head
        User::firstOrCreate(
            ['email' => 'head@erp.test'],
            [
                'name' => 'Department Head',
                'password' => Hash::make('password123'),
                'role' => 'dept_head',
                'is_active' => true,
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Assign ALL permissions to system admin
        |--------------------------------------------------------------------------
        */
        if ($admin->permissions()->count() === 0) {
            $admin->permissions()->sync(
                Permission::pluck('id')->toArray()
            );
        }
    }
}
