
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; // Thêm bộ não api vào đây
import './HomestayDetail.css';

export default function HomestayDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATES CƠ BẢN ---
    const [homestay, setHomestay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showDescModal, setShowDescModal] = useState(false);

    // --- STATES ĐẶT PHÒNG ---
    const [bookingDates, setBookingDates] = useState({ checkIn: '', checkOut: '' });
    const [selectedRentals, setSelectedRentals] = useState([]);

    // STATES KHÁCH
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [pets, setPets] = useState(0);

    // STATES MÃ GIẢM GIÁ
    const [promoCode, setPromoCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [promoMsg, setPromoMsg] = useState({ text: '', type: '' });

    // --- STATES ĐÁNH GIÁ (REVIEWS) & PHỤ KIỆN ---
    const [reviews, setReviews] = useState([]);
    const [allAccessories, setAllAccessories] = useState([]);
    const [newReviewText, setNewReviewText] = useState("");
    const [newReviewRating, setNewReviewRating] = useState(5);

    // STATES TIỆN NGHI
    const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);

    useEffect(() => {
        // Load danh sách đánh giá - ĐÃ SỬA THÀNH API
        api.get(`/api/rooms/${id || 1}/reviews`)
            .then(res => {
                const formattedReviews = res.data.map(r => {
                    const d = new Date(r.created_at);
                    return {
                        ...r,
                        date: `tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`,
                        yearsActive: "Khách hàng của SeaBreeze",
                        avatar: r.avatar || "https://placehold.co/100"
                    };
                });
                setReviews(formattedReviews);
            })
            .catch(error => console.error("Lỗi tải đánh giá:", error));

        // Load danh sách tất cả phụ kiện - ĐÃ SỬA THÀNH API
        api.get('/api/accessories')
            .then(res => {
                const accData = res.data.data || res.data || [];
                console.log("DỮ LIỆU PHỤ KIỆN TỪ DB:", accData);
                setAllAccessories(accData);
            })
            .catch(error => console.error("Lỗi tải phụ kiện:", error));

        // Load thông tin phòng - ĐÃ SỬA THÀNH API
        api.get(`/api/rooms/${id || 1}`)
            .then(res => {
                const apiData = res.data.data || res.data;
                console.log("DỮ LIỆU TỪ SERVER TRẢ VỀ:", apiData);
                if (!apiData.host) {
                    console.warn("CẢNH BÁO: Không tìm thấy thông tin 'host' trong dữ liệu trả về!");
                }

                const defaultImages = [
                    'https://placehold.co/800x600', 'https://placehold.co/400x300',
                    'https://placehold.co/400x300', 'https://placehold.co/400x300', 'https://placehold.co/400x300'
                ];

                let safeAmenities = [];
                if (apiData.amenities) {
                    if (typeof apiData.amenities === 'string') {
                        try { safeAmenities = JSON.parse(apiData.amenities); }
                        catch (e) { console.log("Lỗi parse tiện nghi", e); }
                    } else {
                        safeAmenities = apiData.amenities;
                    }
                }

                let safeImages = defaultImages;
                if (apiData.images) {
                    if (typeof apiData.images === 'string') {
                        try { safeImages = JSON.parse(apiData.images); } catch (e) { }
                    } else if (Array.isArray(apiData.images) && apiData.images.length > 0) {
                        safeImages = apiData.images;
                    }
                }

                setHomestay({
                    ...apiData,
                    name: apiData.title,
                    price: Number(apiData.price_per_night),
                    images: safeImages,
                    amenities: safeAmenities
                });

                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi:", error);
                setLoading(false);
            });

        // Load yêu thích
        let favs = [];
        try {
            const savedFavs = localStorage.getItem('favorites');
            favs = savedFavs ? JSON.parse(savedFavs) : [];
        } catch (e) { favs = []; }
        setIsFavorite(favs.includes(Number(id)));
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép đường liên kết vào khay nhớ tạm!");
    };

    const handleToggleFavorite = () => {
        let favs = [];
        try {
            const savedFavs = localStorage.getItem('favorites');
            favs = savedFavs ? JSON.parse(savedFavs) : [];
        } catch (e) { favs = []; }

        const roomId = Number(id);
        if (isFavorite) {
            favs = favs.filter(favId => favId !== roomId);
        } else {
            favs.push(roomId);
        }
        localStorage.setItem('favorites', JSON.stringify(favs));
        setIsFavorite(!isFavorite);
    };

    const updateGuest = (type, operation) => {
        if (type === 'adults') {
            setAdults(prev => operation === 'add' ? prev + 1 : Math.max(1, prev - 1));
        } else if (type === 'children') {
            setChildren(prev => operation === 'add' ? prev + 1 : Math.max(0, prev - 1));
        } else if (type === 'pets') {
            setPets(prev => operation === 'add' ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    const handleApplyPromo = () => {
        if (!promoCode) {
            setPromoMsg({ text: 'Vui lòng nhập mã!', type: 'error' });
            return;
        }

        // ĐÃ SỬA THÀNH API
        api.post('/api/check-promo', { code: promoCode })
            .then(res => {
                setDiscountPercent(res.data.discount_percent);
                setPromoMsg({ text: `🎉 Áp dụng thành công! Giảm ${res.data.discount_percent}%`, type: 'success' });
            })
            .catch(err => {
                setDiscountPercent(0);
                setPromoMsg({ text: '⚠️ Mã không hợp lệ hoặc đã hết hạn!', type: 'error' });
            });
    };

    const handleAddRental = (item) => {
        const existing = selectedRentals.find(r => r.id === item.id);
        if (existing) {
            setSelectedRentals(selectedRentals.map(r => r.id === item.id ? { ...r, quantity: r.quantity + 1 } : r));
        } else {
            setSelectedRentals([...selectedRentals, { ...item, quantity: 1, rentalDays: 1 }]);
        }
    };

    const handleRemoveRental = (id) => {
        setSelectedRentals(selectedRentals.filter(r => r.id !== id));
    };

    // --- TÍNH TOÁN TIỀN PHÒNG & PHỤ KIỆN ---
    let nights = 0;
    if (bookingDates.checkIn && bookingDates.checkOut) {
        const start = new Date(bookingDates.checkIn);
        const end = new Date(bookingDates.checkOut);
        nights = Math.ceil((end - start) / (1000 * 3600 * 24));
    }

    const basePrice = homestay ? homestay.price : 0;
    const totalRoomPrice = basePrice * (nights > 0 ? nights : 1);

    const totalRentalPrice = selectedRentals.reduce((sum, item) => {
        const rawPrice = item.price || item.gia_thue || item.price_per_day || item.rental_price || item.gia || 0;
        const cleanPrice = Math.floor(Number(String(rawPrice).replace(/,/g, '')) || 0);
        return sum + (cleanPrice * (nights > 0 ? nights : 1) * item.quantity);
    }, 0);

    const discountAmount = ((totalRoomPrice + totalRentalPrice) * discountPercent) / 100;
    const finalPrice = totalRoomPrice + totalRentalPrice - discountAmount;

    const handleBookRoom = () => {
        if (!bookingDates.checkIn || !bookingDates.checkOut) {
            alert("Vui lòng chọn ngày nhận và trả phòng!");
            return;
        }
        if (isNaN(nights) || nights <= 0) {
            alert("Ngày trả phòng không hợp lệ!");
            return;
        }

        navigate('/checkout-homestay', {
            state: {
                homestay: homestay,
                bookingDates: bookingDates,
                nights: nights,
                guests: { adults, children, pets },
                promo: { code: promoCode, discountPercent, discountAmount },
                selectedRentals: selectedRentals,
                finalPrice: finalPrice
            }
        });
    };

    const handleSubmitReview = async () => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        // Kiểm tra xem đã có đủ user và token chưa
        if (!storedUser || !token) {
            alert("Vui lòng đăng nhập để viết đánh giá!");
            return;
        }

        // Kiểm tra xem có nhập nội dung chưa
        if (!newReviewText.trim()) {
            alert("Vui lòng nhập nội dung đánh giá!");
            return;
        }

        const currentUser = JSON.parse(storedUser);

        try {
            // GỌI API VÀ ĐÍNH KÈM TOKEN 
            const res = await api.post('/api/reviews', {
                user_id: currentUser.id,
                room_id: id || 1,
                rating: newReviewRating,
                content: newReviewText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert("🎉 Đã gửi đánh giá thành công! Cảm ơn bạn.");

            // Cập nhật lại giao diện ngay lập tức
            const d = new Date();
            const newReviewUI = {
                ...res.data.review,
                date: `tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`,
                yearsActive: "Khách hàng của SeaBreeze",
                avatar: currentUser.avatar || "https://placehold.co/100"
            };

            setReviews([newReviewUI, ...reviews]);
            setNewReviewText("");
            setNewReviewRating(5);
        } catch (error) {
            alert("⚠️ Lỗi kết nối Server! Vui lòng thử lại sau.");
            console.error(error);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Đang tải dữ liệu...</div>;
    if (!homestay) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Không tìm thấy phòng!</div>;

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "4,88";

    const safeName = homestay.name || "";
    const safeLocation = homestay.location || "";
    const displaySubtitle = safeName.includes("Phòng") ? safeName : `Nơi ở tại ${safeLocation}`;

    const totalReviews = reviews.length;
    const avgRatingReal = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : "Chưa có đánh giá";

    // --- LỌC PHỤ KIỆN THEO VỊ TRÍ ---
    const filteredAccessories = allAccessories.filter(item => {
        if (!safeLocation || !item.location) return false;
        const homeLoc = safeLocation.toLowerCase();
        const itemLoc = item.location.toLowerCase();
        return homeLoc.includes(itemLoc) || itemLoc.includes(homeLoc);
    });
    const getAvatarUrl = (avatar) => {
        if (!avatar) return "https://placehold.co/50"; // Ảnh mặc định nếu không có
        // Nếu đã là link http rồi thì lấy luôn
        if (avatar.startsWith('http')) return avatar;
        // Nếu chỉ là đường dẫn file thì ghép với link server và folder storage
        return `https://seabreeze-backend-wkqw.onrender.com/storage/${avatar}`;
    };
    return (
        <div className="hd-container">
            {showDescModal && (
                <div className="hd-modal-overlay" onClick={() => setShowDescModal(false)}>
                    <div className="hd-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="hd-modal-close" onClick={() => setShowDescModal(false)}>✕</button>
                        <div className="hd-modal-body">
                            <h3>Giới thiệu về chỗ ở này</h3>
                            <p style={{ whiteSpace: 'pre-line' }}>{homestay.description}</p>
                            <br />
                        </div>
                    </div>
                </div>
            )}

            <div className="hd-header">
                <h1 className="hd-title">{safeName}</h1>
                <div className="hd-actions">
                    <span onClick={handleShare}><i className="fa-solid fa-arrow-up-from-bracket"></i> Chia sẻ</span>
                    <span onClick={handleToggleFavorite}>
                        {isFavorite ? <i className="fa-solid fa-heart active-heart"></i> : <i className="fa-regular fa-heart"></i>} Lưu
                    </span>
                </div>
            </div>

            <div className="image-grid-container">
                {homestay && homestay.images && homestay.images.length > 0 && (
                    <img src={homestay.images[0]} className="main-image" alt="Ảnh phòng" />
                )}

                <div className="small-images-grid">
                    {homestay && homestay.images && homestay.images.slice(1, 5).map((imgUrl, index) => (
                        <img key={index} src={imgUrl} className="small-image" alt={`Ảnh chi tiết ${index + 1}`} />
                    ))}
                </div>
            </div>

            <div className="hd-body">
                <div className="hd-left-col">
                    <h2 className="hd-subtitle">{displaySubtitle}</h2>

                    <hr className="hd-divider" />
                    <p className="hd-rating-inline">
                        <i className="fa-solid fa-star" style={{ color: '#ffb400' }}></i> {avgRatingReal}
                        {totalReviews > 0 && <span> · {totalReviews} đánh giá</span>}
                    </p>

                    <hr className="hd-divider" />

                    <div className="hd-host-info" onClick={() => navigate('/host/${homestay.host_id}')} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <img
                                src={getAvatarUrl(homestay?.host?.avatar)}
                                alt="Host Avatar"
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => { e.target.src = "https://placehold.co/50"; }} 
                            />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>
                                    Chủ nhà: {homestay?.host?.name || homestay?.host?.hoTen || 'Chủ nhà ẩn danh'}
                                </h3>
                                <p style={{ margin: 0, color: '#717171', fontSize: '14px' }}>
                                    Superhost · Đã xác minh danh tính
                                </p>
                            </div>
                        </div>
                    </div>

                    <hr className="hd-divider" />

                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '8px' }}>MÔ TẢ</p>
                        <div className="hd-desc-snippet">
                            {homestay.description} <br />
                            Nhà nằm ở vị trí trung tâm...
                        </div>
                        <button className="btn-show-more" onClick={() => setShowDescModal(true)}>Hiển thị thêm &gt;</button>
                    </div>

                    <br></br><br></br>
                    <div className="hd-amenities">
                        <h3>Nơi này có những gì cho bạn</h3>
                        <div className="hd-amenities-section">
                            <div className="hd-amenities-grid">
                                {homestay.amenities && homestay.amenities.length > 0 ? (
                                    /* Thay số 2 thành số 4 ở dòng slice này */
                                    homestay.amenities.slice(0, 4).map((amenity, index) => (
                                        <div className="amenity-item" key={index}>
                                            <i className="fa-solid fa-check-circle" style={{ marginRight: '10px', color: '#222' }}></i>
                                            {amenity}
                                        </div>
                                    ))
                                ) : (
                                    <p>Chưa cập nhật tiện nghi.</p>
                                )}
                            </div>

                            {homestay.amenities && homestay.amenities.length > 0 && (
                                <button className="btn-show-all-amenities" onClick={() => setShowAmenitiesModal(true)}>
                                    Hiển thị tất cả {homestay.amenities.length} tiện nghi
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="hd-reviews">
                        {reviews.length > 0 ? (
                            <>
                                <h3 className="hd-reviews-header"><i className="fa-solid fa-star"></i> {avgRating} · {reviews.length} đánh giá</h3>
                                <div className="hd-reviews-grid">
                                    {reviews.map(review => (
                                        <div key={review.id} className="review-card">
                                            <div className="review-user-info">
                                                <img src={review.avatar} alt="avatar" className="review-avatar" />
                                                <div>
                                                    <h4 className="review-name">{review.author}</h4>
                                                    <p className="review-time">{review.yearsActive}</p>
                                                </div>
                                            </div>
                                            <div className="review-rating-date">
                                                <span className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                                                <span>· {review.date}</span>
                                            </div>
                                            <p className="review-text">{review.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <h3 className="hd-reviews-header">Chưa có đánh giá nào cho phòng này.</h3>
                        )}

                        <div className="review-form-wrapper">
                            <h4>Viết đánh giá của bạn</h4>
                            <div className="review-input-group">
                                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Đánh giá:</label>
                                <select value={newReviewRating} onChange={(e) => setNewReviewRating(Number(e.target.value))} style={{ padding: '5px' }}>
                                    <option value="5">5 Sao (Tuyệt vời)</option>
                                    <option value="4">4 Sao (Rất tốt)</option>
                                    <option value="3">3 Sao (Bình thường)</option>
                                </select>
                            </div>
                            <textarea
                                className="review-textarea"
                                placeholder="Chia sẻ trải nghiệm của bạn về chỗ ở này..."
                                value={newReviewText}
                                onChange={(e) => setNewReviewText(e.target.value)}
                            ></textarea>
                            <button className="review-submit-btn" onClick={handleSubmitReview}>Đăng đánh giá</button>
                        </div>
                    </div>

                    <hr className="hd-divider" />

                    <div className="hd-rental-wrapper">
                        <h3>🏕️ Gợi ý phụ kiện thuê kèm tại {safeLocation}</h3>
                        {filteredAccessories.length > 0 ? (
                            <div className="hd-rental-grid">
                                {filteredAccessories.map(item => {
                                    // Kiểm tra đồ trong giỏ
                                    const isSelected = selectedRentals.some(r => r.id === item.id);

                                    // Dò tìm giá tiền bao chuẩn
                                    const rawPrice = item.price || item.gia_thue || item.price_per_day || item.rental_price || item.gia || 0;

                                    const cleanPrice = Math.floor(Number(String(rawPrice).replace(/,/g, '')) || 0);

                                    // Dò tìm hình ảnh và tự ghép URL Laravel
                                    const accImg = item.image || item.img || item.hinh_anh || item.photo || item.thumbnail;


                                    const finalImgUrl = accImg
                                        ? (accImg.startsWith('http') ? accImg : `https://seabreeze-backend-wkqw.onrender.com/storage/${accImg}`)
                                        : "https://placehold.co/200";

                                    return (
                                        <div key={item.id} className="hd-rental-card">
                                            <img src={finalImgUrl} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                                            <h4 style={{ marginTop: '10px' }}>{item.name}</h4>
                                            <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>
                                                <i className="fa-solid fa-location-dot" style={{ color: '#e51d53' }}></i> {item.location}
                                            </p>
                                            <span className="price">{cleanPrice.toLocaleString()}₫ <small>/ngày</small></span>
                                            <button
                                                onClick={() => isSelected ? handleRemoveRental(item.id) : handleAddRental(item)}
                                                style={{
                                                    marginTop: '10px', width: '100%', padding: '8px',
                                                    background: isSelected ? '#dc2626' : '#0066FF',
                                                    color: 'white', border: 'none', borderRadius: '5px',
                                                    cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
                                                }}
                                            >
                                                {isSelected ? 'Bỏ khỏi giỏ hàng' : 'Thêm vào giỏ hàng'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p style={{ color: '#717171', fontStyle: 'italic', marginTop: '10px' }}>
                                Hiện tại chưa có phụ kiện nào cho thuê tại khu vực này.
                            </p>
                        )}
                    </div>
                </div>

                {/* --- CỘT BÊN PHẢI (BILL TÍNH TIỀN) --- */}
                <div className="hd-right-col">
                    <div className="hd-booking-card" style={{ padding: '20px', borderRadius: '12px', border: '1px solid #ddd', boxShadow: '0 6px 16px rgba(0,0,0,0.1)' }}>
                        <div className="hd-booking-price" style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>
                            ₫{basePrice.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>/ đêm</span>
                        </div>

                        <div className="hd-booking-inputs">
                            {/* CHỌN NGÀY */}
                            <div className="hd-date-row" style={{ display: 'flex', border: '1px solid #b0b0b0', borderRadius: '8px 8px 0 0' }}>
                                <div className="hd-input-box" style={{ flex: 1, padding: '10px', borderRight: '1px solid #b0b0b0' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nhận phòng</label>
                                    <input type="date" value={bookingDates.checkIn} onChange={(e) => setBookingDates({ ...bookingDates, checkIn: e.target.value })} style={{ width: '100%', border: 'none', outline: 'none' }} />
                                </div>
                                <div className="hd-input-box" style={{ flex: 1, padding: '10px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Trả phòng</label>
                                    <input type="date" value={bookingDates.checkOut} onChange={(e) => setBookingDates({ ...bookingDates, checkOut: e.target.value })} style={{ width: '100%', border: 'none', outline: 'none' }} />
                                </div>
                            </div>

                            {/* CHỌN KHÁCH & THÚ CƯNG */}
                            <div
                                className="hd-input-box"
                                style={{ width: '100%', position: 'relative', border: '1px solid #b0b0b0', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '10px', cursor: 'pointer' }}
                                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                            >
                                <label style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Khách</label>
                                <div style={{ marginTop: '5px', fontSize: '14px' }}>
                                    {adults + children} khách {pets > 0 ? `, ${pets} thú cưng` : ''}
                                    <i className={`fa-solid fa-chevron-${showGuestDropdown ? 'up' : 'down'}`} style={{ float: 'right' }}></i>
                                </div>

                                {showGuestDropdown && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ position: 'absolute', top: '100%', left: '-1px', right: '-1px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', zIndex: 100, boxShadow: '0 8px 28px rgba(0,0,0,0.15)', marginTop: '8px' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '16px', color: '#222' }}>Người lớn</div>
                                                <div style={{ color: '#717171', fontSize: '14px' }}>Từ 13 tuổi trở lên</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <button onClick={(e) => { e.stopPropagation(); updateGuest('adults', 'sub'); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #b0b0b0', background: '#fff', cursor: adults <= 1 ? 'not-allowed' : 'pointer', color: adults <= 1 ? '#e0e0e0' : '#717171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>-</button>
                                                <span style={{ width: '20px', textAlign: 'center', fontSize: '16px', color: '#222' }}>{adults}</span>
                                                <button onClick={(e) => { e.stopPropagation(); updateGuest('adults', 'add'); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #717171', background: '#fff', cursor: 'pointer', color: '#717171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>+</button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '16px', color: '#222' }}>Trẻ em</div>
                                                <div style={{ color: '#717171', fontSize: '14px' }}>Độ tuổi 2 – 12</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <button onClick={(e) => { e.stopPropagation(); updateGuest('children', 'sub'); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #b0b0b0', background: '#fff', cursor: children <= 0 ? 'not-allowed' : 'pointer', color: children <= 0 ? '#e0e0e0' : '#717171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>-</button>
                                                <span style={{ width: '20px', textAlign: 'center', fontSize: '16px', color: '#222' }}>{children}</span>
                                                <button onClick={(e) => { e.stopPropagation(); updateGuest('children', 'add'); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #717171', background: '#fff', cursor: 'pointer', color: '#717171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>+</button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '16px', color: '#222' }}>Thú cưng</div>
                                                <div style={{ color: '#717171', fontSize: '14px' }}>Mang theo lồng/túi</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <button onClick={(e) => { e.stopPropagation(); updateGuest('pets', 'sub'); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #b0b0b0', background: '#fff', cursor: pets <= 0 ? 'not-allowed' : 'pointer', color: pets <= 0 ? '#e0e0e0' : '#717171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>-</button>
                                                <span style={{ width: '20px', textAlign: 'center', fontSize: '16px', color: '#222' }}>{pets}</span>
                                                <button onClick={(e) => { e.stopPropagation(); updateGuest('pets', 'add'); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #717171', background: '#fff', cursor: 'pointer', color: '#717171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>+</button>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', marginTop: '16px' }}>
                                            <button onClick={(e) => { e.stopPropagation(); setShowGuestDropdown(false); }} style={{ border: 'none', background: 'none', textDecoration: 'underline', fontWeight: '600', cursor: 'pointer', fontSize: '16px', color: '#222' }}>Đóng</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* NHẬP MÃ GIẢM GIÁ */}
                        <div style={{ marginTop: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    placeholder="Nhập mã (VD: TET2026)"
                                    style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}
                                />
                                <button onClick={handleApplyPromo} style={{ background: '#222', color: 'white', border: 'none', padding: '0 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Áp dụng</button>
                            </div>
                            {promoMsg.text && (
                                <div style={{ marginTop: '5px', color: promoMsg.type === 'success' ? '#16a34a' : '#dc2626', fontSize: '13px', fontWeight: 'bold' }}>
                                    {promoMsg.text}
                                </div>
                            )}
                        </div>

                        {/* TỔNG KẾT TIỀN */}
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                                <span>₫{basePrice.toLocaleString()} x {nights > 0 ? nights : 1} đêm</span>
                                <span>₫{totalRoomPrice.toLocaleString()}</span>
                            </div>

                            {/* HIỂN THỊ PHỤ KIỆN ĐÃ CHỌN VÀO BILL */}
                            {selectedRentals.length > 0 && (
                                <div style={{ borderTop: '1px dashed #ddd', paddingTop: '10px', marginTop: '10px', marginBottom: '10px' }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Phụ kiện thuê kèm:</p>
                                    {selectedRentals.map(item => {
                                        const rawPrice = item.price || item.gia_thue || item.price_per_day || item.rental_price || item.gia || 0;
                                        const cleanPrice = Math.floor(Number(String(rawPrice).replace(/,/g, '')) || 0);
                                        const itemTotal = cleanPrice * (nights > 0 ? nights : 1) * item.quantity;
                                        return (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                                                <span>{item.name}</span>
                                                <span>₫{itemTotal.toLocaleString()}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {discountPercent > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#16a34a', fontWeight: 'bold' }}>
                                    <span>Giảm giá mã ({discountPercent}%)</span>
                                    <span>- ₫{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <hr style={{ borderTop: '1px solid #ddd', margin: '15px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                                <span>Tổng cộng</span>
                                <span>₫{finalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="hd-book-btn" onClick={handleBookRoom} style={{ marginTop: '20px', width: '100%', background: '#e51d53', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Đặt phòng
                        </button>
                        <p className="hd-charge-notice" style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '10px' }}>
                            Bạn vẫn chưa bị trừ tiền
                        </p>
                    </div>
                </div>

                {/* --- MODAL HIỂN THỊ TẤT CẢ TIỆN NGHI --- */}
                {showAmenitiesModal && (
                    <div className="modal-overlay" onClick={() => setShowAmenitiesModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Những tiện nghi đi kèm</h2>
                            <div className="modal-amenities-list">
                                {homestay.amenities && homestay.amenities.map((amenity, index) => (
                                    <div className="modal-amenity-item" key={index}>
                                        <i className="fa-solid fa-check" style={{ marginRight: '15px', color: '#222' }}></i>
                                        {amenity}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
                <div className="footer-bottom">&copy; 2026 SeaBreeze Project - UIT Students.</div>
            </footer>
        </div>
    );
}
