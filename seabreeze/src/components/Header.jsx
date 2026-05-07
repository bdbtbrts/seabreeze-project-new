import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCartShopping } from 'react-icons/fa6';
import { useCart } from '../context/CartContext'; // Import hook giỏ hàng của bạn
import './Header.css';

function Header() {
  // 1. Lấy dữ liệu giỏ hàng (Code của bạn)
  const { totalItems } = useCart();

  // 2. Xử lý trạng thái đăng nhập (Code của Thịnh)
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    alert("Đã đăng xuất thành công!");
    window.location.href = '/login';
  };

  return (
    <header className="mainHeader">
      {/* 1. LOGO */}
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', color: '#009be5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logoseabreeze.png"
            alt="logo"
            style={{ width: '30px', height: '30px', objectFit: 'contain' }}
          />
          SeaBreeze
        </Link>
      </div>

      {/* 2. MENU */}
      <nav className="nav-menu">
        <Link to="/" className="nav-item">Trang chủ</Link>
        <a href="#homestay-section" className="nav-item">Homestay</a>
        <a href="#rent-section" className="nav-item">Thuê đồ</a>
        <a href="#contact-footer" className="nav-item">Liên hệ</a>
      </nav>
      
      {/* 3. KHU VỰC HÀNH ĐỘNG NGƯỜI DÙNG */}
      <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Nút Giỏ hàng (Của bạn) */}
        <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="cart-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaCartShopping size={20} />
            <span className="cart-count">{totalItems}</span>
          </div>
        </Link>

        {/* Khu vực Đăng nhập/Đăng xuất (Của Thịnh) */}
        {user ? (
          // --- TRẠNG THÁI: ĐÃ ĐĂNG NHẬP ---
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/history" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>
              Lịch sử
            </Link>

            <Link to="/tracking" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>
              Theo dõi thuê
            </Link>
            
            <Link to="/profile" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>
              Chào, {user.hoTen}
            </Link>

            <button 
              onClick={handleLogout} 
              className="btn-login" 
              style={{ backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          // --- TRẠNG THÁI: CHƯA ĐĂNG NHẬP ---
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login">
              <button className="btn-login">Đăng nhập</button>
            </Link>
            
            <Link to="/register">
              <button 
                className="btn-login" 
                style={{ backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }} 
              >
                Đăng ký
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;