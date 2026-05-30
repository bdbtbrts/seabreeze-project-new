import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import api from '../api'; 

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('rooms');
    const [loading, setLoading] = useState(false);

    // --- STATES ---
    const [allRooms, setAllRooms] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [allRentals, setAllRentals] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [allPromotions, setAllPromotions] = useState([]);
    const [newPromo, setNewPromo] = useState({ code: '', discount_percent: '', applicable_type: 'all' });

    // State lưu trạng thái bộ lọc Đơn hàng
    const [orderFilter, setOrderFilter] = useState('Tất cả');

    // Hàm lấy token gộp chung cho tiện
    const getToken = () => localStorage.getItem('token');
    
    // Cấu hình header chung cho các lệnh gọi API (Xóa, Sửa, Thêm)
    const getAuthHeader = () => ({
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
        }
    });

    const fetchDashboardStats = () => {
        setLoading(true);
        api.get('/api/admin/dashboard-stats', getAuthHeader()) 
            .then(res => { setDashboardStats(res.data); setLoading(false); })
            .catch(err => { console.error("Lỗi lấy thống kê:", err); setLoading(false); });
    };

    // --- CÁC HÀM FETCH DỮ LIỆU ---
    const fetchAllRooms = () => {
        setLoading(true);
        api.get('/api/rooms', getAuthHeader()) 
            .then(res => { setAllRooms(res.data.data || []); setLoading(false); })
            .catch(err => { console.error("Lỗi lấy dữ liệu phòng:", err); setLoading(false); });
    };

    const fetchAllOrders = () => {
        setLoading(true);
        api.get('/api/orders', getAuthHeader()) 
            .then(res => { setAllOrders(res.data.data || []); setLoading(false); })
            .catch(err => { console.error("Lỗi lấy dữ liệu đơn hàng:", err); setLoading(false); });
    };

    const fetchAllRentals = () => {
        setLoading(true);
        api.get('/api/admin/rentals', getAuthHeader()) 
            .then(res => { setAllRentals(res.data.data || []); setLoading(false); })
            .catch(err => { console.error("Lỗi lấy danh sách đơn thuê:", err); setLoading(false); });
    };

    const fetchAllUsers = () => {
        setLoading(true);
        api.get('/api/admin/users', getAuthHeader()) 
            .then(res => { setAllUsers(res.data); setLoading(false); })
            .catch(err => { console.error("Lỗi lấy user:", err); setLoading(false); });
    };

    const fetchAllPromotions = () => {
        setLoading(true);
        api.get('/api/admin/promotions', getAuthHeader()) 
            .then(res => { setAllPromotions(res.data); setLoading(false); })
            .catch(err => { console.error("Lỗi tải khuyến mãi:", err); setLoading(false); });
    };

    // --- USEEFFECT: CHẠY HÀM TƯƠNG ỨNG KHI ĐỔI TAB ---
    useEffect(() => {
        if (activeTab === 'rooms') fetchAllRooms();
        else if (activeTab === 'orders') fetchAllOrders();
        else if (activeTab === 'rentals') fetchAllRentals();
        else if (activeTab === 'dashboard') fetchDashboardStats();
        else if (activeTab === 'users') fetchAllUsers();
        else if (activeTab === 'promotions') fetchAllPromotions();
    }, [activeTab]); 

    // --- CÁC HÀM THAO TÁC ADMIN (ĐÃ GẮN TOKEN ĐẦY ĐỦ) ---
    const handleApproveRoom = (id) => {
        api.put(`/api/admin/rooms/${id}/approve`, {}, getAuthHeader())
            .then(res => { alert("Đã duyệt phòng thành công!"); fetchAllRooms(); })
            .catch(err => alert("Lỗi khi duyệt phòng: " + err.message));
    };

    const handleRejectRoom = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa phòng này khỏi hệ thống?")) {
            api.delete(`/api/rooms/${id}`, getAuthHeader())
            .then(res => { 
                alert("Đã xóa phòng."); 
                fetchAllRooms(); 
            })
            .catch(err => {
                console.error(err);
                alert("Lỗi khi xóa phòng!");
            });
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) return;

        try {
            await api.delete(`/api/rooms/${roomId}`, getAuthHeader());
            alert("🎉 Đã xóa phòng thành công!");
            fetchAllRooms();
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            alert("⚠️ Không thể xóa!");
        }
    };
    
    const handleDeleteOrder = (orderId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy/xóa đơn đặt phòng này?")) return;
        
        api.delete(`/api/orders/${orderId}`, getAuthHeader())
            .then(res => {
                alert("Đã hủy đơn phòng thành công!");
                fetchAllOrders();
            })
            .catch(err => {
                console.error(err);
                alert("Lỗi không thể hủy đơn!");
            })
    }

    const handleUpdateRental = (id, newStatus) => {
        let note = "";
        if (newStatus === "Hư hỏng") {
            note = window.prompt("Nhập ghi chú hư hỏng và số tiền trừ cọc (nếu có):");
            if (note === null) return;
        }
        api.put(`/api/admin/rentals/${id}/status`, { status: newStatus, admin_note: note }, getAuthHeader())
            .then(res => { alert("Đã cập nhật trạng thái đơn thuê thành công!"); fetchAllRentals(); })
            .catch(err => alert("Lỗi khi cập nhật đơn thuê: " + err.message));
    };

    // 👇 HÀM XÓA ĐƠN THUÊ MỚI THÊM 👇
    const handleDeleteRental = async (id) => {
        if (window.confirm("Mày có chắc chắn muốn HỦY/XÓA đơn thuê này khỏi hệ thống không?")) {
            try {
                await api.delete(`/api/admin/rentals/${id}`, getAuthHeader());
                alert("Đã tiễn ẻm lên đường thành công!");
                fetchAllRentals(); // Reload lại bảng ngay lập tức
            } catch (error) {
                console.error("Lỗi khi xóa đơn thuê:", error);
                alert("Xóa thất bại, check log đi m!");
            }
        }
    };

    const handleAddPromotion = (e) => {
        e.preventDefault();
        api.post('/api/admin/promotions', newPromo, getAuthHeader())
            .then(() => {
                alert("Tạo mã thành công!");
                setNewPromo({ code: '', discount_percent: '', applicable_type: 'all' });
                fetchAllPromotions();
            }).catch(err => alert("Lỗi hoặc mã đã tồn tại!"));
    };

    const handleDeletePromotion = (id) => {
        if (window.confirm("Chắc chắn muốn xóa mã này?")) {
            api.delete(`/api/admin/promotions/${id}`, getAuthHeader())
                 .then(fetchAllPromotions)
                 .catch(err => alert("Lỗi xóa mã!"));
        }
    };

    const handleToggleUserStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động';
        api.put(`/api/admin/users/${id}/status`, { status: newStatus }, getAuthHeader())
            .then(() => fetchAllUsers())
            .catch(err => alert("Lỗi cập nhật trạng thái User!"));
    }

    // --- RENDER GIAO DIỆN CÁC TAB ---
    const renderContent = () => {
        if (activeTab === 'promotions') return (
            <div className="admin-panel">
                <h2>Quản lý Mã Giảm Giá</h2>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <form onSubmit={handleAddPromotion} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                        <div>
                            <label>Mã Code (VD: TET2026)</label>
                            <input className="form-input" value={newPromo.code} onChange={e => setNewPromo({ ...newPromo, code: e.target.value })} required style={{ marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Giảm giá (%)</label>
                            <input type="number" className="form-input" value={newPromo.discount_percent} onChange={e => setNewPromo({ ...newPromo, discount_percent: e.target.value })} required min="1" max="100" style={{ marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Áp dụng cho</label>
                            <select className="form-input" value={newPromo.applicable_type} onChange={e => setNewPromo({ ...newPromo, applicable_type: e.target.value })} style={{ marginTop: '5px' }}>
                                <option value="all">Toàn bộ Đơn hàng</option>
                                <option value="homestay">Chỉ Homestay</option>
                                <option value="product">Chỉ Thuê đồ</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary" style={{ padding: '10px 20px', height: 'fit-content' }}>Tạo mã</button>
                    </form>
                </div>
                <table className="admin-table">
                    <thead><tr><th>ID</th><th>Mã CODE</th><th>Mức giảm</th><th>Phạm vi áp dụng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        {allPromotions.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td><strong>{p.code}</strong></td>
                                <td><span className="badge badge-success">-{p.discount_percent}%</span></td>
                                <td>{p.applicable_type === 'all' ? 'Tất cả' : (p.applicable_type === 'homestay' ? 'Homestay' : 'Thuê phụ kiện')}</td>
                                <td>{p.status}</td>
                                <td><button className="btn-reject" onClick={() => handleDeletePromotion(p.id)}>Xóa</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        if (activeTab === 'users') return (
            <div className="admin-panel">
                <h2>Quản lý người dùng</h2>
                <table className="admin-table">
                    <thead><tr><th>ID</th><th>Tên</th><th>Email</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        {allUsers.map(u => (
                            <tr key={u.id}>
                                <td>#{u.id}</td><td>{u.name}</td><td>{u.email}</td>
                                <td>{u.status}</td>
                                <td>
                                    {u.status === 'Hoạt động' ? (
                                        <button className="btn-reject" onClick={() => handleToggleUserStatus(u.id, u.status)}>Khóa</button>
                                    ) : (
                                        <button className="btn-approve" onClick={() => handleToggleUserStatus(u.id, u.status)}>Mở</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        if (activeTab === 'dashboard') {
            return (
                <div className="admin-panel">
                    <h2 style={{ marginBottom: '25px' }}>Thống kê Tình hình Kinh doanh</h2>
                    {loading || !dashboardStats ? <p>Đang tổng hợp số liệu từ hệ thống...</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '5px solid #16a34a' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Doanh Thu Homestay</h3>
                                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
                                    {Number(dashboardStats.homestayRevenue).toLocaleString()} ₫
                                </p>
                            </div>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '5px solid #3b82f6' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Tổng Đơn Đặt Phòng</h3>
                                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
                                    {dashboardStats.totalOrders} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>đơn</span>
                                </p>
                            </div>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '5px solid #f59e0b' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Tổng Đơn Thuê Đồ</h3>
                                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
                                    {dashboardStats.totalRentals} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>đơn</span>
                                </p>
                            </div>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '5px solid #8b5cf6' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Kho Phòng Lưu Trú</h3>
                                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
                                    {dashboardStats.totalRooms} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>phòng</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (activeTab === 'rooms') {
            return (
                <div className="admin-panel">
                    <h2>Quản lý & kiểm duyệt homestay</h2>
                    {loading ? <p>Đang tải dữ liệu...</p> : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên phòng</th>
                                    <th>Chủ nhà (Host)</th>
                                    <th>Giá/Đêm</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác Kiểm duyệt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allRooms.map(room => (
                                    <tr key={room.id}>
                                        <td>#{room.id}</td>
                                        <td><strong>{room.title}</strong><br /><small>{room.location}</small></td>
                                        <td>{room.host?.name || room.host?.hoTen || 'Chủ nhà (Chưa cập nhật)'}</td>
                                        <td>{Number(room.price_per_night).toLocaleString()} ₫</td>
                                        <td>
                                            {room.status === 'approved' ? (
                                                <span className="badge badge-success">Đã duyệt</span>
                                            ) : (
                                                <span className="badge badge-warning">Chờ duyệt</span>
                                            )}
                                        </td>
                                        <td>
                                            {room.status !== 'approved' && (
                                                <button className="btn-approve" onClick={() => handleApproveRoom(room.id)}>
                                                    <i className="fa-solid fa-check"></i> Duyệt
                                                </button>
                                            )}
                                            <button className="btn-reject" onClick={() => handleRejectRoom(room.id)}>
                                                <i className="fa-solid fa-trash"></i> {room.status === 'approved' ? 'Xóa' : 'Từ chối'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            );
        }

        if (activeTab === 'orders') {
            const filteredOrders = allOrders.filter(order => {
                if (orderFilter === 'Tất cả') return true;
                if (orderFilter === 'Đang chờ') return order.status !== 'confirmed';
                if (orderFilter === 'Đã xác nhận') return order.status === 'confirmed';
                return true;
            });

            return (
                <div className="admin-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>Quản lý đơn đặt phòng (Toàn hệ thống)</h2>
                        <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '6px', borderRadius: '10px' }}>
                            <button 
                                onClick={() => setOrderFilter('Tất cả')}
                                style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', background: orderFilter === 'Tất cả' ? '#fff' : 'transparent', color: orderFilter === 'Tất cả' ? '#e51d53' : '#64748b', boxShadow: orderFilter === 'Tất cả' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                            >Tất cả</button>
                            <button 
                                onClick={() => setOrderFilter('Đang chờ')}
                                style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', background: orderFilter === 'Đang chờ' ? '#fff' : 'transparent', color: orderFilter === 'Đang chờ' ? '#f59e0b' : '#64748b', boxShadow: orderFilter === 'Đang chờ' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                            >Đang chờ</button>
                            <button 
                                onClick={() => setOrderFilter('Đã xác nhận')}
                                style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', background: orderFilter === 'Đã xác nhận' ? '#fff' : 'transparent', color: orderFilter === 'Đã xác nhận' ? '#16a34a' : '#64748b', boxShadow: orderFilter === 'Đã xác nhận' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                            >Đã xác nhận</button>
                        </div>
                    </div>

                    {loading ? <p>Đang đồng bộ dữ liệu từ máy chủ...</p> : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Phòng đặt</th>
                                    <th>Thời gian (In - Out)</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Không có đơn hàng nào khớp với bộ lọc hiện tại.</td></tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order.id}>
                                            <td><strong>ORD{String(order.id).padStart(3, '0')}</strong></td>
                                            <td>{order.customer_name}</td>
                                            <td>{order.room ? order.room.title : <span style={{ color: '#dc2626' }}>Phòng đã xóa</span>}</td>
                                            <td><small>{order.check_in}<br />{order.check_out}</small></td>
                                            <td><strong>{Number(order.total_price).toLocaleString()} ₫</strong></td>
                                            <td>
                                                {order.status === 'confirmed' ? (
                                                    <span className="badge badge-success">Đã xác nhận</span>
                                                ) : (
                                                    <span className="badge badge-warning">Chờ xử lý</span>
                                                )}
                                            </td>
                                            <td>
                                                <button className="btn-reject" onClick={() => handleDeleteOrder(order.id)}>
                                                    <i className="fa-solid fa-trash"></i> Hủy/Xóa
                                                </button>
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

        if (activeTab === 'rentals') {
            return (
                <div className="admin-panel">
                    <h2>Quản lý đơn thuê sản phẩm & tiền cọc</h2>
                    {loading ? <p>Đang tải dữ liệu đơn thuê...</p> : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Mã Đơn</th>
                                    <th>Khách Thuê (Email)</th>
                                    <th>Sản Phẩm</th>
                                    <th>SL</th>
                                    <th>Tiền Cọc</th>
                                    <th>Trạng Thái</th>
                                    <th>Ghi Chú</th>
                                    <th>Thao Tác Admin</th>
                                    <th>Thao Tác Cứng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allRentals.length === 0 ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center' }}>Chưa có đơn thuê nào trong hệ thống.</td></tr>
                                ) : (
                                    allRentals.map(item => (
                                        <tr key={item.id}>
                                            <td><strong>RT{String(item.id).padStart(3, '0')}</strong></td>
                                            <td>{item.customer_email}</td>
                                            <td>{item.product_name}</td>
                                            <td>{item.quantity}</td>
                                            <td><strong>{Number(item.refund_amount).toLocaleString()} ₫</strong></td>
                                            <td>
                                                <span className={`badge ${item.status === 'Đã trả' ? 'badge-success' : item.status === 'Hư hỏng' ? 'badge-danger' : item.status === 'Thành công' ? 'badge-success' : 'badge-warning'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td><small>{item.admin_note || '-'}</small></td>
                                            <td>
                                                {item.status === 'Đang mượn' && (
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button className="btn-approve" onClick={() => handleUpdateRental(item.id, 'Đã trả')}>Nhận lại</button>
                                                        <button className="btn-reject" onClick={() => handleUpdateRental(item.id, 'Hư hỏng')}>Báo lỗi</button>
                                                    </div>
                                                )}
                                            </td>
                                            {/* 👇 Gắn cái nút Xóa thần thánh vào đây 👇 */}
                                            <td>
                                                <button 
                                                    className="btn-reject" 
                                                    style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                    onClick={() => handleDeleteRental(item.id)}
                                                >
                                                    <i className="fa-solid fa-trash"></i> Hủy/Xóa
                                                </button>
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

        return <div>Tính năng {activeTab} đang được phát triển...</div>;
    };

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <div className="admin-logo">
                    <i className="fa-solid fa-user-shield"></i> Cổng Admin
                </div>
                <ul className="admin-menu">
                    <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <i className="fa-solid fa-chart-line"></i> Thống kê kinh doanh
                    </li>
                    <li className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>
                        <i className="fa-solid fa-house-chimney"></i> Quản lý Homestay
                    </li>
                    <li className={activeTab === 'rentals' ? 'active' : ''} onClick={() => setActiveTab('rentals')}>
                        <i className="fa-solid fa-clipboard-check"></i> Xử lý đơn thuê & cọc
                    </li>
                    <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        <i className="fa-solid fa-cart-flatbed"></i> Quản lý đơn phòng
                    </li>
                    <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <i className="fa-solid fa-users"></i> Quản lý người dùng
                    </li>
                    <li className={activeTab === 'promotions' ? 'active' : ''} onClick={() => setActiveTab('promotions')}>
                        <i className="fa-solid fa-tags"></i> Quản lý Khuyến mãi
                    </li>
                    <li style={{ marginTop: 'auto' }} onClick={() => navigate('/')}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Về trang Khách
                    </li>
                </ul>
            </div>

            <div className="admin-main">
                <div className="admin-header">
                    <h1>Hệ thống quản trị web - SeaBreeze</h1>
                </div>
                <div className="admin-content-wrapper">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}