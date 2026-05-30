import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';


const CheckoutHomestay = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showQR, setShowQR] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Nhận dữ liệu phòng và lịch đi từ trang chi tiết truyền sang
  const { homestay, bookingDates } = location.state || {};
  const { addToCart } = useCart();

  // --- TRẠNG THÁI DỮ LIỆU ĐỘNG TỪ BACKEND ---
  const [suggestedAccessories, setSuggestedAccessories] = useState([]);
  const [loadingAccessories, setLoadingAccessories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 1. LẤY TÊN USER ĐANG ĐĂNG NHẬP (TỪ LOCALSTORAGE) 🌟
  // Tùy theo lúc m làm chức năng Login m lưu biến là gì, t đang check các trường hợp phổ biến nhất (name, hoTen, userName)
  const loggedInUser = JSON.parse(localStorage.getItem('user')) || {};
  const customerName = loggedInUser.name || loggedInUser.hoTen || localStorage.getItem('userName') || "Khách hàng ẩn danh";

  // 🌟 2. LẤY GIÁ TIỀN THẬT CỦA PHÒNG ĐỂ ĐẨY VÀO QR 🌟
  const amountToPay = homestay ? Number(homestay.price) : 0;

  // Cấu hình tài khoản nhận tiền
  const BANK_ID = "MB";
  const ACCOUNT_NO = "0375951500";
  const ACCOUNT_NAME = "BUI DUONG BAO TU";
  const DESCRIPTION = `Thanh toan SeaBreeze`;
  // Link tự động tạo mã QR từ vietqr.io
  const vietQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amountToPay}&addInfo=${encodeURIComponent(DESCRIPTION)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  // MÓC DỮ LIỆU PHỤ KIỆN THẬT TỪ DATABASE
  
  useEffect(() => {
    if (!homestay || !homestay.location) return; // Bảo vệ an toàn

    setLoadingAccessories(true);

    // 1. Tách chuỗi địa chỉ lấy tên thành phố cuối cùng (VD: Vũng Tàu)
    const parts = homestay.location.split(',');
    const city = parts[parts.length - 1].trim(); 

    // 2. Gọi API lấy phụ kiện, gửi kèm chữ "Vũng Tàu" xuống Backend
    api.get(`/api/accessories?location=${city}`)
      .then(res => {
        // Lấy đúng mảng dữ liệu trả về
        const rawData = res.data.data || res.data || [];
        
        // 🛠️ BƯỚC PHIÊN DỊCH: Đổi tên biến của Backend cho khớp với cái React đang cần
        const formattedData = rawData.map(item => ({
            ...item,
            price: item.price_per_day,    // Gán price_per_day thành biến price
            deposit: item.deposit_amount, // Gán deposit_amount thành biến deposit
            img: item.image               // Ép luôn biến ảnh cho chắc cú
        }));

        // Nạp data đã được phiên dịch vào State
        setSuggestedAccessories(formattedData);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách phụ kiện:", err);
      })
      .finally(() => {
        setLoadingAccessories(false); 
      });

  }, [homestay?.location]);

  if (!homestay) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <h2>Bạn chưa chọn phòng nào cả!</h2>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // 🌟 3. HÀM XỬ LÝ LƯU DATABASE KHI ĐÃ THANH TOÁN XONG 🌟
  // 🌟 HÀM XỬ LÝ LƯU DATABASE KHI BẤM XÁC NHẬN CHUYỂN KHOẢN 🌟
  const handlePaymentSubmit = async () => {
    setIsSubmitting(true);
    setIsProcessing(true); // Đang xử lý

    const token = localStorage.getItem('token'); // Lấy token để xác thực

    try {
      const checkInDate = bookingDates?.checkIn || new Date().toISOString().split('T')[0];
      const checkOutDate = bookingDates?.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];

      // Gửi request lên server
      await api.post('/api/orders', {
        room_id: homestay.id,
        customer_name: customerName,
        check_in: checkInDate,
        check_out: checkOutDate,
        total_price: amountToPay
      }, {
        headers: {
          Authorization: `Bearer ${token}` // Gửi token vào header
        }
      });

      alert("🎉 Đặt phòng thành công! Hóa đơn đã được đồng bộ vào hệ thống Database.");
      navigate('/history'); 

    } catch (error) {
      if (error.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn hoặc chưa đăng nhập. M cần đăng nhập lại!");
        navigate('/login');
      } else {
        console.error("Lỗi khi xử lý đặt phòng:", error);
        alert("Lỗi: " + (error.response?.data?.message || "Không thể gửi dữ liệu lên máy chủ Laravel."));
      }
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
      setShowQR(false);
    }
  };

  const handleAddAccessory = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price), // Lúc này price đã được map đúng từ price_per_day
      deposit: Number(item.deposit || 0),
      image: item.img || item.image,
      type: 'accessory'
    });
    alert(`Đã thêm "${item.name}" vào giỏ hàng đồ thuê!`);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#007bff' }}>Xác nhận đặt phòng</h2>

      {/* THÔNG TIN HOMESTAY THẬT */}
      <div style={{ display: 'flex', gap: '30px', margin: '30px 0', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <img src={homestay.img} alt={homestay.name} style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
        <div style={{ flex: 1 }}>
          <h3>{homestay.name}</h3>
          <p style={{ color: '#64748b', fontSize: '16px' }}><i className="fa-solid fa-location-dot"></i> {homestay.location}</p>
          <p style={{ color: '#007bff', fontSize: '15px', marginTop: '10px' }}><i className="fa-solid fa-user"></i> Người đặt: <strong>{customerName}</strong></p>
          {bookingDates && (
            <p style={{ fontSize: '14px', color: '#475569', marginTop: '10px' }}>
              📅 Lịch đi: <strong>{bookingDates.checkIn}</strong> đến <strong>{bookingDates.checkOut}</strong>
            </p>
          )}
          <hr style={{ border: '0.5px solid #e2e8f0', margin: '15px 0' }} />
          <p style={{ fontSize: '20px' }}>Tổng tiền phòng: <strong style={{ color: '#e11d48' }}>{homestay.price.toLocaleString('vi-VN')} VNĐ</strong></p>
          <button
            style={{
              padding: '15px 30px',
              background: isSubmitting ? '#94a3b8' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              marginTop: '20px',
              fontSize: '16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
            className="btn-checkout"
            onClick={() => setShowQR(true)}
          >
            Thanh toán phòng ngay
          </button>
        </div>
      </div>

      {/* CROSS-SELL: DỮ LIỆU ĐỒ THUÊ THẬT MÓC TỪ DATABASE */}
      <h3 style={{ marginTop: '50px', color: '#333' }}>Gợi ý phụ kiện cho chuyến đi của bạn</h3>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        {loadingAccessories ? (
          <p style={{ color: '#717171' }}>Đang tải danh sách phụ kiện lưu trữ từ database...</p>
        ) : suggestedAccessories.length === 0 ? (
          <p style={{ color: '#717171' }}>Hiện chưa có phụ kiện nào trong database của hệ thống.</p>
        ) : (
          suggestedAccessories.map((item) => (
            <div key={item.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', width: '250px', textAlign: 'center' }}>
              <img src={item.image || item.img} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
              <h4 style={{ margin: '10px 0', fontSize: '16px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.name}
              </h4>
              <p style={{ fontSize: '14px', color: '#666' }}>Thuê: {Number(item.price).toLocaleString('vi-VN')}đ/ngày</p>
              <p style={{ fontSize: '12px', color: '#f59e0b' }}>*Cọc: {Number(item.deposit || 0).toLocaleString('vi-VN')}đ</p>

              <button
                onClick={() => handleAddAccessory(item)}
                style={{ width: '100%', padding: '10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', marginTop: '10px', cursor: 'pointer', fontWeight: '600' }}
              >
                + Thêm vào giỏ
              </button>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL THANH TOÁN VIETQR ================= */}
      {showQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#ff385c', marginBottom: '10px' }}>Thanh toán qua VietQR</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '15px' }}>
              Mở App Ngân hàng bất kỳ để quét mã QR.
            </p>

            {/* Khung chứa mã QR */}
            <div style={{ border: '2px dashed #eee', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block' }}>
              <img src={vietQrUrl} alt="VietQR Payment" style={{ width: '250px', height: '250px', objectFit: 'contain' }} />
            </div>

            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left', fontSize: '14px' }}>
              <div style={{ marginBottom: '8px' }}><strong>Ngân hàng:</strong> MB Bank</div>
              <div style={{ marginBottom: '8px' }}><strong>Chủ tài khoản:</strong> {ACCOUNT_NAME}</div>
              <div style={{ marginBottom: '8px' }}><strong>Số tài khoản:</strong> {ACCOUNT_NO}</div>
              <div><strong>Số tiền:</strong> <span style={{ color: '#ff385c', fontWeight: 'bold', fontSize: '16px' }}>{amountToPay.toLocaleString('vi-VN')} ₫</span></div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowQR(false)}
                style={{ flex: 1, padding: '12px', border: '1px solid #ddd', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Hủy bỏ
              </button>

              <button
                onClick={handlePaymentSubmit} // Gọi trực tiếp hàm đã gộp
                disabled={isProcessing || isSubmitting}
                style={{ flex: 1, padding: '12px', border: 'none', background: (isProcessing || isSubmitting) ? '#ccc' : '#ff385c', color: '#fff', borderRadius: '8px', cursor: (isProcessing || isSubmitting) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {isProcessing ? 'Đang xử lý...' : 'Tôi đã chuyển khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutHomestay;