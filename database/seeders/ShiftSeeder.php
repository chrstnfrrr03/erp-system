<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HRMS\Shift;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            [
                'shift_name' => 'Regular Shift',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
            ],
            [
                'shift_name' => 'Morning Shift',
                'start_time' => '07:00:00',
                'end_time' => '16:00:00',
            ],
            [
                'shift_name' => 'Night Shift',
                'start_time' => '22:00:00',
                'end_time' => '07:00:00',
            ],
        ];

        foreach ($shifts as $shift) {
            Shift::create($shift);
        }
    }
}