<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    // Lấy danh sách mã giảm giá
    public function index()
    {
        return response()->json(Promotion::all());
    }

    // Tạo mã mới
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|unique:promotions',
            'discount_percent' => 'required|integer|min:1|max:100',
        ]);

        $promo = Promotion::create([
            'code' => strtoupper($request->code), // Tự động viết hoa mã
            'discount_percent' => $request->discount_percent,
            'applicable_type' => $request->applicable_type ?? 'all'
        ]);

        return response()->json(['message' => 'Đã tạo mã giảm giá!', 'data' => $promo], 201);
    }

    // Xóa mã
    public function destroy($id)
    {
        Promotion::destroy($id);
        return response()->json(['message' => 'Đã xóa mã giảm giá!']);
    }
    public function checkPromo(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $promo = Promotion::where('code', $request->code)
                          ->where('status', 'Hoạt động')
                          ->first();

        if (!$promo) {
            return response()->json(['message' => 'Mã không hợp lệ hoặc đã hết hạn'], 404);
        }

        return response()->json([
            'message' => 'Áp dụng mã thành công',
            'discount_percent' => $promo->discount_percent
        ], 200);
    }
}