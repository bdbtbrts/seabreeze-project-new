<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Accessory extends Model
{
    // Cấp phép điền dữ liệu
  protected $fillable = [
        'name', 
        'price_per_day', 
        'deposit_amount', 
        'stock_quantity', 
        'image', 
        'description',
        'host_id',
        'location'
    ];

    // Khai báo mối quan hệ ngược lại
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}