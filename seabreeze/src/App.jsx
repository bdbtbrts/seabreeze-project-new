import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Context
import { CartProvider } from './context/CartContext';

// Import Components & Pages
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart'; 
import CheckoutHomestay from './pages/CheckoutHomestay.jsx';
import Register from './pages/Register/Register.jsx';
import Profile from './pages/Profile.jsx';
import History from './pages/History.jsx';
import HomestayDetail from './pages/HomestayDetail'; 
import HostProfile from './pages/HostProfile'; 
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RegisterHost from './pages/RegisterHost';
import HostLogin from './pages/HostLogin';

// Import ProtectedRoute (Bức tường lửa bảo vệ)
import ProtectedRoute from './components/ProtectedRoute'; 

// Import CSS
import './index.css';
import './App.css';

function App() {
  // Danh sách các role hợp lệ để truy cập các tính năng cơ bản của thành viên
  const memberRoles = ['Khách hàng', 'Chủ nhà', 'Admin'];

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="App">
          <Header />
          
          <Routes>
            {/* =========================================
                1. CÁC ROUTE CÔNG CỘNG  
                ========================================= */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/homestay/:id" element={<HomestayDetail />} />
            <Route path="/host/:hostId" element={<HostProfile />} />
            <Route path="/register-host" element={<RegisterHost />} />
            {/* =========================================
                2. CÁC ROUTE CẦN ĐĂNG NHẬP
                ========================================= */}
            <Route path="/cart" element={
              <ProtectedRoute allowedRoles={memberRoles}>
                <Cart />
              </ProtectedRoute>
            } /> 
            
            <Route path="/checkout-homestay" element={
              <ProtectedRoute allowedRoles={memberRoles}>
                <CheckoutHomestay />
              </ProtectedRoute>
            } /> 
            
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={memberRoles}>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute allowedRoles={memberRoles}>
                <History />
              </ProtectedRoute>
            } />
            
           

            {/* =========================================
                3. ROUTE QUẢN LÝ CHO CHỦ NHÀ
                ========================================= */}
            <Route path="/host-dashboard" element={
              <ProtectedRoute allowedRoles={['Chủ nhà', 'Admin']}>
                <HostDashboard />
              </ProtectedRoute>
            } />
            <Route path="/login-host" element={<HostLogin />} />

            {/* =========================================
                4. ROUTE QUẢN TRỊ TỐI CAO CHO ADMIN
                ========================================= */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;