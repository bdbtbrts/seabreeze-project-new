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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Mã giảm giá (VD: SUMMER2026)
            $table->integer('discount_percent'); // Giảm bao nhiêu %
            $table->string('applicable_type')->default('all'); // Áp dụng cho: all, homestay, product
            $table->string('status')->default('Hoạt động'); // Hoạt động / Đã khóa
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
