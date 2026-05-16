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
// Import các trang và component
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import History from './pages/History/History';
import RentalTracking from './pages/Rental/RentalTracking';
import HomestayDetail from './pages/HomestayDetail'; 

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
import './App.css';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      {/* Header hiện ở mọi trang */}
      <Header />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/tracking" element={<RentalTracking />} />
        
        {/* Trang chi tiết của Hiền */}
        <Route path="/homestay/:id" element={<HomestayDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;