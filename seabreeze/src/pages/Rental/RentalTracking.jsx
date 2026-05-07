import React, { useState, useEffect } from 'react';
import './RentalTracking.css';

const RentalTracking = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (!savedUser) return;

      try {
        const response = await fetch(`http://localhost:5000/api/rental-tracking/${savedUser.email}`);
        const data = await response.json();
        setRentals(data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu thuê đồ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  if (loading) return <div className="tracking-loader">Đang kiểm tra trạng thái đồ thuê...</div>;

  return (
    <div className="tracking-container">
      <h1 className="tracking-title">THEO DÕI THUÊ ĐỒ & CỌC</h1>
      
      {rentals.length === 0 ? (
        <div className="no-rentals">Hiện không có món đồ nào đang được thuê.</div>
      ) : (
        <div className="tracking-grid">
          {rentals.map((item) => (
            <div key={item.MATHEODOI} className="tracking-card">
              <div className="tracking-badge">{item.TRANGTHAI_TRA}</div>
              
              <div className="tracking-info">
                <p><strong>Sản phẩm:</strong> {item.CT_DONHANG.MADICHVU}</p>
                <p><strong>Số lượng:</strong> {item.CT_DONHANG.SOLUONG}</p>
                <p><strong>Tiền cọc hoàn trả:</strong> 
                  <span className="deposit-amt"> {item.TIEN_HOAN_COC.toLocaleString()}đ</span>
                </p>
              </div>

              <div className="tracking-note">
                <span>Ghi chú Admin:</span>
                <p>{item.GHI_CHU || "Chưa có ghi chú nào."}</p>
              </div>

              {item.TRANGTHAI_TRA === "Đang mượn" && (
                <div className="status-indicator warning">Vui lòng trả đồ đúng hạn</div>
              )}
              {item.TRANGTHAI_TRA === "Đã trả" && (
                <div className="status-indicator success">Đã hoàn thành thủ tục</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalTracking;