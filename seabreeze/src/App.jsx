import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Context chứa logic giỏ hàng (Của bạn)
import { CartProvider } from './context/CartContext';

// Import Components & Pages chung
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';

// Import Pages (Của bạn)
import Cart from './pages/Cart'; 
import CheckoutHomestay from './pages/CheckoutHomestay.jsx';

// Import Pages (Của Thịnh)
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import History from './pages/History/History';
import RentalTracking from './pages/Rental/RentalTracking';

// Import CSS
import './index.css';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="App">
          {/* Header luôn hiện ở mọi trang */}
          <Header />
          
          <Routes>
            {/* Tuyến đường chung */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Các tuyến đường của bạn */}
            <Route path="/cart" element={<Cart />} /> 
            <Route path="/checkout-homestay" element={<CheckoutHomestay />} /> 
            
            {/* Các tuyến đường của Thịnh */}
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/tracking" element={<RentalTracking />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;