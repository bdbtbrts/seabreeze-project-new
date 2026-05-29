import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HostProfile.css';
import api from '../api';
export default function HostProfile() {
    
    const navigate = useNavigate();
    const [hostListings, setHostListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lấy tất cả phòng từ API (giả sử tất cả phòng này đều là của host Hao)
        api.get('/api/rooms')
            .then(res => {
                // Lấy 3 phòng đầu tiên để làm "Bài đăng của Hao"
                setHostListings(res.data.data.slice(0, 3));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Giả lập danh sách đánh giá của Host (giống hệt hình số 3)
    const hostReviews = [
        { id: 1, name: "James", loc: "Edinburgh, Vương quốc Anh", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5, date: "Hôm nay", text: "The stay was great thanks. The room is nice and quiet and private and homely. Its a good location too and nice restaurants and supermarkets nearby." },
        { id: 2, name: "Satoshi", loc: "Osaka, Nhật Bản", avatar: "https://randomuser.me/api/portraits/men/44.jpg", rating: 5, date: "2 ngày trước", text: "Highly Recommended! This was my very first time traveling abroad, and I chose Ho Chi Minh City. I was quite anxious at first, but the people here are incredibly kind..." },
        { id: 3, name: "Nuon", loc: "Hàn Quốc", avatar: "https://ui-avatars.com/api/?name=Nuon&background=f4d0c1", rating: 5, date: "3 ngày trước", text: "Good experience staying there. Overall are good 👍" }
    ];

    if (loading) return <div style={{textAlign: 'center', marginTop: '100px'}}>Đang tải hồ sơ chủ nhà...</div>;

    return (
        <div className="hp-container">
            {/* HEADER: AVATAR & THÔNG TIN */}
            <div className="hp-header">
                <div className="hp-left-card">
                    <div className="hp-avatar-section">
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200" alt="Hao" className="hp-avatar" />
                        <h2 className="hp-name">Hao</h2>
                        <span className="hp-title-sub"><i className="fa-solid fa-award"></i> Chủ nhà siêu cấp</span>
                    </div>
                    <div className="hp-stats-grid">
                        <div className="hp-stat-item">
                            <h3>568</h3>
                            <p>Đánh giá</p>
                        </div>
                        <div className="hp-stat-item">
                            <h3>4,88 <i className="fa-solid fa-star" style={{fontSize: '12px'}}></i></h3>
                            <p>Xếp hạng</p>
                        </div>
                        <div className="hp-stat-item">
                            <h3>4</h3>
                            <p>Năm kinh nghiệm</p>
                        </div>
                    </div>
                </div>

                <div className="hp-right-info">
                    <h1>Thông tin về Hao</h1>
                    <div className="hp-info-list">
                        <div className="hp-info-item">
                            <i className="fa-solid fa-earth-americas"></i>
                            <div>Nơi tôi hằng muốn đến: Cả thế giới</div>
                        </div>
                        <div className="hp-info-item">
                            <i className="fa-solid fa-briefcase"></i>
                            <div>Công việc của tôi: Host homestay</div>
                        </div>
                        <div className="hp-info-item">
                            <i className="fa-regular fa-star"></i>
                            <div>Điều làm nên sự độc đáo cho nhà của tôi: Khu phố sầm uất nhưng nhà lại yên tĩnh</div>
                        </div>
                        <div className="hp-info-item">
                            <i className="fa-solid fa-balloon"></i>
                            <div>Sinh ra vào thập niên 80</div>
                        </div>
                        <div className="hp-info-item">
                            <i className="fa-solid fa-shield-check"></i>
                            <div style={{textDecoration: 'underline'}}>Đã xác minh danh tính</div>
                        </div>
                    </div>
                    <button className="hp-btn-show-all">Xem tất cả</button>
                </div>
            </div>

            {/* ĐÁNH GIÁ VỀ HOST */}
            <div className="hp-section">
                <h2 className="hp-section-title">Đánh giá của Hao</h2>
                <div className="hp-reviews-grid">
                    {hostReviews.map(review => (
                        <div key={review.id} className="hp-review-card">
                            <div className="hp-review-user">
                                <img src={review.avatar} alt={review.name} />
                                <div>
                                    <h4 className="hp-review-name">{review.name}</h4>
                                    <p className="hp-review-loc">{review.loc}</p>
                                </div>
                            </div>
                            <div className="hp-review-rating">
                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} · <span style={{fontWeight: 'normal', color: '#717171'}}>{review.date}</span>
                            </div>
                            <p className="hp-review-text">{review.text}</p>
                        </div>
                    ))}
                </div>
                <button className="hp-btn-show-all" style={{marginTop: '24px'}}>Hiển thị thêm đánh giá</button>
                <p style={{fontSize: '12px', color: '#717171', marginTop: '16px'}}>Một số thông tin được hiển thị bằng ngôn ngữ gốc. <span style={{textDecoration: 'underline', color: '#222', cursor: 'pointer', fontWeight: 'bold'}}>Dịch</span></p>
            </div>

            {/* BÀI ĐĂNG CỦA HOST */}
            <div className="hp-section">
                <h2 className="hp-section-title">Bài đăng của Hao</h2>
                <div className="hp-listings-grid">
                    {hostListings.map(room => (
                        <Link to={`/homestay/${room.id}`} key={room.id} className="hp-listing-card">
                            <img src={room.images?.[0] || 'https://placehold.co/400x300'} alt={room.title} className="hp-listing-img" />
                            <p className="hp-listing-type">Phòng</p>
                            <p className="hp-listing-title">{room.title}</p>
                            <p className="hp-listing-rating"><i className="fa-solid fa-star" style={{fontSize: '10px'}}></i> 4,88 · {(Math.random() * 200 + 50).toFixed(0)} đánh giá</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* NÚT BÁO CÁO / CHẶN */}
            <div className="hp-footer-actions">
                <button className="hp-action-btn"><i className="fa-regular fa-flag"></i> Báo cáo hồ sơ này</button>
                <button className="hp-action-btn"><i className="fa-solid fa-ban"></i> Chặn chủ nhà này</button>
            </div>
        </div>
    );
}
 <footer className="main-footer" id="contact-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>SeaBreeze</h3>
                        <p>Trải nghiệm kỳ nghỉ tuyệt vời cùng dịch vụ thuê đồ tiện lợi.</p>
                    </div>

                    <div className="footer-section">
                        <h4>Liên hệ</h4>
                        <p>Email: cskh@seabreeze.com</p>
                        <p>Hotline: 0375 951 500</p>
                        <p>Địa chỉ: UIT, Thủ Đức, TP. HCM</p>
                    </div>

                    <div className="footer-section">
                        <h4>Kết nối với chúng tôi</h4>
                        <div className="social-icons">
                            <a href="#"><i className="fa-brands fa-facebook"></i></a>
                            <a href="#"><i className="fa-brands fa-instagram"></i></a>
                            <a href="#"><i className="fa-brands fa-tiktok"></i></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; 2026 SeaBreeze Project - UIT Students.
                </div>
            </footer>