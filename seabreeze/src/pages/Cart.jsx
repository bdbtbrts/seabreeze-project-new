// src/pages/Cart.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + 'đ';

  const rentTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const depositTotal = cartItems.reduce((acc, item) => acc + (item.deposit * item.quantity), 0);

  return (
    <div className="cart-page">
      <h2>Giỏ hàng Đồ thuê & Phụ kiện</h2>
      <div className="cart-container">
        <div className="cart-list">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt="" />
              <div className="info">
                <h4>{item.name}</h4>
                <p>Tiền thuê: {formatVND(item.price)}/ngày</p>
                <p className="deposit-text">Tiền cọc: {formatVND(item.deposit)}</p>
              </div>
              <div className="qty">
                <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
              </div>
              <button className="btn-remove" onClick={() => removeFromCart(item.id)}>Xóa</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="row"><span>Tổng tiền thuê:</span> <span>{formatVND(rentTotal)}</span></div>
          <div className="row deposit"><span>Tổng tiền đặt cọc:</span> <span>{formatVND(depositTotal)}</span></div>
          <hr />
          <div className="row total"><span>Tổng thanh toán:</span> <span>{formatVND(rentTotal + depositTotal)}</span></div>
          <button className="btn-pay">Thanh toán</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;