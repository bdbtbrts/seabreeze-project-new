<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'customer_name',
        'room_id',
        'check_in',
        'check_out',
        'total_price',
        'status',
        'customer_email'
    ];

    // Thiết lập liên kết ngược: 1 đơn đặt phòng phải thuộc về 1 phòng cụ thể
    public function room(): BelongsTo
    {
        // Giữ lại đường belongsTo chuẩn. 
        // Nếu mốt bên Model Room m có làm chức năng SoftDeletes (Xóa tạm thời) 
        // thì m có thể đổi dòng dưới thành: return $this->belongsTo(Room::class)->withTrashed();
        return $this->belongsTo(Room::class);
    }
}