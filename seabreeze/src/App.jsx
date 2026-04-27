import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import './index.css'; // Gọi CSS cũ của bạn vào đây

function App() {
  return (
    <BrowserRouter>
      {/* Cái Header nằm ngoài Routes nên trang nào nó cũng hiện ra */}
      <Header />
      
      {/* Routes là cái hành lang chứa các căn phòng */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;