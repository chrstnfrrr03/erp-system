<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employment_information', function (Blueprint $table) {
            $table->id();

            // Relationship to employees
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');

            // Employment-related fields ONLY
            $table->string('department');
            $table->string('position');
            $table->string('department_head')->nullable();
            $table->string('supervisor')->nullable();
            $table->string('job_location')->nullable();

            $table->string('employee_type');           // full-time, part-time, contract
            $table->string('employment_status');       // active, inactive

            
            $table->string('employment_classification')->nullable();

            $table->string('company_email')->nullable();
            $table->decimal('rate', 10, 2)->nullable();
            $table->string('rate_type')->nullable();

            $table->date('date_started')->nullable();
            $table->date('date_ended')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employment_information');
    }
};
