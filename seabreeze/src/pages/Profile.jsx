import React, { useState, useEffect } from 'react';
import './Profile.css'; 
import api from '../api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [soDienThoai, setSoDienThoai] = useState('');
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150');
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Lấy token ra một lần ở đầu component để dùng chung
  const token = localStorage.getItem('token');

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser);
      setSoDienThoai(savedUser.soDienThoai || '');
      setAvatar(savedUser.AVATAR || savedUser.avatar || '/logoseabreeze.png'); 
    } else {
      // CHỈ đá về trang login khi KHÔNG có dữ liệu user trong localStorage
      window.location.href = '/login';
    }
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('email', user?.email);

    try {
      // Ép Axios phải nhận diện đây là FormData, không được tự ý đổi sang JSON
      const response = await api.post('/api/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // BẮT BUỘC PHẢI CÓ DÒNG NÀY!
          'Authorization': `Bearer ${token}` 
        }
      });

      const data = response.data; 
      setAvatar(data.avatarUrl);
      const updatedUser = { ...user, AVATAR: data.avatarUrl }; 
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("🎉 Cập nhật ảnh đại diện thành công!");


    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Không thể upload";
      alert("❌ Lỗi: " + errorMessage);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Đổi fetch thành api.put
      const response = await api.put('/api/update-profile', 
        { email: user.email, soDienThoai },
        {
          headers: { 
            'Authorization': `Bearer ${token}` // Kẹp token bảo mật
          }
        }
      );

      const data = response.data;
      alert("🎉 Thành công: " + data.message);
      const updatedUser = { ...user, soDienThoai: data.user.soDienThoai };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Lỗi kết nối server!";
      alert("❌ Lỗi: " + errorMessage);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("❌ Mật khẩu mới nhập lại không khớp!");
    }

    try {
      // Đổi fetch thành api.post
      const response = await api.post('/api/change-password', 
        { 
          email: user.email, 
          oldPassword: passwords.oldPassword, 
          newPassword: passwords.newPassword 
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}` // Kẹp token bảo mật
          }
        }
      );

      alert("🎉 Đổi mật khẩu thành công!");
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Lỗi kết nối server!";
      alert("❌ Lỗi: " + errorMessage);
    }
  };

  if (!user) return <div className="profile-master-container">Đang tải hồ sơ...</div>;

  return (
    <div className="profile-master-container">
      <div className="profile-card">
        <h1 className="profile-header-title">Hồ Sơ Cá Nhân</h1>
        
        <div className="form-section">
          {/* --- GIAO DIỆN AVATAR --- */}
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img src={avatar} alt="Avatar" className="avatar-image" />
              <label htmlFor="avatar-input" className="avatar-edit-label">📷</label>
              <input 
                id="avatar-input" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                style={{ display: 'none' }} 
              />
            </div>
            <p className="profile-user-name">{user.hoTen || user.name}</p>
            <p className="profile-user-email">{user.email}</p>
            <span className="role-badge">{user.vaiTro || user.role || 'Khách hàng'}</span>
          </div>
          
          {/* --- CẬP NHẬT THÔNG TIN --- */}
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
            <button onClick={handleUpdateProfile} className="btn-save-profile">Lưu thay đổi</button>
          </div>

          {/* --- ĐỔI MẬT KHẨU --- */}
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
            <button onClick={handleChangePassword} className="btn-change-password">Đổi mật khẩu</button>
          </div>

          {/* --- ĐĂNG XUẤT --- */}
          <button 
            onClick={() => {
              localStorage.clear(); // Xóa sạch cả user lẫn token cho an toàn
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