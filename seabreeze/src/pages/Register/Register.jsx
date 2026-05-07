import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    soDienThoai: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Thành công: " + data.message);
        // Đăng ký xong có thể chuyển hướng về trang login:
        // window.location.href = '/login';
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (error) {
      alert("Lỗi kết nối! Vui lòng thử lại sau.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Đăng Ký Tài Khoản SeaBreeze</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" name="hoTen" placeholder="Họ và Tên" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="matKhau" placeholder="Mật khẩu" onChange={handleChange} required />
        <input type="text" name="soDienThoai" placeholder="Số điện thoại" onChange={handleChange} />
        <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px', cursor: 'pointer' }}>
          Đăng ký ngay
        </button>
      </form>
    </div>
  );
};

export default Register;