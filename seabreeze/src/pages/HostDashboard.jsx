import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HostDashboard.css';

export default function HostDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // LẤY THÔNG TIN CHỦ NHÀ ĐANG ĐĂNG NHẬP
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    // --- STATES DỮ LIỆU PHÒNG ---
    const [myRooms, setMyRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);

    // --- STATES DỮ LIỆU ĐƠN HÀNG ---
    const [myOrders, setMyOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // --- STATES CHO POPUP PHÒNG ---
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [newRoom, setNewRoom] = useState({
        title: '', location: '', price_per_night: '', images: '', description: ''
    });
    const [showEditRoomModal, setShowEditRoomModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    // --- STATES CHO KHO ĐỒ THUÊ ---
    const [myAccessories, setMyAccessories] = useState([]);
    const [showAccessoryModal, setShowAccessoryModal] = useState(false);
    const [accForm, setAccForm] = useState({
        id: null, name: '', price_per_day: '', deposit_amount: '', stock_quantity: 1, image: '', location: ''
    });

    // --- HÀM LẤY DATA PHÒNG TỪ BACKEND ---
    const fetchRooms = () => {
        setLoadingRooms(true);
        axios.get('http://localhost/api/rooms')
            .then(res => {
                const allRooms = res.data.data || [];
                const myOwnRooms = allRooms.filter(room => room.host_id === currentUser?.id);
                setMyRooms(myOwnRooms);
                setLoadingRooms(false);
            })
            .catch(err => {
                console.error("Lỗi lấy danh sách phòng:", err);
                setLoadingRooms(false);
            });
    };

    // --- HÀM CẬP NHẬT PHÒNG ---
    const handleUpdateRoom = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost/api/rooms/${editingRoom.id}`, editingRoom, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Cập nhật phòng thành công!");
            setShowEditRoomModal(false);
            fetchRooms();
        } catch (error) {
            alert("Lỗi khi cập nhật phòng");
        }
    };

    // --- HÀM XÓA PHÒNG ---
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa phòng này không?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost/api/rooms/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Xóa thành công!");
                fetchRooms();
            } catch (error) {
                console.error("Lỗi xóa phòng:", error);
                alert("Xóa thất bại, kiểm tra lại API nha!");
            }
        }
    };

    // --- HÀM LẤY ĐÁNH GIÁ ---
    const [allReviews, setAllReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const fetchHostReviews = () => {
        if (!currentUser) return;
        setLoadingReviews(true);
        const token = localStorage.getItem('token');
        axios.get(`http://localhost/api/host/${currentUser.id}/reviews`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => { setAllReviews(res.data); setLoadingReviews(false); })
            .catch(err => { console.error("Lỗi tải đánh giá:", err); setLoadingReviews(false); });
    };

    const handleDeleteReview = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa đánh giá này khỏi phòng của mình không?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost/api/host/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(() => { alert("Đã xóa đánh giá thành công!"); fetchHostReviews(); })
                .catch(() => alert("Lỗi khi xóa đánh giá!"));
        }
    };

    // --- HÀM XỬ LÝ KHO ĐỒ THUÊ ---
    const fetchMyAccessories = () => {
        if (!currentUser) return;
        axios.get('http://localhost/api/accessories')
            .then(res => {
                const allAcc = res.data.data || res.data || [];
                const myAcc = allAcc.filter(acc => acc.host_id === currentUser.id);
                setMyAccessories(myAcc);
            })
            .catch(err => console.error("Lỗi lấy kho đồ thuê:", err));
    };

    const handleSaveAccessory = () => {
        const payload = { ...accForm, host_id: currentUser.id };
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (accForm.id) {
            // Edit
            axios.put(`http://localhost/api/accessories/${accForm.id}`, payload, config)
                .then(() => { alert("Cập nhật đồ thuê thành công!"); setShowAccessoryModal(false); fetchMyAccessories(); })
                .catch(err => alert("Lỗi cập nhật: " + err.message));
        } else {
            // Create
            axios.post('http://localhost/api/accessories', payload, config)
                .then(() => { alert("Thêm vào kho thành công!"); setShowAccessoryModal(false); fetchMyAccessories(); })
                .catch(err => alert("Lỗi thêm: " + err.message));
        }
    };

    const handleDeleteAccessory = (id) => {
        if (window.confirm("Chắc chắn muốn xóa đồ thuê này khỏi kho?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost/api/accessories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(() => fetchMyAccessories())
                .catch(err => alert("Lỗi xóa: " + err.message));
        }
    };

    // --- HÀM LẤY DATA ĐƠN HÀNG TỪ BACKEND ---
    const fetchOrders = () => {
        setLoadingOrders(true);
        const token = localStorage.getItem('token');

        axios.get('http://localhost/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const allOrders = res.data.data || [];
            const myHostOrders = allOrders.filter(o => o.room?.host_id === currentUser?.id);
            setMyOrders(myHostOrders);
            setLoadingOrders(false);
        })
        .catch(err => {
            console.error("Lỗi lấy danh sách đơn hàng:", err);
            setLoadingOrders(false);
        });
    };

    // --- HÀM XỬ LÝ ĐƠN HÀNG (XÁC NHẬN / HỦY) ---
    const handleConfirmOrder = (id) => {
        const token = localStorage.getItem('token');
        axios.put(`http://localhost/api/orders/${id}/confirm`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            alert(`Hệ thống: Đã xác nhận đơn hàng thành công và kích hoạt gửi mail báo khách!`);
            fetchOrders();
        })
        .catch(err => alert("Lỗi khi kết nối duyệt đơn hàng: " + err.message));
    };

    const handleCancelOrder = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này không? Hành động này sẽ xóa dữ liệu đơn vĩnh viễn!")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                alert("Đã hủy và xóa bỏ đơn đặt hàng thành công.");
                fetchOrders();
            })
            .catch(err => alert("Lỗi khi hủy đơn hàng: " + err.message));
        }
    };

    // --- HÀM ĐẨY DỮ LIỆU PHÒNG MỚI LÊN LARAVEL ---
    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (!newRoom.title || !newRoom.location || !newRoom.price_per_night) {
            alert("Vui lòng điền đầy đủ Tên, Vị trí và Giá phòng!");
            return;
        }

        const roomData = {
            title: newRoom.title,
            location: newRoom.location,
            price_per_night: parseFloat(newRoom.price_per_night),
            images: newRoom.images ? [newRoom.images] : ['https://placehold.co/800x600'],
            description: newRoom.description || 'Không có mô tả.',
            host_id: currentUser?.id
        };

        const token = localStorage.getItem('token');
        axios.post('http://localhost/api/rooms', roomData, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            alert("Đã tạo phòng mới thành công.");
            fetchRooms();
            setShowAddRoomModal(false);
            setNewRoom({ title: '', location: '', price_per_night: '', images: '', description: '' });
        })
        .catch(err => {
            const errorMessage = err.response?.data?.message || err.message;
            alert("Laravel báo lỗi nè: " + errorMessage);
        });
    };

    // Chạy kích hoạt load dữ liệu
    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'rooms') fetchRooms();
        if (activeTab === 'overview' || activeTab === 'orders') fetchOrders();
        if (activeTab === 'reviews') fetchHostReviews();
        if (activeTab === 'accessories') fetchMyAccessories();
    }, [activeTab]);

    // --- LOGIC HIỂN THỊ NỘI DUNG TỪNG TAB ---
    const renderContent = () => {
        if (activeTab === 'reviews') {
            return (
                <div className="host-panel" style={{ padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>Quản lý đánh giá</h3>
                    {loadingReviews ? (
                        <p style={{ textAlign: 'center' }}>Đang tải đánh giá...</p>
                    ) : (
                        <table className="host-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', paddingBottom: '12px', color: '#666', fontSize: '14px' }}>
                                    <th style={{ padding: '12px 8px' }}>KHÁCH HÀNG</th>
                                    <th style={{ padding: '12px 8px' }}>PHÒNG ĐƯỢC ĐÁNH GIÁ</th>
                                    <th style={{ padding: '12px 8px' }}>SỐ SAO</th>
                                    <th style={{ padding: '12px 8px' }}>NỘI DUNG</th>
                                    <th style={{ padding: '12px 8px' }}>THỜI GIAN</th>
                                    <th style={{ padding: '12px 8px' }}>HÀNH ĐỘNG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allReviews.length > 0 ? allReviews.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #eee', fontSize: '15px' }}>
                                        <td style={{ padding: '16px 8px' }}>
                                            <strong>{r.user_name}</strong><br />
                                            <small style={{ color: '#717171' }}>{r.user_email}</small>
                                        </td>
                                        <td style={{ padding: '16px 8px', color: '#222', fontWeight: '500' }}>{r.room_name}</td>
                                        <td style={{ padding: '16px 8px', color: '#fbbf24', fontSize: '16px' }}>
                                            {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                                        </td>
                                        <td style={{ padding: '16px 8px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.content}>
                                            "{r.content}"
                                        </td>
                                        <td style={{ padding: '16px 8px', color: '#666' }}>
                                            {new Date(r.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td style={{ padding: '16px 8px' }}>
                                            <button onClick={() => handleDeleteReview(r.id)} style={{ background: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                                                Xóa bớt rác
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Chưa có đánh giá nào!</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            );
        }

        if (activeTab === 'overview') {
            const confirmedOrders = myOrders.filter(o => o.status === 'confirmed');
            const totalRevenue = confirmedOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
            const pendingCount = myOrders.filter(o => o.status === 'pending').length;

            return (
                <>
                    <div className="stat-cards-grid">
                        <div className="stat-card">
                            <h3>Tổng doanh thu (Đơn đã xác nhận)</h3>
                            <p className="stat-value">{totalRevenue.toLocaleString()} ₫</p>
                            <p className="stat-trend">
                                <i className="fa-solid fa-arrow-trend-up"></i> {myOrders.length > 0 ? " Dữ liệu thời gian thực" : " Chưa có doanh thu"}
                            </p>
                        </div>
                        <div className="stat-card">
                            <h3>Phòng đang hoạt động</h3>
                            <p className="stat-value">{myRooms.length} phòng</p>
                            <p className="stat-trend" style={{ color: '#717171' }}>Dữ liệu hệ thống</p>
                        </div>
                        <div className="stat-card">
                            <h3>Đơn chờ xác nhận</h3>
                            <p className="stat-value" style={{ color: pendingCount > 0 ? '#b25c00' : '#717171' }}>{pendingCount} đơn</p>
                            <p className="stat-trend" style={{ color: '#b25c00' }}>{pendingCount > 0 ? 'Cần xử lý ngay' : 'Đã dọn sạch'}</p>
                        </div>
                    </div>

                    <div className="host-section-panel">
                        <div className="panel-header">
                            <h2>Đơn đặt phòng gần đây</h2>
                            <button className="btn-see-all" onClick={() => setActiveTab('orders')}>Xem tất cả</button>
                        </div>
                        <table className="host-table">
                            <thead>
                                <tr>
                                    <th>Khách hàng</th>
                                    <th>Phòng</th>
                                    <th>Ngày lưu trú</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingOrders ? (
                                    <tr><td colSpan="4">Đang tải danh sách đơn hàng...</td></tr>
                                ) : myOrders.length === 0 ? (
                                    <tr><td colSpan="4">Chưa có dữ liệu đơn hàng.</td></tr>
                                ) : (
                                    myOrders.slice(0, 5).map(order => (
                                        <tr key={order.id}>
                                            <td><strong>{order.customer_name}</strong></td>
                                            <td>{order.room ? order.room.title : <span style={{ color: 'red' }}>Phòng đã bị xóa</span>}</td>
                                            <td>{order.check_in} - {order.check_out}</td>
                                            <td>
                                                <span className={`status-badge status-${order.status}`}>
                                                    {order.status === 'pending' ? 'Chờ xác nhận' : 'Đã xác nhận'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            );
        }

        if (activeTab === 'rooms') {
            return (
                <div className="host-section-panel">
                    <div className="panel-header">
                        <h2>Quản lý phòng của tôi</h2>
                        <button className="btn-primary" onClick={() => setShowAddRoomModal(true)}>
                            <i className="fa-solid fa-plus"></i> Thêm phòng mới
                        </button>
                    </div>

                    {loadingRooms ? <p>Đang tải dữ liệu từ máy chủ...</p> : (
                        <table className="host-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Thông tin phòng</th>
                                    <th>Giá / Đêm</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myRooms.map(room => (
                                    <tr key={room.id}>
                                        <td><strong>#{room.id}</strong></td>
                                        <td>
                                            <div className="room-cell">
                                                <img src={room.images?.[0] || 'https://placehold.co/100'} alt={room.title} />
                                                <div className="room-cell-info">
                                                    <h4>{room.title}</h4>
                                                    <p>{room.location}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td><strong>{Number(room.price_per_night).toLocaleString()} ₫</strong></td>
                                        <td>
                                            {room.status === 'pending' ? (
                                                <span className="status-badge status-pending" style={{ background: '#fff3cd', color: '#856404' }}>⏳ Chờ duyệt</span>
                                            ) : room.status === 'rejected' ? (
                                                <span className="status-badge status-inactive" style={{ background: '#f8d7da', color: '#721c24' }}>❌ Từ chối</span>
                                            ) : (
                                                <span className="status-badge status-active" style={{ background: '#d4edda', color: '#155724' }}>✅ Đã duyệt</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <button onClick={() => { setEditingRoom(room); setShowEditRoomModal(true); }} title="Chỉnh sửa" style={{ background: '#ffc107', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(room.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', padding: '6px 12px' }}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            );
        }

        if (activeTab === 'accessories') {
            return (
                <div className="host-section-panel fade-in">
                    <div className="panel-header">
                        <h2>Quản lý kho sản phẩm cho thuê</h2>
                        <button className="btn-primary" onClick={() => {
                            setAccForm({ id: null, name: '', price_per_day: '', deposit_amount: '', stock_quantity: 1, image: '', location: '' });
                            setShowAccessoryModal(true);
                        }}>
                            <i className="fa-solid fa-plus"></i> Thêm Sản Phẩm
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="host-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>TÊN SẢN PHẨM</th>
                                    <th>KHU VỰC</th>
                                    <th>GIÁ THUÊ / NGÀY</th>
                                    <th>TIỀN CỌC</th>
                                    <th>TỒN KHO</th>
                                    <th>THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myAccessories.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Kho đang trống.</td></tr>
                                ) : (
                                    myAccessories.map(acc => (
                                        <tr key={acc.id}>
                                            <td><strong>#{acc.id}</strong></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <img src={acc.image || 'https://placehold.co/50'} alt={acc.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                                                    <strong>{acc.name}</strong>
                                                </div>
                                            </td>
                                            <td><span className="badge">{acc.location}</span></td>
                                            <td><strong style={{ color: '#007bff' }}>{Number(acc.price_per_day || acc.price).toLocaleString()} ₫</strong></td>
                                            <td><strong style={{ color: '#f59e0b' }}>{Number(acc.deposit_amount || acc.deposit).toLocaleString()} ₫</strong></td>
                                            <td>{acc.stock_quantity || acc.stock}</td>
                                            <td>
                                                <div className="action-btns" style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => { setAccForm(acc); setShowAccessoryModal(true); }} style={{ background: '#ffc107', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => handleDeleteAccessory(acc.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f', padding: '6px 12px' }}>
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (activeTab === 'orders') {
            return (
                <div className="host-section-panel">
                    <div className="panel-header">
                        <h2>Quản lý đơn đặt phòng</h2>
                    </div>
                    {loadingOrders ? <p>Đang đồng bộ dữ liệu hóa đơn...</p> : (
                        <table className="host-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Phòng đặt</th>
                                    <th>Thời gian</th>
                                    <th>Tổng tiền</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOrders.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Hiện chưa có vị khách nào đặt phòng.</td></tr>
                                ) : (
                                    myOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>ORD{String(order.id).padStart(3, '0')}</td>
                                            <td><strong>{order.customer_name}</strong></td>
                                            <td>{order.room ? order.room.title : <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Phòng đã bị xóa</span>}</td>
                                            <td>{order.check_in} - {order.check_out}</td>
                                            <td><strong>{Number(order.total_price).toLocaleString()} ₫</strong></td>
                                            <td>
                                                {order.status === 'confirmed' ? (
                                                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Đã xác nhận ✓</span>
                                                ) : (
                                                    <>
                                                        <button className="btn-order-confirm" style={{ marginRight: '8px', background: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px' }} onClick={() => handleConfirmOrder(order.id)}>
                                                            <i className="fa-solid fa-check"></i> Xác nhận
                                                        </button>
                                                        <button className="btn-order-cancel" style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px' }} onClick={() => handleCancelOrder(order.id)}>
                                                            <i className="fa-solid fa-xmark"></i> Hủy đơn
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="host-dashboard-container">
            {/* --- MODAL POPUP THÊM PHÒNG MỚI --- */}
            {showAddRoomModal && (
                <div className="hd-modal-overlay" onClick={() => setShowAddRoomModal(false)}>
                    <div className="hd-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="hd-modal-header">
                            <button className="hd-modal-close" onClick={() => setShowAddRoomModal(false)}>✕</button>
                            <h3>Thêm chỗ ở mới</h3>
                        </div>
                        <div className="hd-modal-body">
                            <div className="form-group">
                                <label>Tên phòng / Nhà</label>
                                <input type="text" placeholder="Ví dụ: Cabin ấm cúng..." className="form-input"
                                    value={newRoom.title} onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Vị trí</label>
                                <input type="text" placeholder="Ví dụ: Quận 1, TP.HCM" className="form-input"
                                    value={newRoom.location} onChange={(e) => setNewRoom({ ...newRoom, location: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Giá tiền / đêm (₫)</label>
                                <input type="number" className="form-input"
                                    value={newRoom.price_per_night} onChange={(e) => setNewRoom({ ...newRoom, price_per_night: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Đường liên kết ảnh</label>
                                <input type="text" className="form-input"
                                    value={newRoom.images} onChange={(e) => setNewRoom({ ...newRoom, images: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Mô tả chỗ ở</label>
                                <textarea className="form-input" style={{ resize: 'vertical', minHeight: '100px' }}
                                    value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}></textarea>
                            </div>
                        </div>
                        <div className="hd-modal-footer">
                            <button className="btn-cancel-room" onClick={() => setShowAddRoomModal(false)}>Hủy</button>
                            <button className="btn-create-room" onClick={handleCreateRoom}>Tạo phòng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CHỈNH SỬA PHÒNG --- */}
            {showEditRoomModal && editingRoom && (
                <div className="hd-modal-overlay" onClick={() => setShowEditRoomModal(false)}>
                    <div className="hd-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="hd-modal-header">
                            <button className="hd-modal-close" onClick={() => setShowEditRoomModal(false)}>✕</button>
                            <h3>Chỉnh sửa: {editingRoom.title}</h3>
                        </div>
                        <div className="hd-modal-body">
                            <div className="form-group">
                                <label>Tên phòng</label>
                                <input type="text" className="form-input" value={editingRoom.title} onChange={(e) => setEditingRoom({ ...editingRoom, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Vị trí</label>
                                <input type="text" className="form-input" value={editingRoom.location} onChange={(e) => setEditingRoom({ ...editingRoom, location: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Giá tiền / đêm (₫)</label>
                                <input type="number" className="form-input" value={editingRoom.price_per_night} onChange={(e) => setEditingRoom({ ...editingRoom, price_per_night: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Link ảnh</label>
                                <input type="text" className="form-input" value={Array.isArray(editingRoom.images) ? editingRoom.images[0] : editingRoom.images} onChange={(e) => setEditingRoom({ ...editingRoom, images: [e.target.value] })} />
                            </div>
                            <div className="form-group">
                                <label>Mô tả chỗ ở</label>
                                <textarea className="form-input" style={{ minHeight: '100px' }} value={editingRoom.description} onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}></textarea>
                            </div>
                        </div>
                        <div className="hd-modal-footer">
                            <button className="btn-cancel-room" onClick={() => setShowEditRoomModal(false)}>Hủy</button>
                            <button className="btn-create-room" onClick={handleUpdateRoom}>Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL THÊM/SỬA KHO ĐỒ THUÊ --- */}
            {showAccessoryModal && (
                <div className="hd-modal-overlay" onClick={() => setShowAccessoryModal(false)}>
                    <div className="hd-modal-content" onClick={e => e.stopPropagation()} style={{ padding: '25px', maxWidth: '500px' }}>
                        <div className="hd-modal-header" style={{ marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>{accForm.id ? 'Sửa sản phẩm thuê' : 'Thêm sản phẩm cho thuê mới'}</h3>
                        </div>
                        <div className="hd-modal-body">
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Tên sản phẩm</label>
                                <input className="form-input" style={{ width: '100%', marginTop: '5px' }} value={accForm.name} onChange={e => setAccForm({ ...accForm, name: e.target.value })} placeholder="VD: Lều 4 người" />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Giá thuê (VNĐ/ngày)</label>
                                <input className="form-input" type="number" style={{ width: '100%', marginTop: '5px' }} value={accForm.price_per_day} onChange={e => setAccForm({ ...accForm, price_per_day: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Tiền cọc yêu cầu (VNĐ)</label>
                                <input className="form-input" type="number" style={{ width: '100%', marginTop: '5px' }} value={accForm.deposit_amount} onChange={e => setAccForm({ ...accForm, deposit_amount: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Số lượng tồn kho</label>
                                <input className="form-input" type="number" style={{ width: '100%', marginTop: '5px' }} value={accForm.stock_quantity} onChange={e => setAccForm({ ...accForm, stock_quantity: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Link Hình Ảnh</label>
                                <input className="form-input" type="text" style={{ width: '100%', marginTop: '5px' }} value={accForm.image} onChange={e => setAccForm({ ...accForm, image: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Khu vực (Location)</label>
                                <select
                                    className="form-input"
                                    style={{ width: '100%', marginTop: '5px', padding: '10px' }}
                                    value={accForm.location}
                                    onChange={e => setAccForm({ ...accForm, location: e.target.value })}
                                >
                                    <option value="">Chọn khu vực...</option>
                                    <option value="Đà Lạt">Đà Lạt</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Nha Trang">Nha Trang</option>
                                    <option value="Vũng Tàu">Vũng Tàu</option>
                                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                </select>
                            </div>
                        </div>
                        <div className="hd-modal-footer" style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn-cancel-room" onClick={() => setShowAccessoryModal(false)}>Hủy</button>
                            <button className="btn-create-room" onClick={handleSaveAccessory}>Lưu thông tin</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR BÊN TRÁI */}
            <div className="host-sidebar">
                <div className="host-sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <i className="fa-solid fa-umbrella-beach"></i> SeaBreeze Host
                </div>
                <ul className="host-menu">
                    <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <i className="fa-solid fa-chart-pie"></i> Tổng quan
                    </li>
                    <li className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>
                        <i className="fa-solid fa-house-user"></i> Phòng của tôi
                    </li>
                    <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        <i className="fa-solid fa-clipboard-list"></i> Đơn đặt phòng
                    </li>
                    <li className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
                        <i className="fa-solid fa-star"></i> Quản lý Đánh giá
                    </li>
                    <li className={activeTab === 'accessories' ? 'active' : ''} onClick={() => setActiveTab('accessories')}>
                        <i className="fa-solid fa-box-open"></i> Kho đồ cho thuê
                    </li>
                    <li style={{ marginTop: 'auto', borderTop: '1px solid #eee' }} onClick={() => navigate('/')}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Về trang Khách
                    </li>
                </ul>
            </div>

            {/* NỘI DUNG BÊN PHẢI */}
            <div className="host-main-content">
                <div className="host-header">
                    <h1>
                        {activeTab === 'overview' && `Chào mừng trở lại, ${currentUser?.name || currentUser?.hoTen || 'Chủ nhà'}!`}
                        {activeTab === 'rooms' && 'Quản lý phòng'}
                        {activeTab === 'orders' && 'Quản lý đơn đặt phòng'}
                        {activeTab === 'reviews' && 'Quản lý đánh giá từ khách'}
                        {activeTab === 'accessories' && 'Quản lý kho đồ cho thuê'}
                    </h1>
                    <div className="host-header-actions">
                        <button className="btn-icon" style={{ border: 'none', background: 'white' }}><i className="fa-regular fa-bell"></i></button>
                        <div className="host-user-profile">
                            <img src={currentUser?.avatar || "https://placehold.co/40"} alt="Avatar" style={{ borderRadius: '50%', width: '40px', height: '40px' }} />
                            <span>{currentUser?.name || currentUser?.hoTen || 'Chủ nhà'}</span>
                        </div>
                    </div>
                </div>

                {renderContent()}

                
            </div>
        </div>
    );
}