function App() {
  const memberRoles = ['Khách hàng', 'Chủ nhà', 'Admin'];

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="App">
          <Header />
          
          <Routes>
            {/* 1. CÁC ROUTE CÔNG CỘNG */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/homestay/:id" element={<HomestayDetail />} />
            <Route path="/host/:hostId" element={<HostProfile />} /> {/* Giữ lại cái này */}
            <Route path="/register-host" element={<RegisterHost />} />
            <Route path="/login-host" element={<HostLogin />} />

            {/* 2. CÁC ROUTE CẦN ĐĂNG NHẬP */}
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
            
            <Route path="/rental-history" element={
              <ProtectedRoute allowedRoles={memberRoles}>
                <RentalHistory />
              </ProtectedRoute>
            } />

            {/* 3. ROUTE CHỦ NHÀ */}
            <Route path="/host-dashboard" element={
              <ProtectedRoute allowedRoles={['Chủ nhà', 'Admin']}>
                <HostDashboard />
              </ProtectedRoute>
            } />

            {/* 4. ROUTE ADMIN */}
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