import React from 'react';
import { Navigate } from 'react-router-dom';

// Component này nhận vào danh sách các role được phép truy cập (allowedRoles)
export default function ProtectedRoute({ allowedRoles, children }) {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    // 1. Chưa đăng nhập -> Đá về trang login
    if (!user) {
        alert("Vui lòng đăng nhập trước!");
        return <Navigate to="/login" replace />;
    }

    // 2. Đã đăng nhập nhưng Role không nằm trong danh sách được phép -> Đá về trang chủ
    if (!allowedRoles.includes(user.role)) {
        alert("⛔ LỖI BẢO MẬT: Bạn không có quyền truy cập đường dẫn này!");
        return <Navigate to="/" replace />;
    }

    // 3. Hợp lệ thì cho phép hiển thị trang con (children)
    return children;
}