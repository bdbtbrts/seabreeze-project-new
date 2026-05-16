import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Sử dụng useNavigate để chuyển trang mượt hơn
import './Register.css'; // Đảm bảo Thịnh đã tạo file Register.css như mình gửi lúc nãy

const Register = () => {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    soDienThoai: ''
  });
  
  const [error, setError] = useState(''); // State để hiển thị lỗi ngay trên giao diện
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ trước khi gửi yêu cầu mới

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Đăng ký thành công! Chào mừng bạn đến với SeaBreeze.");
        navigate('/login'); // Chuyển hướng sang trang đăng nhập ngay lập tức
      } else {
        // Hiển thị lỗi từ Server (ví dụ: Email đã tồn tại)
        setError(data.error || "Đăng ký thất bại, vui lòng kiểm tra lại.");
      }
    } catch (error) {
      setError("⚠️ Lỗi kết nối đến Server bộ não!");
    }
  };

  return (
    <div className="register-master-container">
      <div className="register-card">
        <h1 className="register-title">SeaBreeze</h1>
        <p className="register-subtitle">Đăng ký thành viên nghỉ dưỡng</p>

        {/* Hiển thị thông báo lỗi nếu có */}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label className="input-label">Họ và Tên</label>
            <input 
              type="text" 
              name="hoTen" 
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
              name="soDienThoai" 
              placeholder="Nhập số điện thoại" 
              className="register-input"
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mật khẩu</label>
            <input 
              type="password" 
              name="matKhau" 
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
          <Link to="/login" className="login-link">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;