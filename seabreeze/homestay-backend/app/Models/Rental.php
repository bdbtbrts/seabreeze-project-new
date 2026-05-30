<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    use HasFactory;

    // Khai báo tên bảng (tùy chọn, Laravel tự hiểu là rentals nhưng cứ ghi cho chắc)
    protected $table = 'rentals';

    // Cho phép lưu hàng loạt các cột này (Mass Assignment)
    protected $fillable = [
        'user_id', 
        'customer_email', 
        'product_id', 
        'product_name',
        'quantity', 
        'price', 
        'deposit', 
        'refund_amount', 
        'status', 
        'admin_note'
    ];
}