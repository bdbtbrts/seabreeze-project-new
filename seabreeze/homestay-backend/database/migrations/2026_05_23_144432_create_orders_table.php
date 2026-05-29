<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
public function up(): void
{
Schema::create('orders', function (Blueprint $table) {
$table->id();
$table->string('customer_name');
// Khóa ngoại liên kết chặt chẽ với bảng rooms, tự động xóa đơn nếu phòng bị trảm
$table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
$table->string('check_in');
$table->string('check_out');
$table->string('total_price');

// Trạng thái mặc định khi tạo đơn luôn là 'pending' (Chờ duyệt)
$table->string('status')->default('pending');
$table->timestamps();
});
}
public function down(): void
{
Schema::dropIfExists('orders');
}
};