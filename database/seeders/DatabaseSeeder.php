<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

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
            UserSeeder::class,
            RolePermissionSeeder::class,
        ]);
    }
}
