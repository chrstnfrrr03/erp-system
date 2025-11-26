<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('inventory_items', function (Blueprint $table) {
        $table->id();
        $table->string('item_id')->unique();     // System-generated item code
        $table->string('name');
        $table->string('category');
        $table->string('location')->nullable();
        $table->integer('stock');
        $table->integer('low_stock_threshold')->default(10);
        $table->timestamps();
    });
}

};
