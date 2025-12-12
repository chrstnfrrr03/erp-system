<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('personal_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');

            // Basic personal details
            $table->date('birthdate')->nullable();
            $table->integer('age')->nullable();
            $table->string('birthplace')->nullable();
            $table->string('nationality')->nullable();
            $table->string('civil_status')->nullable();
            $table->string('religion')->nullable();
            $table->string('gender')->nullable();

            // Address
            $table->string('present_address')->nullable();
            $table->string('home_address')->nullable();

            // Contact information
            $table->string('email_address')->nullable();
            $table->string('mobile_number')->nullable();

            // Additional info
            $table->integer('dependents')->nullable();
            $table->string('lodged')->nullable(); // boolean in model but stored as string

            // Emergency contact
            $table->string('emergency_contact')->nullable();
            $table->string('emergency_number')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_information');
    }
};
