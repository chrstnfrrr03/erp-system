<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('stock_movements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
        $table->enum('type', ['in', 'out']);
        $table->integer('quantity');
        $table->string('remarks')->nullable();
        $table->timestamps();
    });
}

};
