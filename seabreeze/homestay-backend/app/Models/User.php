<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Hash;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // API để Admin lấy danh sách toàn bộ người dùng
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    // API để Admin đổi trạng thái (Hoạt động / Bị khóa)
    public function updateStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Kiểm tra xem request có gửi status lên không
        $user->status = $request->status; 
        $user->save();

        return response()->json(['message' => 'Đã cập nhật trạng thái người dùng!']);
    }
    // API Nâng cấp Khách thành Chủ nhà
    public function upgradeToHost(Request $request, $id)
    {
        $user = \App\Models\User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy tài khoản!'], 404);
        }

        $user->role = 'Chủ nhà';
        
        // CẬP NHẬT TÊN MỚI NẾU CÓ
        if ($request->has('name')) {
            $user->name = $request->name; 
            // Nếu Database m dùng cột hoTen thì đổi thành: $user->hoTen = $request->name;
        }

        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }

        $user->save();

        return response()->json([
            'message' => 'Chúc mừng bạn đã trở thành Chủ nhà!',
            'user' => $user
        ]);
    }
    public function uploadAvatar(Request $request)
{
    // Kiểm tra xem có file gửi lên không
    if (!$request->hasFile('avatar')) {
        return response()->json(['error' => 'Vui lòng chọn ảnh'], 400);
    }

    $file = $request->file('avatar');
    
    // Lưu file vào public/avatars
    $path = $file->store('avatars', 'public');
    
    // Lấy user đang đăng nhập (nhờ cái auth:sanctum)
    $user = $request->user();
    
    // Cập nhật link ảnh vào database
    $user->AVATAR = asset('storage/' . $path);
    $user->save();

    return response()->json([
        'message' => 'Upload thành công',
        'avatarUrl' => $user->AVATAR
    ]);
}
public function changePassword(Request $request)
{
    // Lấy user đang đăng nhập hiện tại từ Token
    $user = $request->user();

    // 1. Kiểm tra mật khẩu cũ m nhập vào có khớp với trong Database không
    if (!Hash::check($request->oldPassword, $user->password)) {
        return response()->json(['error' => 'Mật khẩu hiện tại không chính xác!'], 400);
    }

    // 2. Cập nhật mật khẩu mới (nhớ mã hóa bằng bcrypt/Hash)
    $user->password = Hash::make($request->newPassword);
    $user->save();

    return response()->json(['message' => 'Đổi mật khẩu thành công!']);
}
public function updateProfile(Request $request)
{
    // Lấy user đang đăng nhập
    $user = $request->user();

    // Kiểm tra dữ liệu gửi lên (React gửi lên biến tên là 'soDienThoai')
    $request->validate([
        'soDienThoai' => 'nullable|string|max:20', 
    ]);

    // Gán giá trị: Cột 'phone' trong Database = Dữ liệu 'soDienThoai' từ React
    $user->phone = $request->soDienThoai; 
    
    // Lưu lại
    $user->save();

    // Trả kết quả về cho React 
    // (Phải trả về key 'soDienThoai' để code React của m nhận diện được)
    return response()->json([
        'message' => 'Cập nhật số điện thoại thành công!',
        'user' => [
            'soDienThoai' => $user->phone 
        ]
    ]);
}
public function show($id)
{
    $user = User::find($id);
    if (!$user) return response()->json(['message' => 'Not found'], 404);
    return response()->json($user); 
}
}
