import axios from 'axios';

const api = axios.create({
  // Lấy từ biến môi trường, nếu không có thì mặc định về localhost cho m test local
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json', 
  },
});

export default api;