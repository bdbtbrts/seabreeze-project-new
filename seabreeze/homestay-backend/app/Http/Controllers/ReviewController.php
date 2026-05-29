<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    // 1. Lấy toàn bộ đánh giá (kèm theo thông tin người viết)
    public function adminIndex()
    {
        // Chú ý: Cần thiết lập quan hệ User - Review trong Model để lấy tên người dùng
        $reviews = Review::join('users', 'reviews.user_id', '=', 'users.id')
            ->select('reviews.*', 'users.name as user_name', 'users.email as user_email')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($reviews);
    }
    public function hostIndex($hostId)
    {
        // Join bảng reviews với bảng rooms để lọc theo host_id, và join bảng users để lấy tên khách
        $reviews = DB::table('reviews')
            ->join('rooms', 'reviews.room_id', '=', 'rooms.id')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->where('rooms.host_id', $hostId) // Chỉ lấy phòng của chủ nhà này
            ->select(
                'reviews.*', 
                'users.name as user_name', 
                'users.email as user_email', 
                'rooms.title as room_name' // Lấy tên phòng hiển thị cho rõ ràng
            )
            ->orderBy('reviews.created_at', 'desc')
            ->get();
            
        return response()->json($reviews);
    }
    // Hàm lấy danh sách đánh giá của 1 phòng cụ thể (Show ra cho khách xem)
    public function getRoomReviews($roomId)
    {
        $reviews = Review::join('users', 'reviews.user_id', '=', 'users.id')
            ->where('reviews.room_id', $roomId)
            ->where('reviews.status', 'Hiển thị') // Chỉ lấy những cái chưa bị Admin ẩn/xóa
            ->select('reviews.*', 'users.name as author', 'users.avatar as avatar')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($reviews);
    }

    // Hàm cho khách hàng Gửi đánh giá mới
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'room_id' => 'required',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|string',
        ]);

        $review = Review::create([
            'user_id' => $request->user_id,
            'room_id' => $request->room_id,
            'rating' => $request->rating,
            'content' => $request->content,
            'status' => 'Hiển thị'
        ]);

        // Gắn thêm tên người dùng vào response để React hiển thị luôn không cần load lại web
        $review->author = \App\Models\User::find($request->user_id)->name;

        return response()->json(['message' => 'Đánh giá thành công!', 'review' => $review], 201);
    }

    // 2. Xóa đánh giá (hoặc chuyển trạng thái sang Ẩn tùy m)
    public function destroy($id)
    {
        $review = Review::find($id);
        if ($review) {
            $review->delete(); // Xóa bay màu luôn
            return response()->json(['message' => 'Đã xóa đánh giá thành công!']);
        }
        return response()->json(['message' => 'Không tìm thấy đánh giá!'], 404);
    }
}