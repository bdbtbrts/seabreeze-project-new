import React, { useState, useEffect } from 'react';
import api from '../api';
import './History.css'; // Tái sử dụng CSS của trang lịch sử phòng cho đồng bộ

export default function RentalHistory() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAuthHeader = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
        }
    });

    useEffect(() => {
        // Gọi API lấy danh sách đồ ĐÃ THUÊ CỦA RIÊNG USER NÀY
        api.get('/api/user/rentals', getAuthHeader())
            .then(res => {
                setRentals(res.data.data || res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy lịch sử thuê đồ:", err);
                setLoading(false);
            });
    }, []);

    const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(Number(num) || 0) + ' ₫';

    return (
        <div className="history-page">
            <h2 style={{ textAlign: 'center', margin: '30px 0', color: '#0f172a' }}>Lịch sử thuê đồ & Phụ kiện</h2>
            
            <div className="history-container">
                {loading ? <p style={{ textAlign: 'center' }}>Đang tải dữ liệu...</p> : (
                    rentals.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b' }}>Bạn chưa có đơn thuê đồ nào.</p>
                    ) : (
                        <div className="rental-list">
                            {rentals.map(item => (
                                <div key={item.id} className="history-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                                        <strong>Mã đơn: RT{String(item.id).padStart(3, '0')}</strong>
                                        <span className={`badge ${item.status === 'Đã trả' ? 'badge-success' : 'badge-warning'}`}>
                                            {item.status || 'Chờ xử lý'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <p><strong>Sản phẩm:</strong> {item.product_name}</p>
                                            <p><strong>Số lượng:</strong> {item.quantity}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p><strong>Tiền cọc:</strong> <span style={{ color: '#e51d53' }}>{formatVND(item.refund_amount || item.deposit)}</span></p>
                                            <p><small>{item.admin_note ? `Ghi chú: ${item.admin_note}` : ''}</small></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}