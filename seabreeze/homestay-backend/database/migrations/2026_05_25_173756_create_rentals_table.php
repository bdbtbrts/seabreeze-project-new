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
       Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->string('customer_email'); // Để biết ai thuê
            $table->string('product_name'); // Tên món đồ
            $table->integer('quantity'); // Số lượng
            $table->decimal('refund_amount', 15, 2); // Tiền cọc hoàn trả
            $table->string('status')->default('Đang mượn'); // Trạng thái
            $table->text('admin_note')->nullable(); // Lời nhắn của Admin
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
