<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmed;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // 1. Lấy toàn bộ danh sách đơn hàng
    public function index()
    {
        $orders = Order::with('room')->get();
        return response()->json(['data' => $orders]);
        return Order::with('room')->where('customer_email', auth('sanctum')->user()->email)->get();
    }

    // --- HÀM NHẬN VÀ TẠO ĐƠN HÀNG MỚI TỪ REACT ---
    public function store(Request $request) 
    {
    $user = auth('sanctum')->user();
    $data = $request->all();

    // 1. TỰ ĐỘNG XÁC NHẬN (Skip confirmation)
    $data['status'] = 'confirmed'; 
    // 2. Gán email từ user đã đăng nhập
    $data['customer_email'] = $user->email; 

    try {
        $order = Order::create($data);

        // 3. Gửi mail (bọc trong try-catch để lỗi mail không làm hỏng thanh toán)
        try {
            \Mail::to($user->email)->send(new \App\Mail\OrderConfirmedMail($order));
        } catch (\Exception $e) {
            \Log::error("Lỗi gửi mail: " . $e->getMessage());
        }

        return response()->json(['message' => 'Đặt phòng thành công', 'order' => $order], 201);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Lỗi tạo đơn: ' . $e->getMessage()], 500);
    }
    }

    // 2. Chuyển đổi trạng thái đơn đặt phòng sang 'confirmed'
    public function confirm($id)
    {
    $order = Order::findOrFail($id);
    
    // 1. Cập nhật trạng thái đơn hàng
    $order->status = 'confirmed';
    $order->save();

    // 2. GỬI MAIL ĐỘNG CHO KHÁCH HÀNG
    // Nếu m lưu email thẳng trong đơn hàng:
    $customerEmail = $order->customer_email; 
    
    // HOẶC nếu m dùng quan hệ user (đăng nhập mới đặt):
    // $customerEmail = $order->user->email;

    // Gửi mail tới địa chỉ lấy được từ đơn hàng
    \Mail::to($customerEmail)->send(new \App\Mail\OrderConfirmedMail($order));

    return response()->json(['message' => 'Đã xác nhận đơn hàng!']);
    }   
    

    // 3. Xóa đơn đặt phòng
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Đã hủy và xóa đơn hàng thành công']);
    }
}