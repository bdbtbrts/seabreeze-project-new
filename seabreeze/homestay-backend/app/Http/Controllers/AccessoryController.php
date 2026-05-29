<?php

namespace App\Http\Controllers;

use App\Models\Accessory;
use Illuminate\Http\Request;

class AccessoryController extends Controller
{
    // Lấy danh sách đồ
    public function index() {
        return response()->json(['data' => Accessory::orderBy('id', 'desc')->get()]);
    }

    // HÀM LƯU ĐỒ THUÊ MỚI
    public function store(Request $request)
    {
        $validated = $request->validate([

            'name' => 'required|string|max:255',
            'price_per_day' => 'required|numeric',
            'deposit_amount' => 'required|numeric',
            'stock_quantity' => 'required|integer',
            'image' => 'nullable|string',
            'host_id' => 'required|integer',
            'location' => 'required|string'
        ]);

        $accessory = Accessory::create($validated);

        return response()->json([
            'message' => 'Thêm sản phẩm thành công!',
            'data' => $accessory
        ]);
    }

    // HÀM CẬP NHẬT (SỬA) ĐỒ THUÊ
    public function update(Request $request, $id)
    {
        $accessory = Accessory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price_per_day' => 'required|numeric',
            'deposit_amount' => 'required|numeric',
            'stock_quantity' => 'required|integer',
            'image' => 'nullable|string',
            'location' => 'required|string'
        ]);

        $accessory->update($validated);

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công!',
            'data' => $accessory
        ]);
    }

    // HÀM XÓA ĐỒ THUÊ
    public function destroy($id)
    {
        $accessory = Accessory::findOrFail($id);
        $accessory->delete();

        return response()->json([
            'message' => 'Đã xóa sản phẩm khỏi kho!'
        ]);
    }
}