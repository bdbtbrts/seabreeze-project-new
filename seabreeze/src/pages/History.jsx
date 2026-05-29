import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css'; // M tạo file css này để làm đẹp nhé

export default function History() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                // Gọi API lấy đơn hàng của chính user đang đăng nhập
                const response = await api.get('/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Giả sử API trả về mảng đơn hàng
                setOrders(response.data.data || response.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, []);

    return (
        <div className="history-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Đơn hàng của tôi</h2>
            
            {loading ? (
                <p>Đang tải lịch sử đặt phòng...</p>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #ccc' }}>
                    <p>Bạn chưa có đơn hàng nào. Hãy đi trải nghiệm SeaBreeze nhé!</p>
                </div>
            ) : (
                <div className="order-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card" style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>{order.room?.title || 'Phòng đã đặt'}</h4>
                                <p style={{ margin: '0', color: '#64748b' }}>📅 {order.check_in} đến {order.check_out}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0' }}>{Number(order.total_price).toLocaleString()} ₫</p>
                                <span className={`status-badge ${order.status}`}>
                                    {order.status === 'confirmed' ? '✅ Đã xác nhận' : '⏳ Chờ xác nhận'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}