import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { useCart } from '../context/CartContext';
import './Home.css';
import api from '../api';

function Home() {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // 1. STATES KHỞI TẠO
    const [allProducts, setAllProducts] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [maxPrice, setMaxPrice] = useState(5000000); 
    const [highestPrice, setHighestPrice] = useState(5000000);
    const [searchTerm, setSearchTerm] = useState("");
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    
    // STATE BẬT/TẮT GIAO DIỆN TỪ THANH HERO
    const [isHeroSearching, setIsHeroSearching] = useState(false);

    // 2. LOGIC LẤY DATA
    useEffect(() => {
        Promise.all([
            axios.get('/api/rooms'),
            axios.get('/api/accessories')
        ])
        .then(([roomsRes, accRes]) => {
            const dbRooms = roomsRes.data.data || [];
            const dbAccessories = accRes.data.data || accRes.data || [];
            
            const approvedRooms = dbRooms; // Bỏ qua bộ lọc status, lấy hết xem nó có lên không
            
            const formattedRooms = approvedRooms.map(room => ({
                id: room.id,
                name: room.title,
                price: Number(room.price_per_night),
                deposit: 0,
                type: "Homestay",
                location: room.location,
                img: room.images && room.images.length > 0 ? room.images[0] : "https://placehold.co/500x500"
            }));

            
            const formattedAccessories = dbAccessories.map(acc => ({
                id: acc.id,
                name: acc.name,
                price: Number(acc.price_per_day || acc.price || 0),
                deposit: Number(acc.deposit_amount || acc.deposit || 0),
                type: "Cho thuê",
                location: acc.location || "Đà Lạt", // 👈 Phải lấy từ DB cột location của món đồ đó
                img: acc.image || acc.img || "https://placehold.co/500x500"
            }));

            const combinedData = [...formattedRooms, ...formattedAccessories];
            console.log("Dữ liệu sau khi kết hợp:", combinedData);
            setAllProducts(combinedData);
            setFilteredData(combinedData);

            const maxP = combinedData.length > 0 
                ? Math.max(...combinedData.map(item => Number(item.price) || 0)) 
                : 5000000;
            setHighestPrice(maxP);
            setMaxPrice(maxP);
        })
        .catch(err => console.error("Lỗi khi đồng bộ hóa dữ liệu từ Backend:", err));
    }, []);

    // LỌC PHÒNG CHO CAROUSEL
    const dalatRooms = allProducts.filter(item => item.type === "Homestay" && item.location.toLowerCase().includes("đà lạt"));
    const hanoiRooms = allProducts.filter(item => item.type === "Homestay" && item.location.toLowerCase().includes("hà nội"));
    const nhaTrangRooms = allProducts.filter(item => item.type === "Homestay" && item.location.toLowerCase().includes("nha trang"));
    const vungTauRooms = allProducts.filter(item => item.type === "Homestay" && item.location.toLowerCase().includes("vũng tàu"));
    const seoulRooms = allProducts.filter(item => item.type === "Homestay" && item.location.toLowerCase().includes("seoul"));

    const handleActionClick = (item) => {
        if (item.type === "Homestay") {
            navigate('/homestay/' + item.id); 
        } else {
            addToCart({
                id: item.id, 
                name: item.name, 
                price: item.price, 
                deposit: item.deposit, 
                image: item.img, 
                type: 'accessory'
            });
            alert(`Đã thêm ${item.name} vào giỏ hàng!`);
        }
    };

    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

    const toggleFavorite = (e, id) => {
        e.preventDefault();
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

    // 3. XỬ LÝ TÌM KIẾM
    const applyFilters = (text, price) => {
        const result = allProducts.filter(item => {
            const matchText = text.trim() === "" ||
                item.name.toLowerCase().includes(text.toLowerCase()) ||
                item.location.toLowerCase().includes(text.toLowerCase());
            const matchPrice = item.price <= price;
            return matchText && matchPrice;
        });
        setFilteredData(result);
        setCurrentPage(1); 
    };

    const handleSelectLocation = (locationName) => {
        setSearchTerm(locationName);
        setShowLocationPopup(false);
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        if(!isHeroSearching) {
             applyFilters(e.target.value, maxPrice);
        }
    };

    const handlePriceChange = (e) => {
        const value = parseInt(e.target.value);
        setMaxPrice(value);
        applyFilters(searchTerm, value);
    };

    // Hàm cho thanh tìm kiếm bự ở trên
    const handleHeroSearch = () => {
        setIsHeroSearching(true);
        applyFilters(searchTerm, maxPrice);
    };

    // Hàm cho thanh tìm kiếm nhỏ ở dưới
    const handleQuickSearch = () => {
        applyFilters(searchTerm, maxPrice);
    };

    const clearHeroSearch = () => {
        setIsHeroSearching(false);
        setSearchTerm("");
        setFilteredData(allProducts);
    };

    const handleKeyDown = (e) => { 
        if (e.key === 'Enter') {
            isHeroSearching ? handleHeroSearch() : handleQuickSearch();
        }
    };

    // NGÀY THÁNG VÀ KHÁCH
    const [showDatePopup, setShowDatePopup] = useState(false);
    const [dateTab, setDateTab] = useState('calendar');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [currentMonthView, setCurrentMonthView] = useState(new Date());
    const [exactTolerance, setExactTolerance] = useState('exact');
    const [flexDuration, setFlexDuration] = useState('other');
    const [flexCustomNights, setFlexCustomNights] = useState(1);
    const [flexSelectedMonths, setFlexSelectedMonths] = useState([]);
    const [savedFlexSummary, setSavedFlexSummary] = useState("");

    const upcomingMonths = useMemo(() => {
        const months = [];
        const d = new Date();
        for (let i = 0; i <= 12; i++) {
            months.push({ id: `${d.getFullYear()}-${d.getMonth()}`, label: `Th ${d.getMonth() + 1}`, year: d.getFullYear() });
            d.setMonth(d.getMonth() + 1);
        }
        return months;
    }, []);

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

    const handleSelectFlex = () => {
        setSavedFlexSummary(getFlexSummaryText());
        setShowDatePopup(false);
    };

    const [showGuestPopup, setShowGuestPopup] = useState(false);
    const [adults, setAdults] = useState(0);
    const [children, setChildren] = useState(0);
    const [pets, setPets] = useState(0);

    const getGuestSummary = () => {
        const total = adults + children;
        if (total === 0 && pets === 0) return "Thêm khách";
        let parts = [];
        if (total > 0) parts.push(`${total} khách`);
        if (pets > 0) parts.push(`${pets} thú cưng`);
        return parts.join(", ");
    };

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

    const renderCarouselRow = (title, rooms) => (
        <div className="featured-row">
            <div className="row-header">
                <h2>{title} <i className="fa-solid fa-arrow-right"></i></h2>
                <div className="nav-arrows">
                    <button className="prev-btn"><i className="fa-solid fa-chevron-left"></i></button>
                    <button className="next-btn"><i className="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
            <div className="carousel">
                {rooms.length === 0 ? (
                    <p style={{ color: '#717171' }}> Đang tải...</p>
                ) : (
                    rooms.map((room) => (
                        <Link to={`/homestay/${room.id}`} key={room.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="carousel-card">
                                <div className="img-container">
                                    <span className="badge-favorite">Được khách yêu thích</span>
                                    <i className="fa-regular fa-heart heart-icon"></i>
                                    <img src={room.img} alt={room.name} />
                                </div>
                                <div className="carousel-info">
                                    <h4>{room.name}</h4>
                                    <div className="carousel-price-rating">
                                        <div className="carousel-price"><span>₫{room.price.toLocaleString('vi-VN')}</span> cho 1 đêm</div>
                                        <div className="carousel-rating"><i className="fa-solid fa-star"></i> 5,0</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );

    // PHÂN TRANG
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; 

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredData, showOnlyFavorites]);

    const finalDataToDisplay = showOnlyFavorites
        ? filteredData.filter(item => favorites.includes(item.id))
        : filteredData;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = finalDataToDisplay.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(finalDataToDisplay.length / itemsPerPage);

    return (
        <main>
            {/* THANH TÌM KIẾM HERO (GIỮ NGUYÊN) */}
            <section className="search-section-premium">
                <div className="search-bar-pill">
                    {showLocationPopup && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }} onClick={() => setShowLocationPopup(false)}></div>
                    )}

                    <div className="search-block" id="blockLocation" style={{ zIndex: 901 }}>
                        <div className="block-content">
                            <div className="block-label">Địa điểm</div>
                            <input type="text" className="block-input" placeholder="Tìm kiếm điểm đến" value={searchTerm} onChange={handleInputChange} onKeyDown={handleKeyDown} onClick={() => { setShowLocationPopup(true); setShowDatePopup(false); }} />
                        </div>
                        {showLocationPopup && (
                            <div className="location-popup">
                                <div className="popup-title">Các điểm đến thịnh hành</div>
                                <ul className="location-list">
                                    <li onClick={() => handleSelectLocation("Nha Trang")}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <div className="loc-text"><strong>Nha Trang</strong><span>Việt Nam</span></div>
                                    </li>
                                    <li onClick={() => handleSelectLocation("Hà Nội")}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <div className="loc-text"><strong>Hà Nội</strong><span>Việt Nam</span></div>
                                    </li>
                                    <li onClick={() => handleSelectLocation("Đà Lạt")}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <div className="loc-text"><strong>Đà Lạt</strong><span>Việt Nam</span></div>
                                    </li>
                                    <li onClick={() => handleSelectLocation("Vũng Tàu")}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <div className="loc-text"><strong>Vũng Tàu</strong><span>Việt Nam</span></div>
                                    </li>
                                    <li onClick={() => handleSelectLocation("TP. Hồ Chí Minh")}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <div className="loc-text"><strong>TP. Hồ Chí Minh</strong><span>Việt Nam</span></div>
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
                        <div className="block-content" onClick={() => { setShowDatePopup(true); setShowLocationPopup(false); setDateTab('calendar'); }}>
                            <div className="block-label">Thời gian</div>
                            <div className="block-text" style={{ color: startDate || savedFlexSummary ? '#222' : '#6a6a6a' }}>{renderBlockDateText()}</div>
                        </div>

                        {showDatePopup && (
                            <div className="date-popup">
                                <div className="date-tabs-wrapper">
                                    <div className="date-tabs">
                                        <div className={`tab ${dateTab === 'calendar' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setDateTab('calendar'); }}>Lịch</div>
                                        <div className={`tab ${dateTab === 'flexible' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setDateTab('flexible'); }}>Ngày linh hoạt</div>
                                    </div>
                                </div>

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
                                        </div>
                                    </>
                                )}

                                {dateTab === 'flexible' && (
                                    <div className="flexible-content">
                                        <div className="flex-section">
                                            <div className="flex-section-title">Bạn muốn ở bao lâu?</div>
                                            <div className="flex-duration-options">
                                                <label className="radio-label"><input type="radio" name="duration" checked={flexDuration === 'weekend'} onChange={() => setFlexDuration('weekend')} />Cuối tuần</label>
                                                <label className="radio-label"><input type="radio" name="duration" checked={flexDuration === '1week'} onChange={() => setFlexDuration('1week')} />1 tuần</label>
                                                <label className="radio-label"><input type="radio" name="duration" checked={flexDuration === 'other'} onChange={() => setFlexDuration('other')} />Khác</label>
                                            </div>
                                        </div>
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

                    {showGuestPopup && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }} onClick={() => setShowGuestPopup(false)}></div>
                    )}

                    <div className="search-block guest-block" id="blockGuest" style={{ zIndex: 901 }}>
                        <div className="block-content" onClick={() => { setShowGuestPopup(true); setShowLocationPopup(false); setShowDatePopup(false); }}>
                            <div className="block-label">Khách</div>
                            <div className="block-text" style={{ color: (adults + children + pets) > 0 ? '#222' : '#6a6a6a' }}>{getGuestSummary()}</div>
                        </div>

                        {showGuestPopup && (
    <div className="guest-popup">
        {/* ROW NGƯỜI LỚN */}
        <div className="guest-row">
            <div className="guest-info">
                <div className="guest-type">Người lớn</div>
                <div className="guest-desc">Từ 13 tuổi trở lên</div>
            </div>
            <div className="guest-counter">
                <button onClick={() => setAdults(Math.max(0, adults - 1))} disabled={adults === 0}>−</button>
                <span>{adults}</span>
                <button onClick={() => setAdults(adults + 1)}>+</button>
            </div>
        </div>

        {/* ROW TRẺ EM */}
        <div className="guest-row" style={{ marginTop: '15px' }}>
            <div className="guest-info">
                <div className="guest-type">Trẻ em</div>
                <div className="guest-desc">Độ tuổi 2 – 12</div>
            </div>
            <div className="guest-counter">
                <button onClick={() => setChildren(Math.max(0, children - 1))} disabled={children === 0}>−</button>
                <span>{children}</span>
                <button onClick={() => setChildren(children + 1)}>+</button>
            </div>
        </div>

                        {/* ROW THÚ CƯNG */}
                        <div className="guest-row" style={{ marginTop: '15px' }}>
                            <div className="guest-info">
                                <div className="guest-type">Thú cưng</div>
                                <div className="guest-desc">Mang theo lồng/túi</div>
                            </div>
                            <div className="guest-counter">
                                <button onClick={() => setPets(Math.max(0, pets - 1))} disabled={pets === 0}>−</button>
                                <span>{pets}</span>
                                <button onClick={() => setPets(pets + 1)}>+</button>
                            </div>
                        </div>

                        <div className="guest-footer" style={{ marginTop: '20px' }}>
                            <button className="btn-done-guest" onClick={() => setShowGuestPopup(false)}>Xong</button>
                        </div>
                    </div>
                )}

                        <button className="btn-search-premium" onClick={handleHeroSearch}><i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm</button>
                    </div>
                </div>
            </section>

            {/* ĐIỀU KIỆN HIỂN THỊ CỰC MƯỢT */}
            {isHeroSearching ? (
                // ================= KẾT QUẢ TÌM KIẾM HERO (CŨNG GIỮ 4 Ô) =================
                <section className="search-results-section" style={{ padding: '40px 50px', background: '#fff', minHeight: '50vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2>Kết quả tìm kiếm cho: "{searchTerm || "Tất cả địa điểm"}"</h2>
                        <button 
                            onClick={clearHeroSearch}
                            style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ff385c', color: '#ff385c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            <i className="fa-solid fa-xmark"></i> Hủy tìm kiếm & Về trang chủ
                        </button>
                    </div>
                    
                    <div id="productGrid" className="product-grid">
                        {currentItems.map((item) => (
                            <div className="card" key={item.id} onClick={() => { if (item.type === "Homestay") navigate('/homestay/' + item.id); }} style={{ cursor: item.type === "Homestay" ? 'pointer' : 'default' }}>
                                <div className="card-img-wrapper" style={{ position: 'relative' }}>
                                    <img src={item.img} alt={item.name} />
                                    <button className={`heart-btn ${favorites.includes(item.id) ? 'active' : ''}`} onClick={(e) => toggleFavorite(e, item.id)}>
                                        {favorites.includes(item.id) ? '❤️' : '🤍'}
                                    </button>
                                </div>
                                <div className="card-info">
                                    <span className="type-badge">{item.type}</span>
                                    <h3 className="card-title">{item.name}</h3>
                                    <p className="card-location">📍 {item.location}</p>
                                    <p className="card-price"><strong>{item.price.toLocaleString()} ₫</strong> {item.type === "Homestay" ? "/ đêm" : "/ ngày"}</p>
                                    <button className="btn-book" onClick={(e) => { e.stopPropagation(); handleActionClick(item); }}>
                                        {item.type === "Homestay" ? "Đặt ngay" : "Thêm vào giỏ"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredData.length === 0 && (<p style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#717171' }}>Không tìm thấy chỗ ở nào phù hợp với tìm kiếm của bạn.</p>)}
                    
                    {totalPages > 1 && (
                        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '40px 0' }}>
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: '#f8f9fa' }}>&laquo; Trước</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button key={number} onClick={() => setCurrentPage(number)} style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: currentPage === number ? '#007bff' : '#fff', color: currentPage === number ? '#fff' : '#333', fontWeight: currentPage === number ? 'bold' : 'normal' }}>{number}</button>
                            ))}
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', backgroundColor: '#f8f9fa' }}>Sau &raquo;</button>
                        </div>
                    )}
                </section>

            ) : (
                // ================= GIAO DIỆN TRANG CHỦ BÌNH THƯỜNG =================
                <>
                    <section className="featured-sections" id="homestay-section">
                        {renderCarouselRow("Còn phòng tại Đà Lạt vào cuối tuần này", dalatRooms)}
                        {renderCarouselRow("Nơi lưu trú được ưa chuộng tại Hà Nội", hanoiRooms)}
                        {renderCarouselRow("Điểm đến hấp dẫn tại Nha Trang", nhaTrangRooms)}
                        {renderCarouselRow("Khám phá kỳ nghỉ tại Vũng Tàu", vungTauRooms)}
                        {renderCarouselRow("Trải nghiệm lưu trú tại TP. Hồ Chí Minh", seoulRooms)}
                    </section>

                    {/* TRẢ LẠI Y NGUYÊN GIAO DIỆN KHÁM PHÁ CỦA M NÈ */}
                    <section className="products-section" id="rent-section" style={{ padding: '40px 50px' }}>
                        <div className="row-header"><h2>Khám phá Homestay & Dịch vụ thuê đồ</h2></div>
                        <div className="search-box" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input type="text" placeholder="Tìm kiếm tên homestay, đồ thuê..." style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} value={searchTerm} onChange={handleInputChange} onKeyDown={handleKeyDown} />
                            <button style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleQuickSearch}>Tìm kiếm</button>
                            <button style={{ padding: '10px 20px', background: showOnlyFavorites ? '#ff4d4f' : '#f0f0f0', color: showOnlyFavorites ? 'white' : 'black', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}>
                                {showOnlyFavorites ? '🔙 Quay lại tất cả' : `❤️ Xem phòng yêu thích (${favorites.length})`}
                            </button>
                            <div className="price-filter" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label>Mức giá tối đa:</label>
                                <input type="range" id="priceRange" min="0" max={highestPrice} step="50000" value={maxPrice} onChange={handlePriceChange} />
                                <span id="priceDisplay" style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{maxPrice.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        </div>

                        <div id="productGrid" className="product-grid">
                            {currentItems.map((item) => (
                                <div className="card" key={item.id} onClick={() => { if (item.type === "Homestay") navigate('/homestay/' + item.id); }} style={{ cursor: item.type === "Homestay" ? 'pointer' : 'default' }}>
                                    <div className="card-img-wrapper" style={{ position: 'relative' }}>
                                        <img src={item.img} alt={item.name} />
                                        <button className={`heart-btn ${favorites.includes(item.id) ? 'active' : ''}`} onClick={(e) => toggleFavorite(e, item.id)}>
                                            {favorites.includes(item.id) ? '❤️' : '🤍'}
                                        </button>
                                    </div>
                                    <div className="card-info">
                                        <span className="type-badge">{item.type}</span>
                                        <h3 className="card-title">{item.name}</h3>
                                        <p className="card-location">📍 {item.location}</p>
                                        <p className="card-price"><strong>{item.price.toLocaleString()} ₫</strong> {item.type === "Homestay" ? "/ đêm" : "/ ngày"}</p>
                                        <button className="btn-book" onClick={(e) => { e.stopPropagation(); handleActionClick(item); }}>
                                            {item.type === "Homestay" ? "Đặt ngay" : "Thêm vào giỏ"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '40px 0' }}>
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: '#f8f9fa' }}>&laquo; Trước</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                    <button key={number} onClick={() => setCurrentPage(number)} style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: currentPage === number ? '#007bff' : '#fff', color: currentPage === number ? '#fff' : '#333', fontWeight: currentPage === number ? 'bold' : 'normal' }}>{number}</button>
                                ))}
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', backgroundColor: '#f8f9fa' }}>Sau &raquo;</button>
                            </div>
                        )}
                        {filteredData.length === 0 && (<p style={{ textAlign: 'center', width: '100%', padding: '20px' }}>Không tìm thấy kết quả phù hợp.</p>)}
                    </section>
                </>
            )}

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
        </main>
    );
}

export default Home;