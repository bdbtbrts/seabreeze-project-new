<!DOCTYPE html>
<html>
<head>
    <title>Xác nhận đơn hàng</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Chào {{ $order->customer_name }},</h2>
    <p>Chủ nhà vừa mới xác nhận đơn đặt phòng của bạn trên hệ thống SeaBreeze!</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Mã đơn hàng:</strong> ORD{{ str_pad($order->id, 3, '0', STR_PAD_LEFT) }}</p>
        <p><strong>Ngày nhận phòng (Check-in):</strong> {{ $order->check_in }}</p>
        <p><strong>Ngày trả phòng (Check-out):</strong> {{ $order->check_out }}</p>
        <p><strong>Tổng tiền đã thanh toán:</strong> <span style="color: #e11d48; font-weight: bold;">{{ number_format($order->total_price, 0, ',', '.') }} VNĐ</span></p>
    </div>

    <p>Vui lòng xuất trình mã đơn này cho chủ nhà khi đến nhận phòng.</p>
    <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của SeaBreeze!</p>
</body>
</html>