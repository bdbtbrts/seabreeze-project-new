import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function LoginHost() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/login', formData);
            const user = res.data.user;

            if (user.role === 'Chủ nhà' || user.role === 'Admin') {
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = '/host-dashboard'; // Vào thẳng trang Host
            } else {
                alert("Tài khoản này không phải Chủ nhà!");
            }
        } catch (err) {
            alert("Sai email hoặc mật khẩu!");
        }
    };

    return (
        <div className="login-container" style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Đăng nhập Kênh Chủ Nhà</h2>
            <form onSubmit={handleLogin} style={{ maxWidth: '300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="email" placeholder="Email" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <input type="password" placeholder="Mật khẩu" onChange={e => setFormData({ ...formData, password: e.target.value })} />
                <button type="submit">Đăng nhập</button>
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                    Đã có tài khoản Chủ nhà? <Link to="/login-host">Đăng nhập ngay</Link>
                </p>
            </form>
            <p>Chưa có tài khoản? <Link to="/new-host-register">Đăng ký mới</Link></p>
        </div>
    );
}