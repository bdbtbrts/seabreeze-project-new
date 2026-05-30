import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import './HostProfile.css';

export default function HostProfile() {
    const { hostId } = useParams();
    const [host, setHost] = useState(null);
    const [hostListings, setHostListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    const getAvatarUrl = (avatar) => {
        if (!avatar) return "https://placehold.co/200";
        if (avatar.startsWith('http')) return avatar;
        return `https://seabreeze-backend-wkqw.onrender.com/storage/${avatar}`;
    };

    // Tính toán thống kê
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

        // 2. Lấy đánh giá của Host
        api.get(`/api/hosts/${hostId}/reviews`)
            .then(res => {
                const reviewData = Array.isArray(res.data) ? res.data : (res.data.data || []);
                // Format lại ngày tháng cho đẹp
                const formattedReviews = reviewData.map(r => {
                    const d = new Date(r.created_at);
                    return {
                        ...r,
                        date: !isNaN(d) ? `tháng ${d.getMonth() + 1} năm ${d.getFullYear()}` : 'Gần đây'
                    };
                });
                setReviews(formattedReviews);
            })
            .catch(err => console.error("Lỗi lấy đánh giá host:", err));

        // 3. Lấy phòng của Host
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

    return (
        <div className="hp-container">
            {/* HEADER: AVATAR & THÔNG TIN */}
            <div className="hp-header">

                {/* --- CỘT TRÁI: CARD AVATAR --- */}
                <div className="hp-left-card" style={{
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
                    textAlign: 'center',
                    border: '1px solid #ebebeb'
                }}>
                    <div className="hp-avatar-section">
                        <img
                            src={getAvatarUrl(host.avatar)}
                            alt={host.name}
                            className="hp-avatar"
                            style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto' }}
                        />
                        <h2 className="hp-name" style={{ marginTop: '16px', fontSize: '28px', fontWeight: '800', color: '#222' }}>
                            {host.name}
                        </h2>
                        <span className="hp-title-sub" style={{ display: 'block', marginBottom: '12px', color: '#717171', fontWeight: '600' }}>
                            <i className="fa-solid fa-award" style={{ color: '#222' }}></i> Chủ nhà siêu cấp
                        </span>
                    </div>
                    
                    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ebebeb' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: '800', color: '#222' }}>{totalReviews}</div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#717171', marginTop: '4px', letterSpacing: '0.5px' }}>ĐÁNH GIÁ</div>
                        </div>

                        <div style={{ width: '1px', height: '35px', backgroundColor: '#ebebeb' }}></div>

                        <div>
                            <div style={{ fontSize: '22px', fontWeight: '800', color: '#222' }}>
                                {avgRating} <i className="fa-solid fa-star" style={{ fontSize: '14px', position: 'relative', top: '-2px' }}></i>
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#717171', marginTop: '4px', letterSpacing: '0.5px' }}>XẾP HẠNG</div>
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: THÔNG TIN CÁ NHÂN --- */}
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

            {/* --- SECTION: ĐÁNH GIÁ CỦA KHÁCH --- */}
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
                                    <span style={{ color: '#222' }}>{"★".repeat(Math.round(review.rating))}{"☆".repeat(5 - Math.round(review.rating))}</span>
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

            {/* --- SECTION: BÀI ĐĂNG CỦA HOST --- */}
            <div className="hp-section">
                <h2 className="hp-section-title">Bài đăng của {host.name}</h2>
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