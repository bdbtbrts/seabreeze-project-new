import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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