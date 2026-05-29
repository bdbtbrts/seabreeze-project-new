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
        Schema::table('users', function (Blueprint $table) {
            // Migrate bảng của Thịnh sang
            $table->string('phone')->nullable(); // Số điện thoại
            $table->string('avatar')->nullable(); // Link ảnh đại diện
            $table->string('role')->default('Khách hàng'); // Vai trò (Khách / Admin)
            $table->string('status')->default('Hoạt động'); // Trạng thái (Hoạt động / Bị khóa)
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
