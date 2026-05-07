import React, { useState, useEffect } from 'react';
import './History.css'; // Thịnh nhớ tạo file CSS này nhé

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (!savedUser) {
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/orders/${savedUser.email}`);
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="loading">Đang tải lịch sử đơn hàng...</div>;

  return (
    <div className="history-container">
      <h1 className="history-title">ĐƠN HÀNG CỦA TÔI</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">Thịnh chưa có đơn hàng nào. Hãy đi trải nghiệm SeaBreeze nhé!</div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order.MADONHANG} className="order-card">
              <div className="order-header">
                <span className="order-id">Mã đơn: #ORD{order.MADONHANG}</span>
                <span className="order-date">Ngày đặt: {new Date(order.NGAYDAT).toLocaleDateString('vi-VN')}</span>
              </div>
              
              <div className="order-body">
                {order.CT_DONHANG.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-type">[{item.LOAIDICHVU}]</span>
                    <span className="item-name">Dịch vụ: {item.MADICHVU}</span>
                    <span className="item-qty">x{item.SOLUONG}</span>
                    <span className="item-price">{item.GIABAN.toLocaleString()}đ</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <span className="order-status">Trạng thái: <b className="status-badge">{order.TRANGTHAI}</b></span>
                <span className="order-total">Tổng tiền: <b>{order.TONGTIEN.toLocaleString()}đ</b></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;