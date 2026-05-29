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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('location');
            $table->decimal('rating', 3, 2)->default(5.0);
            $table->integer('reviews')->default(0);
            $table->text('description')->nullable();
            $table->json('images')->nullable(); // Lưu mảng URL ảnh dưới dạng JSON
            $table->decimal('price_per_night', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
