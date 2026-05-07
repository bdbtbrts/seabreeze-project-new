import React from 'react';
import { Link } from 'react-router-dom';
import { FaCartShopping } from 'react-icons/fa6'; // Dùng icon từ react-icons theo đúng code cũ của bạn
import { useCart } from '../context/CartContext'; // Import hook giỏ hàng
import './Header.css';

function Header() {
  // Gọi hook để lấy tổng số lượng item đang có trong giỏ
  const { totalItems } = useCart();

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
        <a href="/" className="nav-item">Trang chủ</a>
        <a href="#homestay-section" className="nav-item">Homestay</a>
        <a href="#rent-section" className="nav-item">Thuê đồ</a>
        <a href="#contact-footer" className="nav-item">Liên hệ</a>
      </nav>
      
      {/* 3. KHU VỰC GIỎ HÀNG & ĐĂNG NHẬP */}
      <div className="user-actions">
        {/* Nút giỏ hàng: Đã bọc thẻ Link để chuyển hướng sang trang /cart */}
        <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <div className="cart-icon" style={{ position: 'relative' }}>
            <FaCartShopping size={20} />
            {/* Hiển thị số lượng thực tế từ Context */}
            <span className="cart-count">{totalItems}</span>
          </div>
        </Link>

        {/* Nút đăng nhập */}
        <Link to="/login">
          <button className="btn-login">Đăng nhập</button>
        </Link>
      </div>
    </header>
  );
}

export default Header;