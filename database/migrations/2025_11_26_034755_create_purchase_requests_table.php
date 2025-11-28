<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('purchase_requests', function (Blueprint $table) {
        $table->id();
        $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
        $table->integer('requested_qty');
        $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
        $table->timestamps();
    });
}

};
