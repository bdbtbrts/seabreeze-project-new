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
    Schema::create('chi_tiet_don_hangs', function (Blueprint $table) {
        $table->id('MACTDH');
        // Ràng buộc với bảng đơn hàng ở trên
        $table->foreignId('don_hang_id')->constrained('don_hangs', 'MADONHANG')->onDelete('cascade');
        $table->string('LOAIDICHVU'); // "Homestay" hoặc "Thuê đồ"
        $table->string('MADICHVU');    // ID của phòng hoặc ID của phụ kiện
        $table->integer('SOLUONG')->default(1);
        $table->decimal('GIABAN', 15, 2);
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chi_tiet_don_hangs');
    }
};
