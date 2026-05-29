import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; 

const Register = () => {
  // Đã sửa key cho khớp với cột trong MySQL của Laravel
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      // Đã sửa lại đường dẫn API trỏ về Laravel
      const response = await fetch('http://localhost/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' // <--- Đưa nó vào đây mới đúng nè!
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Đăng ký thành công! Chào mừng bạn đến với SeaBreeze.");
        navigate('/login'); 
      } else {
        setError(data.message || "Đăng ký thất bại, vui lòng kiểm tra lại.");
      }
    } catch (error) {
      setError("⚠️ Lỗi kết nối đến Server Laravel!");
    }
  };

  return (
    <div className="register-master-container">
      <div className="register-card">
        <h1 className="register-title">SeaBreeze</h1>
        <p className="register-subtitle">Đăng ký tài khoản Seabreeze ngay!</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label className="input-label">Họ và Tên</label>
            <input 
              type="text" 
              name="name"  /* Đổi thành name */
              placeholder="Nhập họ và tên" 
              className="register-input"
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="example@gmail.com" 
              className="register-input"
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Số điện thoại</label>
            <input 
              type="text" 
              name="phone" /* Đổi thành phone */
              placeholder="Nhập số điện thoại" 
              className="register-input"
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mật khẩu</label>
            <input 
              type="password" 
              name="password" /* Đổi thành password */
              placeholder="Nhập mật khẩu bảo mật" 
              className="register-input"
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-register-submit">
            ĐĂNG KÝ NGAY
          </button>
        </form>

        <div className="register-footer">
          Đã có tài khoản? 
          <Link to="/login" className="login-link"> Đăng nhập</Link>
        </div>
      </div></div>
  );
};

export default Register;