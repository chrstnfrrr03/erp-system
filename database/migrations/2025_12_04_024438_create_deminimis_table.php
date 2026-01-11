<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('deminimis')) {
            Schema::create('deminimis', function (Blueprint $table) {

                $table->id();

                $table->foreignId('employee_id')
                    ->constrained('employees')
                    ->onDelete('cascade');

                $table->decimal('clothing_allowance', 10, 2)->nullable();
                $table->decimal('meal_allowance', 10, 2)->nullable();
                $table->decimal('rice_subsidy', 10, 2)->nullable();
                $table->decimal('transportation_allowance', 10, 2)->nullable();

                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('deminimis');
    }
};
