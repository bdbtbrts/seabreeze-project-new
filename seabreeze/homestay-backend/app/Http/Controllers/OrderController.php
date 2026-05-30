<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmed; // Tùy m xài tên class nào thì đổi cho đúng nhé
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // 1. Lấy toàn bộ danh sách đơn hàng cho Admin
    public function index()
    {
        // T xóa bớt 1 dòng return thừa của m rồi nhé
        $orders = Order::with('room')->get();
        return response()->json(['data' => $orders]);
    }

    // --- HÀM TẠO ĐƠN HÀNG MỚI (LÚC KHÁCH BẤM ĐẶT) ---
    public function store(Request $request) 
    {
        $user = auth('sanctum')->user();
        $data = $request->all();

        // 🛑 BƯỚC 1: Ép trạng thái về Chờ xác nhận
        $data['status'] = 'pending'; 
        
        // Gán email từ user đã đăng nhập
        $data['customer_email'] = $user->email; 

        try {
            // Chỉ lưu vào Database thôi, KHÔNG GỬI MAIL Ở ĐÂY NỮA
            $order = Order::create($data);

            return response()->json([
                'message' => 'Đặt phòng thành công, chờ chủ nhà xác nhận!', 
                'order' => $order
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi tạo đơn: ' . $e->getMessage()], 500);
        }
    }

    // --- HÀM CHỦ NHÀ XÁC NHẬN ĐƠN (GỌI KHI BẤM NÚT DUYỆT) ---
    public function confirm($id)
    {
        $order = Order::findOrFail($id);
        
        // 1. Cập nhật trạng thái đơn hàng sang Đã xác nhận
        $order->status = 'confirmed';
        $order->save();

        // 2. Gửi mail động cho khách
        $customerEmail = $order->customer_email; 
        
        try {
            // ⚠️ LƯU Ý: Nhớ kiểm tra lại tên file mail của m là OrderConfirmedMail hay OrderConfirmed
            \Mail::to($customerEmail)->send(new \App\Mail\OrderConfirmedMail($order));
        } catch (\Exception $e) {
            \Log::error("Lỗi gửi mail xác nhận: " . $e->getMessage());
            return response()->json(['message' => 'Đã xác nhận đơn nhưng hệ thống gửi mail bị lỗi!'], 500);
        }

        return response()->json(['message' => 'Đã xác nhận đơn hàng và bắn Email thành công!']);
    }   

    // 3. Xóa đơn đặt phòng
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Đã hủy và xóa đơn hàng thành công']);
    }
}