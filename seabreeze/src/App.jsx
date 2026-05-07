import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Context chứa logic giỏ hàng
import { CartProvider } from './context/CartContext';

// Import Components & Pages
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart'; 
import CheckoutHomestay from './pages/CheckoutHomestay.jsx'; // <--- LỖI LÀ Ở ĐÂY: BẠN THIẾU DÒNG NÀY

// Import CSS
import './index.css';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} /> 
            <Route path="/checkout-homestay" element={<CheckoutHomestay />} /> 
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;