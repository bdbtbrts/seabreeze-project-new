import axios from 'axios';

// Dùng trực tiếp link để kiểm tra xem nó có còn trỏ về localhost không
const renderUrl = 'https://seabreeze-backend-wkqw.onrender.com';
const apiUrl = import.meta.env.VITE_PROD_URL || renderUrl;

console.log("DEBUG - URL đang sử dụng:", apiUrl);

const api = axios.create({
  baseURL: apiUrl,
});

export default api;