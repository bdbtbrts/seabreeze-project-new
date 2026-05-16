import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HomestayDetail.css'; // Import file CSS thuần

// DATA GIẢ LẬP: Khớp chính xác với data bên Home.jsx của bạn
// Dữ liệu giả
const allProducts = [
    { id: 1, name: "Homestay Biển Xanh", price: 1200000, type: "Homestay", location: "Vũng Tàu", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500" },
    { id: 2, name: "Ván Chèo SUP", price: 200000, type: "Cho thuê", location: "Vũng Tàu", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500" },
    { id: 3, name: "Cabin Gỗ Thông", price: 1500000, type: "Homestay", location: "Đà Lạt", img: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=500" },
    { id: 4, name: "Căn hộ View Hồ", price: 2500000, type: "Homestay", location: "Đà Lạt", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500" },
    { id: 5, name: "Xe máy phượt", price: 150000, type: "Cho thuê", location: "Đà Lạt", img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500" },
    { id: 6, name: "Villa Sunset", price: 3500000, type: "Homestay", location: "Vũng Tàu", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500" },
    { id: 7, name: "Lều cắm trại cao cấp", price: 300000, type: "Cho thuê", location: "Đà Lạt", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500" },
    { id: 8, name: "Homestay Phố Cổ", price: 900000, type: "Homestay", location: "Hà Nội", img: "https://plus.unsplash.com/premium_photo-1684445035187-c4bc7c96bc5d?w=500" },
    { id: 9, name: "Xe đạp điện", price: 100000, type: "Cho thuê", location: "Hà Nội", img: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500" },
    { id: 10, name: "Căn hộ Studio", price: 1100000, type: "Homestay", location: "Hà Nội", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500" },
    { id: 11, name: "Bộ đồ bơi chuyên nghiệp", price: 50000, type: "Cho thuê", location: "Vũng Tàu", img: "https://plus.unsplash.com/premium_photo-1667509204238-aa06114f2964?w=800" },
    { id: 12, name: "Nhà Gỗ Ven Suối", price: 1800000, type: "Homestay", location: "Đà Lạt", img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=500" }
];

// Data đồ thuê kèm (Task Hiền)
// Tìm và XÓA mảng mockRentalItems cũ, thay bằng dòng này:
const rentalItemsFromData = allProducts.filter(item => item.type === "Cho thuê");

export default function HomestayDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
const rentalItemsFromData = allProducts.filter(item => item.type === "Cho thuê");
    // Tìm homestay theo id trên URL
    const homestay = allProducts.find(h => String(h.id) === String(id));

    const [bookingDates, setBookingDates] = useState({ checkIn: '', checkOut: '' });
    const [selectedRentals, setSelectedRentals] = useState([]);

    if (!homestay) {
        return (
            <div className="hd-not-found">
                <h2>Không tìm thấy thông tin chỗ nghỉ này!</h2>
                <button onClick={() => navigate('/')} className="btn-return">Về trang chủ</button>
            </div>
        );
    }

    // --- LOGIC XỬ LÝ ĐỒ THUÊ KÈM ---
    const handleAddRental = (item) => {
        const existing = selectedRentals.find(r => r.id === item.id);
        if (existing) {
            setSelectedRentals(selectedRentals.map(r => 
                r.id === item.id ? { ...r, quantity: r.quantity + 1 } : r
            ));
        } else {
            setSelectedRentals([...selectedRentals, { ...item, quantity: 1, rentalDays: 1 }]);
        }
    };

    const handleUpdateRental = (id, field, value) => {
        setSelectedRentals(selectedRentals.map(r => 
            r.id === id ? { ...r, [field]: Number(value) } : r
        ));
    };

    const handleRemoveRental = (id) => {
        setSelectedRentals(selectedRentals.filter(r => r.id !== id));
    };

    // --- LOGIC GIỎ HÀNG ---
    const handleAddToCart = () => {
        if (!bookingDates.checkIn || !bookingDates.checkOut) {
            alert("Vui lòng chọn ngày nhận và trả phòng!");
            return;
        }

        const existingCart = JSON.parse(localStorage.getItem('seabreeze_cart')) || [];
        const timestamp = Date.now(); 

        const homestayCartItem = {
            cartItemId: `home_${timestamp}`, 
            type: 'homestay',
            ...homestay,
            checkIn: bookingDates.checkIn,
            checkOut: bookingDates.checkOut
        };
        existingCart.push(homestayCartItem);

        if (selectedRentals.length > 0) {
            selectedRentals.forEach((rental, index) => {
                const rentalCartItem = {
                    cartItemId: `rental_${timestamp}_${index}`,
                    type: 'rental',
                    ...rental 
                };
                existingCart.push(rentalCartItem);
            });
        }

        localStorage.setItem('seabreeze_cart', JSON.stringify(existingCart));
        alert("Đã thêm Homestay và đồ thuê vào giỏ hàng thành công!");
    };

    return (
        <main className="hd-main-container">
            <button className="hd-back-btn" onClick={() => navigate(-1)}>
                <i className="fa-solid fa-arrow-left"></i> Quay lại
            </button>

            <div className="hd-grid">
                {/* CỘT TRÁI: THÔNG TIN HOMESTAY */}
                <div className="hd-content-left">
                    <div className="hd-image-wrapper">
                        <img src={homestay.img} alt={homestay.name} className="hd-main-img" />
                        <span className="hd-location-badge">📍 {homestay.location}</span>
                    </div>

                    <div className="hd-info">
                        <h1 className="hd-title">{homestay.name}</h1>
                        <p className="hd-price">
                            {homestay.price.toLocaleString()} ₫ <span>/đêm</span>
                        </p>
                        <p className="hd-description">{homestay.description}</p>
                    </div>

                    <hr className="hd-divider" />

                    {/* DỊCH VỤ THUÊ ĐỒ KÈM THEO */}
                    <div className="hd-rental-section">
                        <h2>🎒 Dịch vụ thuê đồ kèm theo</h2>
                        <div className="hd-rental-grid">
                           {rentalItemsFromData.map(item => (
                                <div key={item.id} className="hd-rental-card">
                                    <div className="rental-info">
                                        <h3>{item.name}</h3>
                                        <p>Thuê: <strong>{item.price.toLocaleString()}₫</strong>/ngày</p>
                                        <p className="rental-deposit">Cọc: {item.deposit?.toLocaleString()||"0"}₫</p>
                                    </div>
                                    <button className="btn-add-rental" onClick={() => handleAddRental(item)}>
                                        <i className="fa-solid fa-plus"></i> Chọn
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: FORM ĐẶT PHÒNG */}
                <div className="hd-sidebar-right">
                    <div className="hd-booking-card">
                        <h3>Lên lịch trình ngay</h3>
                        
                        <div className="hd-form-group">
                            <label>Nhận phòng</label>
                            <input 
                                type="date" 
                                value={bookingDates.checkIn}
                                onChange={(e) => setBookingDates({...bookingDates, checkIn: e.target.value})}
                            />
                        </div>
                        <div className="hd-form-group">
                            <label>Trả phòng</label>
                            <input 
                                type="date" 
                                value={bookingDates.checkOut}
                                onChange={(e) => setBookingDates({...bookingDates, checkOut: e.target.value})}
                            />
                        </div>

                        {/* HIỂN THỊ DANH SÁCH ĐỒ THUÊ ĐÃ CHỌN */}
                        {selectedRentals.length > 0 && (
                            <div className="hd-selected-rentals">
                                <h4>📦 Đồ thuê của bạn:</h4>
                                <div className="rentals-list">
                                    {selectedRentals.map(r => (
                                        <div key={r.id} className="selected-rental-item">
                                            <div className="sr-header">
                                                <span className="sr-name">{r.name}</span>
                                                <button onClick={() => handleRemoveRental(r.id)}><i className="fa-solid fa-trash-can"></i></button>
                                            </div>
                                            <div className="sr-inputs">
                                                <div className="sr-input-group">
                                                    <label>Số lượng</label>
                                                    <input type="number" min="1" value={r.quantity} onChange={(e) => handleUpdateRental(r.id, 'quantity', e.target.value)} />
                                                </div>
                                                <div className="sr-input-group">
                                                    <label>Số ngày</label>
                                                    <input type="number" min="1" value={r.rentalDays} onChange={(e) => handleUpdateRental(r.id, 'rentalDays', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button className="btn-add-to-cart" onClick={handleAddToCart}>
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}