import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';

export default function RegisterHost() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // ĐƯA LÊN TRƯỚC: Phải lấy thông tin user hiện tại ra trước
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    // STATE NẰM SAU: Khởi tạo form data, lúc này currentUser đã tồn tại
    const [formData, setFormData] = useState({
        name: currentUser?.name || currentUser?.hoTen || '',
        phone: '',
        cccd: '',
        address: ''
    });

    useEffect(() => {
        if (!currentUser) {
            alert("Bạn cần đăng nhập trước!");
            navigate('/login');
        } else if (currentUser.role === 'Chủ nhà' || currentUser.role === 'Admin') {
            alert("Bạn đã có quyền quản lý rồi!");
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.phone || !formData.cccd) {
            alert("Vui lòng điền đầy đủ Số điện thoại và CCCD!");
            return;
        }

        setLoading(true);

        try {
            // Gọi API chọc xuống Laravel để đổi Role
            const res = await api.put(`/api/users/${currentUser.id}/upgrade-host`, {
                name: formData.name,
                phone: formData.phone,
                cccd: formData.cccd,
                address: formData.address
            });

            // Cập nhật lại cái Thẻ bài (localStorage)
            const updatedUser = { ...currentUser, role: 'Chủ nhà', name: formData.name, phone: formData.phone };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            alert("🎉 Đăng ký thành công! Chào mừng bạn đến với Kênh Chủ Nhà.");

            // Ép tải lại trang một lần để Header nhận diện Role mới, sau đó đá vào Host Dashboard
            window.location.href = '/host-dashboard';

        } catch (error) {
            console.error("Lỗi nâng cấp:", error);
            alert("⚠️ Lỗi hệ thống! Không thể nâng cấp tài khoản lúc này.");
            setLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div style={{ padding: '60px 20px', minHeight: '80vh', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '550px', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)' }}>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#e51d53', fontSize: '28px', marginBottom: '10px' }}>Trở thành Chủ nhà</h1>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>
                        Chia sẻ không gian của bạn và bắt đầu kiếm tiền cùng SeaBreeze ngay hôm nay.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                            Họ và tên người đại diện
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                            Số điện thoại liên hệ <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="tel"
                            placeholder="Nhập số điện thoại..."
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                            Số CMND/CCCD <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập mã định danh..."
                            value={formData.cccd}
                            onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                            Địa chỉ liên lạc
                        </label>
                        <textarea
                            placeholder="Tỉnh/Thành phố, Quận/Huyện..."
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', outline: 'none', resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? '#f43f5e80' : '#e51d53',
                            color: 'white',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận Đăng ký'}
                    </button>
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        Đã có tài khoản Chủ nhà? <Link to="/login-host">Đăng nhập ngay</Link>
                    </p>
                </form>

            </div>
        </div>
    );
}