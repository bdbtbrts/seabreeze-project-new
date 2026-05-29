// src/pages/Cart.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  // 1. STATE BẬT/TẮT MODAL VIETQR
  const [showQR, setShowQR] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 2. FIX LỖI NaN BẰNG CÁCH ÉP KIỂU SỐ (Number)
  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(Number(num) || 0) + ' ₫';

  const rentTotal = cartItems.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + (price * qty);
  }, 0);

  const depositTotal = cartItems.reduce((acc, item) => {
      const deposit = Number(item.deposit) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + (deposit * qty);
  }, 0);

  const finalTotal = rentTotal + depositTotal;

  // 3. CẤU HÌNH THÔNG TIN VIETQR
  const BANK_ID = "MB"; 
  const ACCOUNT_NO = "0375951500"; 
  const ACCOUNT_NAME = "BUI DUONG BAO TU"; 
  const DESCRIPTION = `Thanh toan gio hang SeaBreeze`; 
  const vietQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${finalTotal}&addInfo=${encodeURIComponent(DESCRIPTION)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  return (
    <div className="cart-page">
      <h2>Giỏ hàng Đồ thuê & Phụ kiện</h2>
      <div className="cart-container">
        <div className="cart-list">
          {cartItems.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Giỏ hàng của bạn đang trống.</p>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="info">
                  <h4>{item.name}</h4>
                  <p>Tiền thuê: {formatVND(item.price)}/ngày</p>
                  <p className="deposit-text">Tiền cọc: {formatVND(item.deposit)}</p>
                </div>
                <div className="qty">
                  <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <button className="btn-remove" onClick={() => removeFromCart(item.id)}>Xóa</button>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="row"><span>Tổng tiền thuê:</span> <span>{formatVND(rentTotal)}</span></div>
          <div className="row deposit"><span>Tổng tiền đặt cọc:</span> <span>{formatVND(depositTotal)}</span></div>
          <hr />
          <div className="row total"><span>Tổng thanh toán:</span> <span>{formatVND(finalTotal)}</span></div>
          <button 
            className="btn-pay" 
            onClick={() => {
                if(cartItems.length > 0) setShowQR(true);
                else alert("Giỏ hàng đang trống!");
            }}
            style={{ opacity: cartItems.length === 0 ? 0.5 : 1 }}
          >
            Thanh toán
          </button>
        </div>
      </div>

      {/* ================= MODAL THANH TOÁN VIETQR ================= */}
      {showQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h2 style={{ color: '#ff385c', marginBottom: '10px' }}>Thanh toán qua VietQR</h2>
                <p style={{ color: '#666', marginBottom: '20px', fontSize: '15px' }}>
                    Mở App Ngân hàng bất kỳ để quét mã QR.
                </p>

                <div style={{ border: '2px dashed #eee', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block' }}>
                    <img src={vietQrUrl} alt="VietQR Payment" style={{ width: '250px', height: '250px', objectFit: 'contain' }} />
                </div>

                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left', fontSize: '14px' }}>
                    <div style={{ marginBottom: '8px' }}><strong>Ngân hàng:</strong> MB Bank</div>
                    <div style={{ marginBottom: '8px' }}><strong>Chủ tài khoản:</strong> {ACCOUNT_NAME}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Số tài khoản:</strong> {ACCOUNT_NO}</div>
                    <div><strong>Số tiền:</strong> <span style={{ color: '#ff385c', fontWeight: 'bold', fontSize: '16px' }}>{formatVND(finalTotal)}</span></div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setShowQR(false)} 
                        style={{ flex: 1, padding: '12px', border: '1px solid #ddd', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={() => {
                            setIsProcessing(true);
                            setTimeout(() => {
                                setIsProcessing(false);
                                setShowQR(false);
                                alert("🎉 Đã ghi nhận thanh toán! Đơn thuê của bạn đang được xử lý.");
                                // Ở đây m có thể clear giỏ hàng: clearCart() nếu có viết hàm đó
                            }, 2000);
                        }} 
                        disabled={isProcessing}
                        style={{ flex: 1, padding: '12px', border: 'none', background: isProcessing ? '#ccc' : '#007bff', color: '#fff', borderRadius: '8px', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        {isProcessing ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản'}
                    </button>
                </div>
            </div>
        </div>
      )}

      <footer className="main-footer" id="contact-footer" style={{ marginTop: '50px' }}>
        <div className="footer-content">
            <div className="footer-section">
                <h3>SeaBreeze</h3>
                <p>Trải nghiệm kỳ nghỉ tuyệt vời cùng dịch vụ thuê đồ tiện lợi.</p>
            </div>
            <div className="footer-section">
                <h4>Liên hệ</h4>
                <p>Email: cskh@seabreeze.com</p>
                <p>Hotline: 0375 951 500</p>
                <p>Địa chỉ: UIT, Thủ Đức, TP. HCM</p>
            </div>
            <div className="footer-section">
                <h4>Kết nối với chúng tôi</h4>
                <div className="social-icons">
                    <a href="#"><i className="fa-brands fa-facebook"></i></a>
                    <a href="#"><i className="fa-brands fa-instagram"></i></a>
                    <a href="#"><i className="fa-brands fa-tiktok"></i></a>
                </div>
            </div>
        </div>
        <div className="footer-bottom">&copy; 2026 SeaBreeze Project - UIT Students.</div>
      </footer>
    </div>
  );
};

export default Cart;