import './Header.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUmbrellaBeach, FaCartShopping } from 'react-icons/fa6';

function Header() {
  return (
    <header className="mainHeader">
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', color: '#009be5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* src="/logoseabreeze.png" vì file nằm trong thư mục public */}
          <img
            src="/logoseabreeze.png"
            alt="logo"
            style={{ width: '30px', height: '30px', objectFit: 'contain' }}
          />
          SeaBreeze
        </Link>
      </div>

      <nav className="nav-menu">
        <a href="/" className="nav-item">Trang chủ</a>
        <a href="#homestay-section" className="nav-item">Homestay</a>
        <a href="#rent-section" className="nav-item">Thuê đồ</a>
        <a href="#contact-footer" className="nav-item">Liên hệ</a>
      </nav>
      <div className="user-actions">
        <div className="cart-icon">
          <FaCartShopping />
          <span className="cart-count">0</span>
        </div>
        {/* Bấm vào nút này sẽ sang trang đăng nhập */}
        <Link to="/login">
          <button className="btn-login">Đăng nhập</button>
        </Link>
      </div>
    </header>
  );
}

export default Header; 