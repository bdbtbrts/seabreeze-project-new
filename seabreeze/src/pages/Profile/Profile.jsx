import React, { useState, useEffect } from 'react';
import './Profile.css'; // --- PHẦN BỔ SUNG: Import file CSS mới tạo ---

const Profile = () => {
  const [user, setUser] = useState(null);
  const [soDienThoai, setSoDienThoai] = useState('');
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150');
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser);
      setSoDienThoai(savedUser.soDienThoai || '');
      // Sửa nhẹ logic hiển thị ảnh: Ưu tiên ảnh Database -> LocalStorage -> Mặc định
      setAvatar(savedUser.AVATAR || savedUser.avatar || 'https://logoseabreeze.png'); 
    } else {
      window.location.href = '/login';
    }
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('email', user.email);

    try {
      const response = await fetch('http://localhost:5000/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setAvatar(data.avatarUrl);
        // Nhớ update đúng trường AVATAR cho đồng bộ database
        const updatedUser = { ...user, AVATAR: data.avatarUrl }; 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert("🎉 Cập nhật ảnh đại diện thành công!");
      } else {
        alert("❌ Lỗi: " + data.error);
      }
    } catch (error) {
      alert("⚠️ Lỗi kết nối server khi tải ảnh!");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, soDienThoai }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("🎉 Thành công: " + data.message);
        const updatedUser = { ...user, soDienThoai: data.user.soDienThoai };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        alert("❌ Lỗi: " + data.error);
      }
    } catch (error) {
      alert("⚠️ Lỗi kết nối server!");
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("❌ Mật khẩu mới nhập lại không khớp!");
    }

    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          oldPassword: passwords.oldPassword, 
          newPassword: passwords.newPassword 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("🎉 Đổi mật khẩu thành công!");
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert("❌ Lỗi: " + data.error);
      }
    } catch (error) {
      alert("⚠️ Lỗi kết nối server!");
    }
  };

  if (!user) return <div className="profile-master-container">Đang tải hồ sơ...</div>;

  return (
    // Áp dụng class bao ngoài
    <div className="profile-master-container">
      {/* Khối thẻ chính */}
      <div className="profile-card">
        <h1 className="profile-header-title">Hồ Sơ Cả Nhân</h1>
        
        <div className="form-section">
          
          {/* --- GIAO DIỆN AVATAR (Class mới) --- */}
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img 
                src={avatar} 
                alt="Avatar" 
                className="avatar-image" // Class cho ảnh tròn
              />
              <label htmlFor="avatar-input" className="avatar-edit-label">
                📷
              </label>
              <input 
                id="avatar-input" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                style={{ display: 'none' }} 
              />
            </div>
            
            <p className="profile-user-name">{user.hoTen}</p>
            <p className="profile-user-email">{user.email}</p>
            <span className="role-badge">
              {user.vaiTro || 'Khách hàng'}
            </span>
          </div>
          
          {/* --- CẬP NHẬT THÔNG TIN (Class mới) --- */}
          <div className="form-group">
            <h3 className="form-group-title">👤 Thông tin cơ bản</h3>
            
            <div className="form-input-wrapper">
              <label className="form-label">Số điện thoại:</label>
              <input 
                type="text" 
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                placeholder="Nhập số điện thoại mới" 
                className="form-input" 
              />
            </div>
            
            <button 
              onClick={handleUpdateProfile}
              className="btn-save-profile" // Class nút bấm mới
            >
              Lưu thay đổi
            </button>
          </div>

          {/* --- ĐỔI MẬT KHẨU (Class mới) --- */}
          <div className="form-group">
            <h3 className="form-group-title">🔒 Bảo mật tài khoản</h3>
            
            <div className="form-input-wrapper">
              <input 
                type="password" 
                placeholder="Mật khẩu hiện tại" 
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                className="form-input" 
              />
            </div>
            
            <div className="form-input-wrapper">
              <input 
                type="password" 
                placeholder="Mật khẩu mới" 
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                className="form-input" 
              />
            </div>
            
            <div className="form-input-wrapper">
              <input 
                type="password" 
                placeholder="Xác nhận mật khẩu mới" 
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                className="form-input" 
              />
            </div>
            
            <button 
              onClick={handleChangePassword}
              className="btn-change-password" // Class nút lá cây bo góc
            >
              Đổi mật khẩu
            </button>
          </div>

          {/* --- ĐĂNG XUẤT (Class nút viền đỏ xịn) --- */}
          <button 
            onClick={() => {
              localStorage.removeItem('user');
              alert("👋 Đã đăng xuất thành công. Hẹn gặp lại!");
              window.location.href = '/login';
            }}
            className="btn-logout"
          >
            ĐĂNG XUẤT TÀI KHOẢN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;