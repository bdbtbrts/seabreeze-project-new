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
    const [reviews, setReviews] = useState([]);
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2)
        : "Chưa có";

    useEffect(() => {
        setLoading(true);
        // 1. Lấy thông tin Host
        api.get(`/api/users/${hostId}`)
            .then(res => setHost(res.data))
            .catch(err => console.error("Lỗi lấy thông tin host:", err));

        api.get(`/api/hosts/${hostId}/reviews`)
            .then(res => setReviews(res.data))
            .catch(err => console.error("Lỗi lấy đánh giá host:", err));
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

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Đang tải hồ sơ...</div>;
    if (!host) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Không tìm thấy chủ nhà!</div>;

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
                <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalReviews}</div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', marginTop: '4px' }}>ĐÁNH GIÁ</div>
                    </div>

                    {/* Đường kẻ dọc phân cách */}
                    <div style={{ width: '1px', backgroundColor: '#ddd' }}></div>

                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                            {avgRating} <i className="fa-solid fa-star" style={{ fontSize: '14px' }}></i>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', marginTop: '4px' }}>XẾP HẠNG</div>
                    </div>

                    {/* Đường kẻ dọc phân cách */}
                    <div style={{ width: '1px', backgroundColor: '#ddd' }}></div>

                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>4</div> {/* M có thể thay số 4 bằng dữ liệu kinh nghiệm từ DB */}
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', marginTop: '4px' }}>NĂM KINH NGHIỆM</div>
                    </div>
                </div>

                <div className="hp-right-info">
                    <h1>Thông tin về {host.name}</h1>
                    <div className="hp-info-list">
                        <div className="hp-info-item">
                            <i className="fa-solid fa-briefcase"></i>
                            <div>Công việc: {host.job || 'Chưa cập nhật'}</div>
                        </div>
                        <div className="hp-info-item" style={{ marginTop: '10px' }}>
                            <i className="fa-solid fa-book"></i>
                            <div>Giới thiệu: {host.description || 'Chủ nhà này chưa viết giới thiệu.'}</div>
                        </div>
                        <div className="hp-info-item" style={{ marginTop: '10px' }}>
                            <i className="fa-solid fa-shield-check"></i>
                            <div style={{ textDecoration: 'underline' }}>Đã xác minh danh tính</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hp-reviews-section" style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Đánh giá của {host?.name}</h2>

                {reviews.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '30px'
                    }}>
                        {reviews.map((review, index) => (
                            <div key={index} className="hp-review-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                    <img
                                        src={getAvatarUrl(review.avatar)}
                                        alt="avatar"
                                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 'bold' }}>{review.author}</h4>
                                        <p style={{ margin: 0, color: '#717171', fontSize: '14px' }}>{review.location || 'Khách hàng'}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', marginBottom: '10px' }}>
                                    <span style={{ color: '#222' }}>{"★".repeat(review.rating)}</span>
                                    <span style={{ color: '#717171' }}> · {review.date}</span>
                                </div>
                                <p style={{ color: '#222', fontSize: '16px', lineHeight: '1.5' }}>
                                    {review.content}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Chủ nhà này chưa có đánh giá nào.</p>
                )}
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
