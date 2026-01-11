<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('personal_information')) {
            Schema::create('personal_information', function (Blueprint $table) {

                $table->id();

                $table->foreignId('employee_id')
                    ->constrained('employees')
                    ->onDelete('cascade');

                $table->date('birthdate')->nullable();
                $table->integer('age')->nullable();
                $table->string('birthplace')->nullable();
                $table->string('nationality')->nullable();
                $table->string('civil_status')->nullable();
                $table->string('religion')->nullable();
                $table->string('gender')->nullable();

                $table->string('present_address')->nullable();
                $table->string('home_address')->nullable();

                $table->string('email_address')->nullable();
                $table->string('mobile_number')->nullable();

                $table->integer('dependents')->nullable();
                $table->string('lodged')->nullable();

                $table->string('emergency_contact')->nullable();
                $table->string('emergency_number')->nullable();

                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_information');
    }
};
