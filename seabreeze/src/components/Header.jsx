import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCartShopping } from 'react-icons/fa6';
import { useCart } from '../context/CartContext'; // Import hook giỏ hàng của bạn
import './Header.css';

function Header() {
  const navigate = useNavigate();
  // 1. Lấy dữ liệu giỏ hàng
  const { totalItems } = useCart();

  // 2. Xử lý trạng thái đăng nhập (Gộp chung logic cho gọn)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  console.log("Dữ liệu user nè: ", user);
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

        {/* NÚT ĐIỀU HƯỚNG PHÂN QUYỀN */}
        {/* Nếu là Chủ nhà thì hiện Kênh Chủ Nhà */}
        {user?.role === 'Chủ nhà' && (
          <button className="header-action-btn btn-host" onClick={() => navigate('/host-dashboard')}>
            <i className="fa-solid fa-house-user"></i> Kênh Chủ Nhà
          </button>
        )}

        {/* Nếu là Khách thường, chỉ hiện nút "Trở thành chủ nhà" */}
        {user?.role === 'Khách hàng' && (
          <button className="header-action-btn btn-become-host" onClick={() => navigate('/register-host')}>
            <i className="fa-solid fa-handshake"></i> Trở thành Chủ nhà
          </button>
        )}

        {/* Chỉ hiện Cổng Admin nếu đúng role là Admin */}
        {user?.role === 'Admin' && (
          <button className="header-action-btn btn-admin" onClick={() => navigate('/admin')}>
            <i className="fa-solid fa-shield-halved"></i> Cổng Admin
          </button>
        )}

        {/* Nút Giỏ hàng */}
        <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="cart-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaCartShopping size={20} />
            <span className="cart-count">{totalItems}</span>
          </div>
        </Link>

        {/* Khu vực Đăng nhập/Đăng xuất */}
        {user ? (
          // --- TRẠNG THÁI: ĐÃ ĐĂNG NHẬP ---
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/history" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>
              Lịch sử thuê phòng
            </Link>

            <Link to="/rental-history" className="nav-link">
              <i className="fa-solid fa-camera"></i> Lịch sử thuê đồ
            </Link>

            {/* Lấy tên user (dự phòng trường hợp backend trả về name hoặc hoTen) */}
            <Link to="/profile" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>
              Chào, {user.name || user.hoTen}
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