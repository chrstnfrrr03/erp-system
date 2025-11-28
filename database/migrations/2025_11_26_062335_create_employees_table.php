<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('employees', function (Blueprint $table) {
    $table->id();
    $table->string('employee_no')->unique();
    
    // Basic info
    $table->string('first_name');
    $table->string('middle_name')->nullable();
    $table->string('last_name');
    $table->string('gender')->nullable();

    // Contact
    $table->string('email')->nullable()->unique();
    $table->string('mobile_number')->nullable();

    // Employment
    $table->string('department')->nullable();
    $table->string('position')->nullable();
    $table->date('date_started')->nullable();
    $table->date('date_ended')->nullable();
    $table->unsignedBigInteger('user_id')->nullable(); // FK to users

    $table->timestamps();
});

    }

    public function down()
    {
        Schema::dropIfExists('employees');
    }
};
