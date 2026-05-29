import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FcGoogle } from 'react-icons/fc';
import api from '../api'; // Lôi "bộ não" vào đây

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  // Biến dùng để theo dõi xem có đang mở mắt hay nhắm mắt
  const [showPassword, setShowPassword] = useState(false);

  // 1. useEffect: Hứng token từ URL (được redirect từ Laravel sau khi đăng nhập Google)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);

      // GỌI API LẤY INFO USER BẰNG axios api
      api.get('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          // LƯU CẢ CỤC USER VÀO LOCALSTORAGE
          localStorage.setItem('user', JSON.stringify(res.data));
          alert("Đăng nhập thành công!");
          window.location.href = '/';
        })
        .catch(err => console.error("Lỗi lấy user:", err));
    }
  }, []);

  // 2. Hàm xử lý nhấn nút Google
  const handleGoogleLogin = () => {
    // Đã thay localhost thành link server Render chuẩn chỉnh
    window.location.href = 'https://seabreeze-backend-wkqw.onrender.com/auth/google/redirect';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      // Đổi fetch thành api.post, tự động ăn link Render
      const response = await api.post('/api/login', formData);
      const data = response.data;

      alert("Đăng nhập thành công! Chào " + data.user.name);
      localStorage.setItem('user', JSON.stringify(data.user));
      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem('token', token);
      }
      window.location.href = '/';
      
    } catch (error) {
      // Xử lý báo lỗi nếu sai pass hoặc email
      const errorMessage = error.response?.data?.message || "Email hoặc mật khẩu không đúng.";
      setErrorMsg(errorMessage);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Đăng nhập hoặc đăng kí</h2>
        <p className="login-subtitle">
          Đăng ký miễn phí hoặc đăng nhập để nhận được các ưu đãi và quyền lợi hấp dẫn!
        </p>

        {errorMsg && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '5px' }}>{errorMsg}</div>}

        <div className="social-login">
          <button className="btn-social btn-google" onClick={handleGoogleLogin}>
            <div className="icon-wrapper"><FcGoogle size={18} /></div>
            <span>Đăng nhập bằng Google</span>
          </button>
        </div>

        <div className="divider-text">
          <span>hoặc</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="id@email.com" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="input-group">
            {/* Bọc tất cả vào 1 div relative để dễ canh tọa độ */}
            <div style={{ position: 'relative', marginTop: '15px', marginBottom: '20px' }}>
                
                {/* Nhấc Label lên chèn ngang viền */}
                <label style={{
                    position: 'absolute',
                    top: '-10px',          // Kéo tuột lên trên 10px để đè lên viền
                    left: '12px',          // Thụt vào trong 12px cho bằng với ô Email
                    background: '#fff',    // PHÉP THUẬT NẰM Ở ĐÂY: Nền trắng che mất cái viền bên dưới
                    padding: '0 5px',
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: 'normal',
                    zIndex: 10             // Ưu tiên hiển thị lên trên cùng
                }}>
                    Mật khẩu
                </label>
                
                {/* Ô input */}
                <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Nhập mật khẩu" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    style={{ 
                        width: '100%', 
                        padding: '14px 40px 14px 15px', // Trái/trên/dưới 15px, bên phải chừa 40px cho con mắt
                        boxSizing: 'border-box',
                        borderRadius: '8px',
                        border: '1px solid #ced4da',    // Màu viền xám nhạt
                        backgroundColor: '#f3f6fc',     // Màu nền hơi xanh xám giống y hệt ô Email của m
                        outline: 'none',
                        fontSize: '15px'
                    }} 
                />

                {/* Cục Icon con mắt */}
                <i 
                    className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',  // Ép nó nằm chính giữa theo chiều dọc
                        cursor: 'pointer',
                        color: '#666',
                        fontSize: '16px',
                        zIndex: 10
                    }}
                ></i>

            </div>
          </div>
          
          <button type="submit" className="btn-continue">Tiếp tục</button>
        </form>

      </div>
    </div>
  );
}

export default Login;