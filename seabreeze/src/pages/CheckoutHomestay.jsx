// src/pages/CheckoutHomestay.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// MẢNG DỮ LIỆU ĐỘNG: Giả lập API trả về các phụ kiện gợi ý cho khách
const suggestedAccessories = [
  { 
    id: 'acc_1', 
    name: 'Máy ảnh Film Retro', 
    price: 200000, 
    deposit: 500000, 
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200', 
    type: 'accessory' 
  },
  { 
    id: 'acc_2', 
    name: 'Ván chèo SUP', 
    price: 300000, 
    deposit: 1000000, 
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8RDxEftnIFFTlU7fKv8uYHAU0mZiM_N_Wlg&s', 
    type: 'accessory' 
  },
  { 
    id: 'acc_3', 
    name: 'Lều cắm trại 4 người', 
    price: 150000, 
    deposit: 300000, 
    image: 'https://tse4.mm.bing.net/th/id/OIP.WxIFodY7u1jXP3Og0BiJ9AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', 
    type: 'accessory' 
  }
];

const CheckoutHomestay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy dữ liệu phòng từ bên trang Home truyền sang
  const { homestay } = location.state || {}; 
  const { addToCart } = useCart();

  // Nếu không có data phòng (ví dụ khách F5 lại trang), đuổi về trang chủ
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

  // Hàm xử lý khi khách bấm thêm đồ thuê
  const handleAddAccessory = (item) => {
    addToCart(item);
    // Alert động: Lấy đúng tên item.name
    alert(`Đã thêm "${item.name}" vào giỏ hàng đồ thuê!`);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#007bff' }}>Xác nhận đặt phòng</h2>
      
      {/* THÔNG TIN HOMESTAY */}
      <div style={{ display: 'flex', gap: '30px', margin: '30px 0', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
         <img src={homestay.img} alt={homestay.name} style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
         <div style={{ flex: 1 }}>
           <h3>{homestay.name}</h3>
           <p style={{ color: '#64748b', fontSize: '16px' }}><i className="fa-solid fa-location-dot"></i> {homestay.location}</p>
           <hr style={{ border: '0.5px solid #e2e8f0', margin: '15px 0' }} />
           <p style={{ fontSize: '20px' }}>Tổng tiền phòng: <strong style={{ color: '#e11d48' }}>{homestay.price.toLocaleString('vi-VN')} VNĐ</strong></p>
           
           <button style={{ padding: '15px 30px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '20px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
             Thanh toán phòng ngay
           </button>
         </div>
      </div>

      {/* CROSS-SELL: RENDER ĐỘNG TỪ MẢNG */}
      <h3 style={{ marginTop: '50px', color: '#333' }}>Gợi ý phụ kiện cho chuyến đi của bạn</h3>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        {suggestedAccessories.map((item) => (
          <div key={item.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', width: '250px', textAlign: 'center' }}>
            <img src={item.image} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
            <h4 style={{ margin: '10px 0', fontSize: '16px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.name}
            </h4>
            <p style={{ fontSize: '14px', color: '#666' }}>Thuê: {item.price.toLocaleString('vi-VN')}đ/ngày</p>
            <p style={{ fontSize: '12px', color: '#f59e0b' }}>*Cọc: {item.deposit.toLocaleString('vi-VN')}đ</p>
            
            <button
              onClick={() => handleAddAccessory(item)}
              style={{ width: '100%', padding: '10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', marginTop: '10px', cursor: 'pointer', fontWeight: '600' }}
            >
              + Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default CheckoutHomestay;