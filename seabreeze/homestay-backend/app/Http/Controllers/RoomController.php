<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index()
    {
        // Lấy tất cả phòng trong Database, dùng with('host') để lấy luôn thông tin chủ nhà
        $rooms = \App\Models\Room::with('host')->get(); 
        return response()->json(['data' => $rooms]);
    }

    public function show($id)
    {
        // 🌟 TÌM PHÒNG THEO ID & MÓC NỐI LẤY LUÔN THÔNG TIN CHỦ NHÀ (HOST) 🌟
        $room = \App\Models\Room::with(['host'])->find($id);

        // Nếu không có phòng nào ứng với ID đó thì báo lỗi
        if (!$room) {
            return response()->json(['message' => 'Không tìm thấy phòng'], 404);
        }

        // Trả về dữ liệu dạng JSON cực đẹp cho React
        return response()->json([
            'data' => $room
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        // 🌟 ĐÃ THÊM host_id ĐỂ LARAVEL CHỊU NHẬN ID CỦA CHỦ NHÀ TỪ REACT GỬI XUỐNG 🌟
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'price_per_night' => 'required|numeric',
            'description' => 'nullable|string',
            'images' => 'required|array',
            'host_id' => 'required|integer' 
        ]);

        // Gắn mặc định phòng mới tạo là "pending" (Chờ duyệt)
        $validated['status'] = 'pending'; 

        $room = \App\Models\Room::create($validated);
        return response()->json(['data' => $room], 201);
    }

    // --- API DÀNH CHO ADMIN: DUYỆT PHÒNG ---
    public function approve($id)
    {
        // Tìm phòng theo ID
        $room = \App\Models\Room::findOrFail($id);
        
        // Đổi trạng thái từ 'pending' sang 'approved'
        $room->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Đã duyệt phòng thành công!',
            'data' => $room
        ]);
    }

    public function destroy($id)
    {
        $room = \App\Models\Room::find($id);
        if ($room) {
            $room->delete();
            return response()->json(['message' => 'Đã xóa phòng thành công!']);
        }
        return response()->json(['message' => 'Không tìm thấy phòng!'], 404);
    }
    public function update(Request $request, $id)
{
    $room = Room::findOrFail($id);

    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'location' => 'required|string|max:255',
        'price_per_night' => 'required|numeric',
        'description' => 'nullable|string',
        'images' => 'required|array'
    ]);

    $room->update($validated);

    return response()->json([
        'message' => 'Cập nhật phòng thành công!',
        'data' => $room
    ]);
}
}