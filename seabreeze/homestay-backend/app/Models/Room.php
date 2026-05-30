<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use SoftDeletes;
    // Đã gộp đầy đủ các cột cũ và thêm cột 'status' mới vào 1 dòng duy nhất
    protected $fillable = [
        'id',
        'title', 
        'location', 
        'rating', 
        'reviews', 
        'description', 
        'images', 
        'price_per_night',
        'status',
        'host_id',
        'amenities',
    ];

    // Ép kiểu mảng images thành JSON khi lưu vào DB
    protected $casts = [
        'images' => 'array',
        'amenities' => 'array'
        
    ];
    // Báo cho Laravel biết: 1 Phòng thuộc về 1 Chủ nhà (User) thông qua cột host_id
    public function host()
    {
        return $this->belongsTo(\App\Models\User::class, 'host_id');
    }
    
   
}