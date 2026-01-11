<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('leave_credits')) {
            Schema::create('leave_credits', function (Blueprint $table) {

                $table->id();

                $table->foreignId('employee_id')
                    ->constrained('employees')
                    ->onDelete('cascade');

                $table->year('vacation_year')->nullable();
                $table->decimal('vacation_credits', 8, 2)->nullable();

                $table->year('sick_year')->nullable();
                $table->decimal('sick_credits', 8, 2)->nullable();

                $table->year('emergency_year')->nullable();
                $table->decimal('emergency_credits', 8, 2)->nullable();

                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_credits');
    }
};
