import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './HostProfile.css';

export default function HostProfile() {
    const { hostId } = useParams();
    const navigate = useNavigate();
    
    const [host, setHost] = useState(null);
    const [hostListings, setHostListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hàm lấy link ảnh chuẩn
    const getAvatarUrl = (avatar) => {
        if (!avatar) return "https://placehold.co/200";
        if (avatar.startsWith('http')) return avatar;
        return `https://seabreeze-backend-wkqw.onrender.com/storage/${avatar}`;
    };

    useEffect(() => {
        setLoading(true);
        // 1. Gọi API lấy thông tin CHỦ NHÀ
        api.get(`/api/users/${hostId}`) 
            .then(res => setHost(res.data))
            .catch(err => console.error("Lỗi lấy thông tin host:", err));

        // 2. Gọi API lấy danh sách phòng CỦA CHỦ NHÀ ĐÓ
        api.get(`/api/rooms?host_id=${hostId}`) 
            .then(res => {
                setHostListings(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [hostId]);

    if (loading) return <div style={{textAlign: 'center', marginTop: '100px'}}>Đang tải hồ sơ...</div>;
    if (!host) return <div style={{textAlign: 'center', marginTop: '100px'}}>Không tìm thấy chủ nhà!</div>;

    return (
        <div className="hp-container">
            {/* HEADER: AVATAR & THÔNG TIN ĐỘNG */}
            <div className="hp-header">
                <div className="hp-left-card">
                    <div className="hp-avatar-section">
                        <img src={getAvatarUrl(host.avatar)} alt={host.name} className="hp-avatar" />
                        <h2 className="hp-name">{host.name || host.hoTen}</h2>
                        <span className="hp-title-sub"><i className="fa-solid fa-award"></i> Chủ nhà siêu cấp</span>
                    </div>
                    {/* Stats có thể để tĩnh hoặc fetch thêm nếu backend có trả về */}
                    <div className="hp-stats-grid">
                        <div className="hp-stat-item"><h3>{hostListings.length}</h3><p>Chỗ ở</p></div>
                        <div className="hp-stat-item"><h3>4,88 <i className="fa-solid fa-star"></i></h3><p>Xếp hạng</p></div>
                    </div>
                </div>

                <div className="hp-right-info">
                    <h1>Thông tin về {host.name || host.hoTen}</h1>
                    <div className="hp-info-list">
                        <div className="hp-info-item">
                            <i className="fa-solid fa-briefcase"></i>
                            <div>Công việc: {host.job || 'Host homestay'}</div>
                        </div>
                        <div className="hp-info-item">
                            <i className="fa-solid fa-shield-check"></i>
                            <div style={{textDecoration: 'underline'}}>Đã xác minh danh tính</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BÀI ĐĂNG CỦA HOST (ĐỘNG) */}
            <div className="hp-section">
                <h2 className="hp-section-title">Bài đăng của {host.name || host.hoTen}</h2>
                <div className="hp-listings-grid">
                    {hostListings.length > 0 ? hostListings.map(room => (
                        <Link to={`/homestay/${room.id}`} key={room.id} className="hp-listing-card">
                            <img src={room.images?.[0] || 'https://placehold.co/400x300'} alt={room.title} className="hp-listing-img" />
                            <p className="hp-listing-title">{room.title}</p>
                            <p className="hp-listing-rating"><i className="fa-solid fa-star"></i> {room.rating || "4.8"}</p>
                        </Link>
                    )) : <p>Chủ nhà chưa có bài đăng nào.</p>}
                </div>
            </div>

            <footer className="main-footer">
                <div className="footer-bottom">&copy; 2026 SeaBreeze Project - UIT Students.</div>
            </footer>
        </div>
    );
}
