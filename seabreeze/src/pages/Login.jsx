import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import api from '../api';

function Login() {
  // Biến chuyển đổi giữa form Đăng nhập và Đăng ký
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '' // Thêm trường xác nhận mật khẩu
  });

  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  
  // Trạng thái bật/tắt con mắt cho 2 ô mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Rào trước vụ mật khẩu không khớp khi Đăng ký
    if (!isLogin && formData.password !== formData.confirmPassword) {
      return setErrorMsg('❌ Mật khẩu nhập lại không khớp!');
    }

    try {
      // Dùng chung form: Nếu là isLogin thì gọi '/api/login', ngược lại gọi '/api/register'
      const endpoint = isLogin ? '/api/login' : '/api/register';
      
      const response = await api.post(endpoint, {
        email: formData.email,
        password: formData.password
        // Backend Laravel thường bắt password_confirmation, nếu m cần thì sửa tên biến ở đây nhé
      });
      
      const data = response.data;

      alert("🎉 Thành công! Chào " + (data.user?.name || data.user?.hoTen || formData.email));
      
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      
      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem('token', token);
      }
      
      window.location.href = '/';
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Thông tin không chính xác hoặc email đã tồn tại.";
      setErrorMsg("❌ " + errorMessage);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>{isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới'}</h2>
        <p className="login-subtitle">
          {isLogin 
            ? 'Chào mừng bạn quay lại với SeaBreeze!' 
            : 'Đăng ký ngay để nhận được các ưu đãi và quyền lợi hấp dẫn!'}
        </p>

        {errorMsg && (
          <div style={{ color: '#dc2626', marginBottom: '15px', textAlign: 'center', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', fontWeight: '500' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Ô EMAIL */}
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="id@email.com" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          {/* Ô MẬT KHẨU */}
          <div className="input-group">
            <div style={{ position: 'relative', marginTop: '15px', marginBottom: isLogin ? '20px' : '15px' }}>
                <label style={{
                    position: 'absolute', top: '-10px', left: '12px', background: '#fff', 
                    padding: '0 5px', fontSize: '13px', color: '#666', fontWeight: 'normal', zIndex: 10 
                }}>
                    Mật khẩu
                </label>
                <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Nhập mật khẩu" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    style={{ 
                        width: '100%', padding: '14px 40px 14px 15px', boxSizing: 'border-box',
                        borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#f3f6fc', 
                        outline: 'none', fontSize: '15px'
                    }} 
                />
                <i 
                    className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', 
                        cursor: 'pointer', color: '#666', fontSize: '16px', zIndex: 10
                    }}
                ></i>
            </div>
          </div>

          {/* Ô NHẬP LẠI MẬT KHẨU (CHỈ HIỆN KHI ĐĂNG KÝ) */}
          {!isLogin && (
            <div className="input-group">
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <label style={{
                      position: 'absolute', top: '-10px', left: '12px', background: '#fff', 
                      padding: '0 5px', fontSize: '13px', color: '#666', fontWeight: 'normal', zIndex: 10 
                  }}>
                      Xác nhận mật khẩu
                  </label>
                  <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword" 
                      placeholder="Nhập lại mật khẩu" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      required={!isLogin} 
                      style={{ 
                          width: '100%', padding: '14px 40px 14px 15px', boxSizing: 'border-box',
                          borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#f3f6fc', 
                          outline: 'none', fontSize: '15px'
                      }} 
                  />
                  <i 
                      className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                          position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', 
                          cursor: 'pointer', color: '#666', fontSize: '16px', zIndex: 10
                      }}
                  ></i>
              </div>
            </div>
          )}
          
          <button type="submit" className="btn-continue">
            {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>

        {/* NÚT CHUYỂN ĐỔI ĐĂNG NHẬP / ĐĂNG KÝ */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          {isLogin ? "Bạn chưa có tài khoản? " : "Bạn đã có tài khoản? "}
          <span 
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(''); // Xóa lỗi khi đổi form
            }}
            style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </span>
        </div>

      </div>
    </div>
  );
}

export default Login;