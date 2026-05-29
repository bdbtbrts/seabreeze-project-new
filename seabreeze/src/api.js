import axios from 'axios';

// Tạo một instance của axios với cấu hình sẵn
const api = axios.create({
  baseURL: 'https://seabreeze-backend-wkqw.onrender.com/api', // Nhớ kiểm tra kỹ có cần '/api' hay không
  headers: {
    'Content-Type': 'appligit cation/json',
  },
  
});

// Xuất ra để các file khác sử dụng
export default api;