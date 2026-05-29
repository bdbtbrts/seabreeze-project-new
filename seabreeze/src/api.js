// file api.js
import axios from 'axios';

// M thử console.log ra xem nó là cái gì khi chạy trên Vercel
console.log("URL từ môi trường:", import.meta.env.VITE_API_URL);

const api = axios.create({
  // Xóa bỏ cái phần '|| localhost' đi để xem nó có lấy được biến không
  // Hoặc viết rõ ràng như này để bắt nó dùng biến VITE_API_URL
  baseURL: import.meta.env.VITE_API_URL || 'https://seabreeze-backend-wkqw.onrender.com',
});

export default api;