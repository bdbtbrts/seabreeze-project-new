<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Kiểm tra dữ liệu đầu vào
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
        ], [
            'email.unique' => 'Email này đã được sử dụng. Vui lòng chọn email khác!',
            'email.required' => 'Vui lòng nhập email!',
            'email.email' => 'Email không đúng định dạng!',
            
            'password.required' => 'Vui lòng nhập mật khẩu!',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự!',
            
            'name.required' => 'Vui lòng nhập họ và tên!',
        ]);
        // 2. Tạo tài khoản mới, mã hóa mật khẩu cực mạnh
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Mã hóa password
            'phone' => $request->phone,
            'role' => 'Khách hàng',
            'status' => 'Hoạt động'
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        // 1. Kiểm tra đầu vào
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Tìm user theo email
        $user = User::where('email', $request->email)->first();

        // 3. KIỂM TRA MẬT KHẨU (Khúc này quan trọng nhất)
        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác!'
            ], 401);
        }

        // 4. Tạo token nếu pass đúng
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'user' => $user
        ]);
    }

    public function redirectToGoogle() {
        return Socialite::driver('google')
            ->with(['prompt' => 'select_account']) 
            ->redirect();
    }

    // 2. Nhận kết quả từ Google
    public function handleGoogleCallback() {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::updateOrCreate([
            'email' => $googleUser->email,
        ], [
            'name' => $googleUser->name,
            'password' => bcrypt('password123'), 
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // DÙNG HÀM env() ĐỂ LẤY LINK TỪ CẤU HÌNH, NẾU KHÔNG CÓ THÌ MẶC ĐỊNH LÀ LOCALHOST
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5174');

        return redirect($frontendUrl . "/login?token={$token}&name=" . urlencode($user->name));
    }
}