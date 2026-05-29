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
    Schema::create('theo_doi_thue_dos', function (Blueprint $table) {
        $table->id('MATHEODOI');
        // unique() để đảm bảo quan hệ 1-1 với chi tiết đơn hàng giống Prisma
        $table->foreignId('chi_tiet_don_hang_id')->unique()->constrained('chi_tiet_don_hangs', 'MACTDH')->onDelete('cascade');
        $table->string('TRANGTHAI_TRA')->default('Đang mượn');
        $table->decimal('TIEN_HOAN_COC', 15, 2)->default(0);
        $table->text('GHI_CHU')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theo_doi_thue_dos');
    }
};
