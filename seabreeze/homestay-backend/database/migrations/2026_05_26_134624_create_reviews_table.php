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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            // Nối với người dùng (người viết)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            // ID phòng (hoặc sản phẩm) được đánh giá
            $table->string('room_id'); 
            $table->integer('rating')->default(5); // Số sao (1 đến 5)
            $table->text('content'); // Nội dung review
            $table->string('status')->default('Hiển thị'); // Để sau này có thể "Ẩn" thay vì xóa hẳn
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
