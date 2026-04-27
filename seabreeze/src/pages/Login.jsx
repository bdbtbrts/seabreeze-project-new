import React from 'react';
import './Login.css'; // Đã import cẩn thận, không sợ đen màn hình nữa nha!
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple, FaChevronDown } from 'react-icons/fa';

function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        {/* Đã sửa tiêu đề theo đúng yêu cầu */}
        <h2>Đăng nhập hoặc đăng kí</h2>
        <p className="login-subtitle">
          Đăng ký miễn phí hoặc đăng nhập để nhận được các ưu đãi và quyền lợi hấp dẫn!
        </p>

        <div className="social-login">
          <button className="btn-social btn-google">
            <div className="icon-wrapper"><FcGoogle size={18} /></div>
            <span>Đăng nhập bằng Google</span>
          </button>
          
          <button className="btn-social btn-facebook">
            <FaFacebook className="social-icon" />
            <span>Đăng nhập với Facebook</span>
          </button>
          
          <button className="btn-social btn-apple">
            <FaApple className="social-icon" />
            <span>Đăng nhập bằng Apple</span>
          </button>
        </div>

        <div className="divider-text">
          <span>hoặc</span>
        </div>

        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="id@email.com" />
        </div>

        <button className="btn-continue">Tiếp tục</button>

        <div className="other-login">
          <span>Đăng nhập bằng cách khác</span>
          <FaChevronDown size={12} />
        </div>
      </div>
    </div>
  );
}

export default Login;