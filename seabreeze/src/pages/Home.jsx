import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

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

function Home() {
    const navigate = useNavigate();
    const highestPrice = Math.max(...allProducts.map(item => item.price));

    const [searchTerm, setSearchTerm] = useState("");
    const [maxPrice, setMaxPrice] = useState(highestPrice);
    const [filteredData, setFilteredData] = useState(allProducts);
    const [showLocationPopup, setShowLocationPopup] = useState(false);
// 1. CHÈN THÊM STATE VÀ HÀM CHO NÚT THẢ TIM Ở ĐÂY
    // ==============================================================
    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const toggleFavorite = (e, id) => {
        e.preventDefault(); // Chặn việc tự động cuộn hoặc nhảy trang
        e.stopPropagation();
        let updatedFavorites;
        if (favorites.includes(id)) {
            updatedFavorites = favorites.filter(favId => favId !== id);
        } else {
            updatedFavorites = [...favorites, id];
        }
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };
    // --- STATE CHO PHẦN LỊCH VÀ POPUP ---
    const handleSelectLocation = (locationName) => {
        setSearchTerm(locationName);
        setShowLocationPopup(false);
        applyFilters(locationName, maxPrice);
    };

    // --- STATE CHO PHẦN LỊCH VÀ POPUP ---
    const [showDatePopup, setShowDatePopup] = useState(false);
    const [dateTab, setDateTab] = useState('calendar'); // 'calendar' hoặc 'flexible'

    // State của Lịch
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [currentMonthView, setCurrentMonthView] = useState(new Date());
    const [exactTolerance, setExactTolerance] = useState('exact');

    // State của Ngày linh hoạt
    const [flexDuration, setFlexDuration] = useState('other'); // weekend, 1week, 2weeks, 1month, other
    const [flexCustomNights, setFlexCustomNights] = useState(1);
    const [flexStartDay, setFlexStartDay] = useState('Thứ Năm'); // T2 -> CN
    const [flexSelectedMonths, setFlexSelectedMonths] = useState([]); // Chứa id các tháng được chọn (tối đa 3)
    const [savedFlexSummary, setSavedFlexSummary] = useState(""); // Lưu lại chuỗi hiển thị trên thanh tìm kiếm

    // --- LOGIC SINH RA 13 THÁNG TỚI CHO NGÀY LINH HOẠT ---
    const upcomingMonths = useMemo(() => {
        const months = [];
        const d = new Date();
        for (let i = 0; i <= 12; i++) {
            months.push({
                id: `${d.getFullYear()}-${d.getMonth()}`,
                label: `Th ${d.getMonth() + 1}`,
                year: d.getFullYear()
            });
            d.setMonth(d.getMonth() + 1);
        }
        return months;
    }, []);

    // --- LOGIC CHỌN NGÀY Ở TAB LỊCH ---
    const handleDateClick = (day, month, year) => {
        const clickedDate = new Date(year, month, day);
        if (!startDate || (startDate && endDate)) {
            setStartDate(clickedDate);
            setEndDate(null);
        } else if (clickedDate < startDate) {
            setStartDate(clickedDate);
        } else {
            setEndDate(clickedDate);
        }
    };

    const getDayClass = (day, month, year) => {
        if (!day) return "empty-cell";
        const dateTime = new Date(year, month, day).getTime();
        const startTime = startDate ? startDate.getTime() : null;
        const endTime = endDate ? endDate.getTime() : null;

        if (startTime === dateTime) return "day-cell selected-start";
        if (endTime === dateTime) return "day-cell selected-end";
        if (startTime && endTime && dateTime > startTime && dateTime < endTime) return "day-cell in-range";
        return "day-cell";
    };

    const renderMonth = (monthOffset) => {
        const year = currentMonthView.getFullYear();
        const month = currentMonthView.getMonth() + monthOffset;
        const targetDate = new Date(year, month, 1);

        const targetMonth = targetDate.getMonth();
        const targetYear = targetDate.getFullYear();

        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        let firstDayIndex = targetDate.getDay() === 0 ? 6 : targetDate.getDay() - 1;

        const days = [];
        for (let i = 0; i < firstDayIndex; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return (
            <div className="calendar-month">
                <div className="month-title">tháng {targetMonth + 1} {targetYear}</div>
                <div className="weekdays">
                    <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                </div>
                <div className="days-grid">
                    {days.map((day, index) => (
                        <div key={index} className={getDayClass(day, targetMonth, targetYear)} onClick={() => day && handleDateClick(day, targetMonth, targetYear)}>
                            {day && <span className="day-number">{day}</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- LOGIC CHỌN THÁNG Ở TAB NGÀY LINH HOẠT ---
    const handleToggleFlexMonth = (monthId) => {
        setFlexSelectedMonths(prev => {
            if (prev.includes(monthId)) {
                return prev.filter(id => id !== monthId);
            }
            if (prev.length < 3) {
                return [...prev, monthId];
            }
            return prev; // Đã chọn 3 tháng thì không cho chọn thêm
        });
    };

    // --- LOGIC TEXT FOOTER CHO NGÀY LINH HOẠT ---
    const getFlexSummaryText = () => {
        let durationText = '';
        switch (flexDuration) {
            case 'weekend': durationText = 'cuối tuần'; break;
            case '1week': durationText = '1 tuần'; break;
            case '2weeks': durationText = '2 tuần'; break;
            case '1month': durationText = '1 tháng'; break;
            case 'other': durationText = `${flexCustomNights} đêm`; break;
            default: durationText = '';
        }

        if (flexSelectedMonths.length === 0) return `${durationText} (chưa chọn tháng)`;

        const monthNames = flexSelectedMonths.map(id => {
            const [, m] = id.split('-');
            return `Th ${parseInt(m) + 1}`;
        }).join(', ');

        return `${durationText} trong ${monthNames}`;
    };

    // Nút Chọn ở Ngày linh hoạt
    const handleSelectFlex = () => {
        setSavedFlexSummary(getFlexSummaryText());
        setShowDatePopup(false);
    };
    // --- STATE CHO PHẦN KHÁCH ---
    const [showGuestPopup, setShowGuestPopup] = useState(false);
    const [adults, setAdults] = useState(0);
    const [children, setChildren] = useState(0);
    const [pets, setPets] = useState(0);

    // Hàm để hiển thị text tóm tắt trên thanh search
    const getGuestSummary = () => {
        const total = adults + children;
        if (total === 0 && pets === 0) return "Thêm khách";

        let parts = [];
        if (total > 0) parts.push(`${total} khách`);
        if (pets > 0) parts.push(`${pets} thú cưng`);
        return parts.join(", ");
    };
// --- CODE PHÂN TRANG CẢI TIẾN ---
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 4; // Đổi từ 2 lên 8 để grid trông chuyên nghiệp hơn

useEffect(() => {
    setCurrentPage(1);
}, [filteredData, searchTerm, showOnlyFavorites]); // Reset trang khi search hoặc filter
// 2. THÊM ĐOẠN NÀY: Lọc data dựa trên việc có đang bật xem yêu thích hay không
const finalDataToDisplay = showOnlyFavorites 
    ? filteredData.filter(item => favorites.includes(item.id)) 
    : filteredData;

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = finalDataToDisplay.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(finalDataToDisplay.length / itemsPerPage);

    // --- LOGIC TÌM KIẾM ---
    const applyFilters = (text, price) => {
        const result = allProducts.filter(item => {
            const matchText = text.trim() === "" ||
                item.name.toLowerCase().includes(text.toLowerCase()) ||
                item.location.toLowerCase().includes(text.toLowerCase());
            const matchPrice = item.price <= price;
            return matchText && matchPrice;
        });
        setFilteredData(result);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        applyFilters(value, maxPrice);
    };

    const handlePriceChange = (e) => {
        const value = parseInt(e.target.value);
        setMaxPrice(value);
        applyFilters(searchTerm, value);
    };

    const handleSearch = () => applyFilters(searchTerm, maxPrice);
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

    // Text hiển thị trên thanh Search Block Date
    const renderBlockDateText = () => {
        if (dateTab === 'calendar') {
            if (startDate) {
                let txt = `${startDate.getDate()} thg ${startDate.getMonth() + 1}`;
                if (endDate) txt += ` - ${endDate.getDate()} thg ${endDate.getMonth() + 1}`;
                if (exactTolerance !== 'exact') txt += ` (±${exactTolerance})`;
                return txt;
            }
            return 'Thêm ngày';
        } else {
            return savedFlexSummary || 'Ngày linh hoạt';
        }
    };

    return (
        
        <main>
            {/* --- PHẦN TÌM KIẾM --- */}
            <section className="search-section-premium">
                <div className="search-bar-pill">
                    {showLocationPopup && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }} onClick={() => setShowLocationPopup(false)}></div>
                    )}

                    <div className="search-block" id="blockLocation" style={{ zIndex: 901 }}>
                        <div className="block-content">
                            <div className="block-label">Địa điểm</div>
                            <input
                                type="text"
                                className="block-input"
                                placeholder="Tìm kiếm điểm đến"
                                value={searchTerm}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onClick={() => { setShowLocationPopup(true); setShowDatePopup(false); }}
                            />
                        </div>
                        {showLocationPopup && (
                            <div className="location-popup">
                                <div className="popup-title">Các điểm đến thịnh hành</div>
                                <ul className="location-list">
                                    <li onClick={() => handleSelectLocation("Nha Trang")}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <div className="loc-text"><strong>Nha Trang</strong><span>Việt Nam</span></div>
                                    </li>
                                    <li onClick={() => handleSelectLocation("TP. Hồ Chí Minh")}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <div className="loc-text"><strong>TP. Hồ Chí Minh</strong><span>Việt Nam</span></div>
                                    </li>
                                    <li onClick={() => handleSelectLocation("Đà Lạt")}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <div className="loc-text"><strong>Đà Lạt</strong><span>Việt Nam</span></div>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="divider"></div>

                    {showDatePopup && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }} onClick={() => setShowDatePopup(false)}></div>
                    )}

                    <div className="search-block" id="blockDate" style={{ zIndex: 901 }}>
                        <div className="block-content" onClick={() => {
                            setShowDatePopup(true);
                            setShowLocationPopup(false);
                            // Sổ xuống mặc định vào mục Lịch
                            setDateTab('calendar');
                        }}>
                            <div className="block-label">Thời gian</div>
                            <div className="block-text" style={{ color: startDate || savedFlexSummary ? '#222' : '#6a6a6a' }}>
                                {renderBlockDateText()}
                            </div>
                        </div>

                        {/* POPUP THỜI GIAN */}
                        {showDatePopup && (
                            <div className="date-popup">
                                <div className="date-tabs-wrapper">
                                    <div className="date-tabs">
                                        <div className={`tab ${dateTab === 'calendar' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setDateTab('calendar'); }}>Lịch</div>
                                        <div className={`tab ${dateTab === 'flexible' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setDateTab('flexible'); }}>Ngày linh hoạt</div>
                                    </div>
                                </div>

                                {/* ===== TAB LỊCH ===== */}
                                {dateTab === 'calendar' && (
                                    <>
                                        <div className="calendars-wrapper">
                                            {renderMonth(0)}
                                            {renderMonth(1)}
                                            <button className="nav-month next-month" onClick={() => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1))}><i className="fa-solid fa-chevron-right"></i></button>
                                        </div>
                                        <div className="date-footer">
                                            <button className={`pill-btn ${exactTolerance === 'exact' ? 'active' : ''}`} onClick={() => setExactTolerance('exact')}>Ngày chính xác</button>
                                            <button className={`pill-btn ${exactTolerance === '1' ? 'active' : ''}`} onClick={() => setExactTolerance('1')}><i className="fa-solid fa-plus-minus"></i> ± 1 ngày</button>
                                            <button className={`pill-btn ${exactTolerance === '2' ? 'active' : ''}`} onClick={() => setExactTolerance('2')}><i className="fa-solid fa-plus-minus"></i> ± 2 ngày</button>
                                            <button className={`pill-btn ${exactTolerance === '3' ? 'active' : ''}`} onClick={() => setExactTolerance('3')}><i className="fa-solid fa-plus-minus"></i> ± 3 ngày</button>
                                            <button className={`pill-btn ${exactTolerance === '7' ? 'active' : ''}`} onClick={() => setExactTolerance('7')}><i className="fa-solid fa-plus-minus"></i> ± 7 ngày</button>
                                        </div>
                                    </>
                                )}

                                {/* ===== TAB NGÀY LINH HOẠT ===== */}
                                {dateTab === 'flexible' && (
                                    <div className="flexible-content">
                                        <div className="flex-section">
                                            <div className="flex-section-title">Bạn muốn ở bao lâu?</div>
                                            <div className="flex-duration-options">
                                                <label className="radio-label">
                                                    <input type="radio" name="duration" checked={flexDuration === 'weekend'} onChange={() => setFlexDuration('weekend')} />
                                                    Cuối tuần
                                                </label>
                                                <label className="radio-label">
                                                    <input type="radio" name="duration" checked={flexDuration === '1week'} onChange={() => setFlexDuration('1week')} />
                                                    1 tuần
                                                </label>
                                                <label className="radio-label">
                                                    <input type="radio" name="duration" checked={flexDuration === '1month'} onChange={() => setFlexDuration('1month')} />
                                                    Một tháng
                                                </label>
                                                <label className="radio-label">
                                                    <input type="radio" name="duration" checked={flexDuration === 'other'} onChange={() => setFlexDuration('other')} />
                                                    Khác
                                                </label>
                                            </div>

                                            {flexDuration === 'other' && (
                                                <div className="custom-duration-wrapper">
                                                    <div className="custom-label-small">Số đêm và ngày nhận phòng</div>
                                                    <div className="custom-inputs-row">
                                                        <div className="custom-night-counter">
                                                            <input
                                                                type="number"
                                                                value={flexCustomNights}
                                                                onChange={(e) => {
                                                                    let val = parseInt(e.target.value) || 1;
                                                                    if (val > 100) val = 100;
                                                                    setFlexCustomNights(val);
                                                                }}
                                                                min="1" max="100"
                                                            />
                                                            <span>đêm</span>
                                                        </div>

                                                        <div className="custom-start-day">
                                                            <select value={flexStartDay} onChange={(e) => setFlexStartDay(e.target.value)}>
                                                                <option value="Thứ Hai">Từ thứ Hai</option>
                                                                <option value="Thứ Ba">Từ thứ Ba</option>
                                                                <option value="Thứ Tư">Từ thứ Tư</option>
                                                                <option value="Thứ Năm">Từ thứ Năm</option>
                                                                <option value="Thứ Sáu">Từ thứ Sáu</option>
                                                                <option value="Thứ Bảy">Từ thứ Bảy</option>
                                                                <option value="Chủ Nhật">Từ Chủ Nhật</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-section">
                                            <div className="flex-section-title">Bạn muốn đi khi nào?</div>
                                            <div className="flex-section-subtitle">Chọn tối đa 3 tháng</div>
                                            <div className="flex-months-wrapper">
                                                <div className="flex-months-grid">
                                                    {upcomingMonths.map((m) => (
                                                        <div
                                                            key={m.id}
                                                            className={`flex-month-card ${flexSelectedMonths.includes(m.id) ? 'active' : ''}`}
                                                            onClick={() => handleToggleFlexMonth(m.id)}
                                                        >
                                                            <i className="fa-regular fa-calendar"></i>
                                                            <div className="m-label">{m.label}</div>
                                                            <div className="m-year">{m.year}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="flex-scroll-right"><i className="fa-solid fa-chevron-right"></i></button>
                                            </div>
                                        </div>

                                        {/* NÚT CHỌN THÊM VÀO THEO YÊU CẦU */}
                                        <div className="flex-summary-footer">
                                            <span className="summary-text">{getFlexSummaryText()}</span>
                                            <button className="btn-select-flex" onClick={handleSelectFlex}>Chọn</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="divider"></div>

                    {/* Lớp phủ để click ra ngoài thì đóng popup khách */}
{showGuestPopup && (
    <div 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }} 
        onClick={() => setShowGuestPopup(false)}
    ></div>
)}

<div className="search-block guest-block" id="blockGuest" style={{ zIndex: 901 }}>
    <div className="block-content" onClick={() => {
        setShowGuestPopup(true);
        setShowLocationPopup(false);
        setShowDatePopup(false);
    }}>
        <div className="block-label">Khách</div>
        <div className="block-text" style={{ color: (adults + children + pets) > 0 ? '#222' : '#6a6a6a' }}>
            {getGuestSummary()}
        </div>
    </div>

    {/* POPUP CHỌN KHÁCH */}
    {showGuestPopup && (
        <div className="guest-popup">
            <div className="guest-row">
                <div className="guest-info">
                    <div className="guest-type">Người lớn</div>
                    <div className="guest-desc">Từ 13 tuổi trở lên</div>
                </div>
               <div className="guest-counter">
                    <button onClick={() => setAdults(Math.max(0, adults - 1))} disabled={adults === 0}>−</button>
                    <span>{adults}</span>
                    {/* Thêm disabled chặn giới hạn 20 */}
                    <button onClick={() => setAdults(adults + 1)} disabled={adults + children + pets >= 20}>+</button>
                </div>
            </div>

            <div className="guest-row">
                <div className="guest-info">
                    <div className="guest-type">Trẻ em</div>
                    <div className="guest-desc">Độ tuổi 2 – 12</div>
                </div>
                <div className="guest-counter">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} disabled={children === 0}>−</button>
                    <span>{children}</span>
                    {/* Thêm disabled chặn giới hạn 20 */}
                    <button onClick={() => setChildren(children + 1)} disabled={adults + children + pets >= 20}>+</button>
                </div>
            </div>

            <div className="guest-row">
                <div className="guest-info">
                    <div className="guest-type">Thú cưng</div>
                </div>
                <div className="guest-counter">
                <button onClick={() => setPets(Math.max(0, pets - 1))} disabled={pets === 0}>−</button>
                <span>{pets}</span>
                {/* Thêm disabled chặn giới hạn 20 */}
                <button onClick={() => setPets(pets + 1)} disabled={adults + children + pets >= 20}>+</button>
            </div>
            </div>

            <div className="guest-footer">
                <button className="btn-done-guest" onClick={() => setShowGuestPopup(false)}>Xong</button>
            </div>
        </div>
    )}

    <button className="btn-search-premium" onClick={handleSearch}>
        <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
    </button>
</div>

                </div>
            </section>

            {/* --- PHẦN HOMESTAY NỔI BẬT --- */}
            <section className="featured-sections" id="homestay-section">
                <div className="featured-row">
                    <div className="row-header">
                        <h2>Còn phòng tại Đà Lạt vào cuối tuần này <i className="fa-solid fa-arrow-right"></i></h2>
                        <div className="nav-arrows">
                            <button className="prev-btn"><i className="fa-solid fa-chevron-left"></i></button>
                            <button className="next-btn"><i className="fa-solid fa-chevron-right"></i></button>
                        </div>
                    </div>

                    <div className="carousel">
                        <div className="carousel-card">
                            <div className="img-container">
                                <span className="badge-favorite">Được khách yêu thích</span>
                                <i className="fa-regular fa-heart heart-icon"></i>
                                <img src="https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=500&q=80" alt="Cabin Đà Lạt" />
                            </div>
                            <div className="carousel-info">
                                <h4>Cabin tại Đà Lạt</h4>
                                <div className="carousel-price-rating">
                                    <div className="carousel-price"><span>₫1.462.933</span> cho 2 đêm</div>
                                    <div className="carousel-rating"><i className="fa-solid fa-star"></i> 5,0</div>
                                </div>
                            </div>
                        </div>

                        <div className="carousel-card">
                            <div className="img-container">
                                <span className="badge-favorite">Được khách yêu thích</span>
                                <i className="fa-regular fa-heart heart-icon"></i>
                                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80" alt="Nhà tại Đà Lạt" />
                            </div>
                            <div className="carousel-info">
                                <h4>Nhà tại Đà Lạt</h4>
                                <div className="carousel-price-rating">
                                    <div className="carousel-price"><span>₫1.871.578</span> cho 2 đêm</div>
                                    <div className="carousel-rating"><i className="fa-solid fa-star"></i> 5,0</div>
                                </div>
                            </div>
                        </div>

                        <div className="carousel-card">
                            <div className="img-container">
                                <span className="badge-favorite">Được khách yêu thích</span>
                                <i className="fa-regular fa-heart heart-icon"></i>
                                <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80" alt="Căn hộ Đà Lạt" />
                            </div>
                            <div className="carousel-info">
                                <h4>Căn hộ tại Đà Lạt</h4>
                                <div className="carousel-price-rating">
                                    <div className="carousel-price"><span>₫2.587.860</span> cho 2 đêm</div>
                                    <div className="carousel-rating"><i className="fa-solid fa-star"></i> 4,96</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="featured-row">
                    <div className="row-header">
                        <h2>Nơi lưu trú được ưa chuộng tại Hà Nội <i className="fa-solid fa-arrow-right"></i></h2>
                        <div className="nav-arrows">
                            <button className="prev-btn"><i className="fa-solid fa-chevron-left"></i></button>
                            <button className="next-btn"><i className="fa-solid fa-chevron-right"></i></button>
                        </div>
                    </div>

                    <div className="carousel">
                        <div className="carousel-card">
                            <div className="img-container">
                                <span className="badge-favorite">Được khách yêu thích</span>
                                <i className="fa-regular fa-heart heart-icon"></i>
                                <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&q=80" alt="Phòng Hà Nội" />
                            </div>
                            <div className="carousel-info">
                                <h4>Phòng tại Quận Hai Bà Trưng</h4>
                                <div className="carousel-price-rating">
                                    <div className="carousel-price"><span>₫1.386.353</span> cho 2 đêm</div>
                                    <div className="carousel-rating"><i className="fa-solid fa-star"></i> 4,94</div>
                                </div>
                            </div>
                        </div>

                        <div className="carousel-card">
                            <div className="img-container">
                                <span className="badge-favorite">Được khách yêu thích</span>
                                <i className="fa-regular fa-heart heart-icon"></i>
                                <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&q=80" alt="Nơi ở Tây Hồ" />
                            </div>
                            <div className="carousel-info">
                                <h4>Nơi ở tại Quận Tây Hồ</h4>
                                <div className="carousel-price-rating">
                                    <div className="carousel-price"><span>₫1.245.639</span> cho 2 đêm</div>
                                    <div className="carousel-rating"><i className="fa-solid fa-star"></i> 4,97</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PHẦN KHÁM PHÁ (SẢN PHẨM) --- */}
            <section className="products-section" id="rent-section" style={{ padding: '40px 50px' }}>
                <div className="row-header">
                    <h2>Khám phá Homestay & Dịch vụ thuê đồ</h2>
                </div>

                <div className="search-box" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên homestay, đồ thuê..."
                        style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={handleSearch}
                    >
                        Tìm kiếm
                    </button>
{/* 3. THÊM NÚT XEM DANH SÁCH YÊU THÍCH Ở ĐÂY */}
                    <button
                        style={{ 
                            padding: '10px 20px', 
                            background: showOnlyFavorites ? '#ff4d4f' : '#f0f0f0', 
                            color: showOnlyFavorites ? 'white' : 'black', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    >
                        {showOnlyFavorites ? '🔙 Quay lại tất cả' : `❤️ Xem phòng yêu thích (${favorites.length})`}
                    </button>

                    <div className="price-filter" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label>Mức giá tối đa:</label>
                        <input type="range" id="priceRange" min="0" max={highestPrice} step="50000" value={maxPrice} onChange={handlePriceChange} />
                        <span id="priceDisplay" style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            {maxPrice.toLocaleString('vi-VN')} ₫
                        </span>
                    </div>
                </div>

              <div id="productGrid" className="product-grid">
                    {currentItems.map((item) => (
                        <div 
                            className="card" 
                            key={item.id}
                            onClick={() => navigate('/homestay/' + item.id)} /* <-- THÊM DÒNG NÀY ĐỂ CLICK CẢ CARD */
                            style={{ cursor: 'pointer' }} /* <-- Chuột biến thành hình bàn tay khi di qua card */
                        >
                            
                            {/* ---- 2. SỬA LẠI KHỐI NÀY: BỌC ẢNH VÀ NÚT TIM VÀO DIV ---- */}
                            <div className="card-img-wrapper" style={{ position: 'relative' }}>
                                <img src={item.img} alt={item.name} />
                                <button 
                                    className={`heart-btn ${favorites.includes(item.id) ? 'active' : ''}`}
                                    onClick={(e) => toggleFavorite(e, item.id)}
                                >
                                   {favorites.includes(item.id) ? '❤️' : '🤍'}
                                </button>
                            </div>
                            {/* -------------------------------------------------------- */}

                            <div className="card-info">
                                <span className="type-badge">{item.type}</span>
                                <h3 className="card-title">{item.name}</h3>
                                <p className="card-location">📍 {item.location}</p>
                                <p className="card-price"><strong>{item.price.toLocaleString()} ₫</strong> / ngày</p>
                                
                                {/* <-- ĐÃ ĐỔI THẺ <Link> THÀNH THẺ <div> Ở DÒNG DƯỚI --> */}
                                <div className="btn-book" style={{display: 'inline-block', textAlign: 'center', textDecoration: 'none'}}>Đặt ngay</div>
                            </div>
                        </div>
                    ))}
{/* --- THANH ĐIỀU HƯỚNG PHÂN TRANG --- */}
{totalPages > 1 && (
    <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '40px 0' }}>
        
        {/* Nút Trước */}
        <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: '#f8f9fa' }}
        >
            &laquo; Trước
        </button>

        {/* Các nút số trang */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
                key={number}
                onClick={() => setCurrentPage(number)}
                style={{
                    padding: '8px 16px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                    backgroundColor: currentPage === number ? '#007bff' : '#fff',
                    color: currentPage === number ? '#fff' : '#333',
                    fontWeight: currentPage === number ? 'bold' : 'normal'
                }}
            >
                {number}
            </button>
        ))}

        {/* Nút Sau */}
        <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', backgroundColor: '#f8f9fa' }}
        >
            Sau &raquo;
        </button>
        
    </div>
)}
                    {filteredData.length === 0 && (
                        <p style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
                            Không tìm thấy kết quả nào phù hợp với "{searchTerm}" m ơi! 😅
                        </p>
                    )}
                </div>
            </section>

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
        </main>
    );
}

export default Home;