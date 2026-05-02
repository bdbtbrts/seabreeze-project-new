import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm để chuyển trang sau khi đăng nhập
import './Login.css'; // Đã import cẩn thận, không sợ đen màn hình nữa nha!
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple, FaChevronDown } from 'react-icons/fa';

function Login() {
  // --- PHẦN CODE BỔ SUNG: Xử lý dữ liệu ---
  const [formData, setFormData] = useState({
    email: '',
    matKhau: '' // Cần thêm mật khẩu để đối chiếu với database
  });
  
  const navigate = useNavigate();

  // Cập nhật dữ liệu khi Thịnh gõ chữ
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi nhấn nút "Tiếp tục"
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng nhập thành công! Chào " + data.user.hoTen);
        localStorage.setItem('user', JSON.stringify(data.user)); // Lưu phiên đăng nhập
        navigate('/'); // Chuyển về trang chủ
      } else {
        alert("Thất bại: " + data.error);
      }
    } catch (error) {
      alert("Lỗi kết nối Server! Vui lòng thử lại sau.");
    }
  };
  // ---------------------------------------

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

        {/* PHẦN BỔ SUNG: Bọc vào thẻ form để xử lý gửi dữ liệu */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" // Quan trọng để khớp với formData
              placeholder="id@email.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* PHẦN BỔ SUNG: Cần có thêm ô Mật khẩu thì mới đăng nhập được */}
          <div className="input-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              name="matKhau" 
              placeholder="Nhập mật khẩu" 
              value={formData.matKhau}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-continue">Tiếp tục</button>
        </form>

        <div className="other-login">
          <span>Đăng nhập bằng cách khác</span>
          <FaChevronDown size={12} />
        </div>
      </div>
    </div>
  );
}

export default Login;