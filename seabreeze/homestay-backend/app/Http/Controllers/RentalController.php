rental controller:
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rental; // Nhớ đảm bảo m đã có Model Rental nhé
use Illuminate\Support\Facades\Log;

class RentalController extends Controller
{
    // 1. API CHO KHÁCH: Lưu đơn thuê đồ từ Giỏ hàng
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            $items = $request->input('items', []);

            foreach ($items as $item) {
                Rental::create([
                    'user_id' => $user->id,
                    'customer_email' => $user->email,
                    'product_id' => $item['product_id'],
                    // Lấy tên từ frontend gửi lên hoặc điền tạm nếu chưa có
                    'product_name' => $item['product_name'] ?? 'Phụ kiện #' . $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'deposit' => $item['deposit'],
                    'refund_amount' => $item['deposit'] * $item['quantity'], // Tổng cọc của món này
                    'status' => 'Thành công', 
                    'admin_note' => $request->admin_note
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn thuê thành công!'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Lỗi tạo đơn thuê: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }

    // 2. API CHO KHÁCH: Lấy danh sách đồ ĐÃ THUÊ của chính mình
    public function userRentals(Request $request)
    {
        $user = $request->user();
        
        // Lấy đơn của user này, sắp xếp mới nhất lên đầu
        $rentals = Rental::where('user_id', $user->id)
                         ->orderBy('created_at', 'desc')
                         ->get();

        return response()->json([
            'success' => true,
            'data' => $rentals
        ]);
    }

    // 3. API CHO ADMIN: Lấy TOÀN BỘ đơn thuê của cả hệ thống
    public function indexAdmin()
    {
        $rentals = Rental::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $rentals
        ]);
    }

    // 4. API CHO ADMIN: Cập nhật trạng thái (Đã trả, Hư hỏng...)
    public function updateStatus(Request $request, $id)
    {
        $rental = Rental::find($id);
        
        if (!$rental) {
            return response()->json(['message' => 'Không tìm thấy đơn thuê!'], 404);
        }

        $rental->status = $request->input('status');
        
        // Cập nhật ghi chú và tiền cọc nếu Admin báo hư hỏng
        if ($request->has('admin_note')) {
            $rental->admin_note = $request->input('admin_note');
        }

        $rental->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn thuê thành công!'
        ]);
    }

    // 5. Khác: Tra cứu theo email (nếu cần)
    public function getByEmail($email)
    {
        $rentals = Rental::where('customer_email', $email)->get();
        return response()->json([
            'success' => true,
            'data' => $rentals
        ]);
    }
    // 6. API CHO ADMIN: Xóa/Hủy đơn thuê cứng
    public function destroy($id)
    {
        $rental = Rental::find($id);
        
        if (!$rental) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn thuê!'
            ], 404);
        }

        $rental->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa đơn thuê!'
        ]);
    }
}