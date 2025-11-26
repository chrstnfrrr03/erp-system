<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('employment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            $table->string('employment_type')->nullable(); // Regular, Contractual
            $table->string('employment_status')->default('Active'); // Active, Inactive
            $table->date('date_hired')->nullable();
            $table->date('date_terminated')->nullable();
            $table->decimal('rate', 12, 2)->nullable();
            $table->string('rate_type')->nullable(); // Monthly, Daily, Hourly
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('employment_details');
    }
};
