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
    Schema::create('don_hangs', function (Blueprint $table) {
        $table->id('MADONHANG');
        // Nối với bảng users sẵn có của Laravel (id của users mặc định là khóa chính)
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->timestamp('NGAYDAT')->useCurrent();
        $table->decimal('TONGTIEN', 15, 2); // Dùng decimal thay vì float để tránh sai số tiền tệ
        $table->string('TRANGTHAI')->default('Chưa xử lý');
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('don_hangs');
    }
};
