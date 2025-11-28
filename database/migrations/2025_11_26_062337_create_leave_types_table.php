<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');                // e.g. Sick Leave, Vacation Leave
            $table->integer('default_days');       // Allowed leave days per year
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);  
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
