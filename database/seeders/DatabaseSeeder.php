<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

// Existing Seeders
use Database\Seeders\PermissionSeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\ShiftSeeder;
use Database\Seeders\PositionSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\RolePermissionSeeder;

// ✅ NEW Seeder
use Database\Seeders\EmploymentClassificationSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | CORE DATA
        |--------------------------------------------------------------------------
        */
        $this->call([
            PermissionSeeder::class,
            DepartmentSeeder::class,
            ShiftSeeder::class,
            PositionSeeder::class,
            EmploymentClassificationSeeder::class,
            UserSeeder::class,
            RolePermissionSeeder::class,
        ]);
    }
}
