import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaChevronDown } from 'react-icons/fa';

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

      // GỌI API LẤY INFO USER CÓ CẢ ROLE
      fetch('http://localhost/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
        .then(res => res.json())
        .then(userData => {
          // LƯU CẢ CỤC USER VÀO LOCALSTORAGE
          localStorage.setItem('user', JSON.stringify(userData));
          alert("Đăng nhập thành công!");
          window.location.href = '/';
        })
        .catch(err => console.error("Lỗi lấy user:", err));
    }
  }, []);

  // 2. Hàm xử lý nhấn nút Google
  const handleGoogleLogin = () => {
    // Redirect thẳng tới route Laravel
    window.location.href = 'http://localhost/auth/google/redirect';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng nhập thành công! Chào " + data.user.name);
        localStorage.setItem('user', JSON.stringify(data.user));
        const token = data.token || data.access_token;
        if (token) {
          localStorage.setItem('token', token);
        }
        window.location.href = '/';
      } else {
        setErrorMsg(data.message || "Email hoặc mật khẩu không đúng.");
      }
    } catch (error) {
      setErrorMsg("Lỗi kết nối Server Laravel! Vui lòng thử lại sau.");
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
          {/* M ĐÃ GẮN handleGoogleLogin VÀO ĐÂY RỒI NÈ */}
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
        top: '-10px',           // Kéo tuột lên trên 10px để đè lên viền
        left: '12px',           // Thụt vào trong 12px cho bằng với ô Email
        background: '#fff',     // PHÉP THUẬT NẰM Ở ĐÂY: Nền trắng che mất cái viền bên dưới
        padding: '0 5px',
        fontSize: '13px',
        color: '#666',
        fontWeight: 'normal',
        zIndex: 10              // Ưu tiên hiển thị lên trên cùng
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