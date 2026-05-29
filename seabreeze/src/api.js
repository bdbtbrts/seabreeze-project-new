// file api.js
import axios from 'axios';

// M thử console.log ra xem nó là cái gì khi chạy trên Vercel
console.log("URL từ môi trường:", import.meta.env.VITE_API_URL);
console.log("DEBUG - VITE_API_URL hiện tại là:", import.meta.env.VITE_API_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_PROD_URL || 'https://seabreeze-backend-wkqw.onrender.com',
});

export default api;