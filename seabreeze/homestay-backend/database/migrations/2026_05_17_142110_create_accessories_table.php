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
       Schema::create('accessories', function (Blueprint $table) {
            $table->id();
            $table->integer('host_id')->nullable();
            $table->string('name'); // Tên món đồ (Lều, Bếp...)
            $table->decimal('price_per_day', 15, 2); // Giá thuê / ngày
            $table->decimal('deposit_amount', 15, 2); // Tiền đặt cọc
            $table->integer('stock_quantity'); // Số lượng tồn kho
            $table->string('image')->nullable(); // Hình ảnh
            $table->text('description')->nullable(); // Mô tả
            $table->timestamps();
            $table->string('location')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accessories');
    }
};
