import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import './HostProfile.css';

export default function HostProfile() {
    const { hostId } = useParams();
    const [host, setHost] = useState(null);
    const [hostListings, setHostListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAvatarUrl = (avatar) => {
        if (!avatar) return "https://placehold.co/200";
        if (avatar.startsWith('http')) return avatar;
        return `https://seabreeze-backend-wkqw.onrender.com/storage/${avatar}`;
    };

    useEffect(() => {
        setLoading(true);
        // 1. Lấy thông tin Host
        api.get(`/api/users/${hostId}`) 
            .then(res => setHost(res.data))
            .catch(err => console.error("Lỗi lấy thông tin host:", err));

        // 2. Lấy phòng của Host
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

    // Giả lập đánh giá (vẫn giữ nguyên như yêu cầu của m)
    const hostReviews = [
        { id: 1, name: "James", loc: "Edinburgh, Anh", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5, date: "Hôm nay", text: "The stay was great..." },
        { id: 2, name: "Satoshi", loc: "Osaka, Nhật", avatar: "https://randomuser.me/api/portraits/men/44.jpg", rating: 5, date: "2 ngày trước", text: "Highly Recommended!..." }
    ];

    return (
        <div className="hp-container">
            {/* HEADER: AVATAR & THÔNG TIN */}
            <div className="hp-header">
                <div className="hp-left-card">
                    <div className="hp-avatar-section">
                        <img src={getAvatarUrl(host.avatar)} alt={host.name} className="hp-avatar" />
                        <h2 className="hp-name">{host.name}</h2>
                        <span className="hp-title-sub"><i className="fa-solid fa-award"></i> Chủ nhà siêu cấp</span>
                    </div>
                </div>

                <div className="hp-right-info">
                    <h1>Thông tin về {host.name}</h1>
                    <div className="hp-info-list">
                        <div className="hp-info-item">
                            <i className="fa-solid fa-briefcase"></i>
                            <div>Công việc: {host.job || 'Chưa cập nhật'}</div>
                        </div>
                        <div className="hp-info-item" style={{marginTop: '10px'}}>
                            <i className="fa-solid fa-book"></i>
                            <div>Giới thiệu: {host.description || 'Chủ nhà này chưa viết giới thiệu.'}</div>
                        </div>
                        <div className="hp-info-item" style={{marginTop: '10px'}}>
                            <i className="fa-solid fa-shield-check"></i>
                            <div style={{textDecoration: 'underline'}}>Đã xác minh danh tính</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BÀI ĐĂNG CỦA HOST */}
            <div className="hp-section">
                <h2 className="hp-section-title">Bài đăng của {host.name}</h2>
                <div className="hp-listings-grid">
                    {hostListings.length > 0 ? hostListings.map(room => (
                        <Link to={`/homestay/${room.id}`} key={room.id} className="hp-listing-card">
                            <img src={room.images?.[0] || 'https://placehold.co/400x300'} alt={room.title} className="hp-listing-img" />
                            <p className="hp-listing-title">{room.title}</p>
                            <p className="hp-listing-rating"><i className="fa-solid fa-star"></i> 4.8</p>
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