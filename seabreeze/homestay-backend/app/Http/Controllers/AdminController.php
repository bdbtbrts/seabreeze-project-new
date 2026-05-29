<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Room;
use App\Models\Rental;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboardStats()
    {
        // Tính tổng doanh thu từ các đơn đặt phòng "Đã xác nhận"
        $homestayRevenue = Order::where('status', 'confirmed')->sum('total_price');
        
        // Đếm tổng số lượng
        $totalOrders = Order::count();
        $totalRentals = Rental::count();
        $totalRooms = Room::count();

        // Trả về một cục JSON gọn gàng cho React
        return response()->json([
            'homestayRevenue' => $homestayRevenue,
            'totalOrders' => $totalOrders,
            'totalRentals' => $totalRentals,
            'totalRooms' => $totalRooms
        ]);
    }
}