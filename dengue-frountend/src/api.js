import axios from 'axios';

// --- CHOOSE YOUR BACKEND URL ---

// Option 1: Dynamic (Recommended: Uses localhost for dev, Render for production)
const API_BASE_URL = import.meta.env.PROD 
    ? 'https://dengue-backend-ylql.onrender.com/api' 
    : 'http://localhost:5001/api';

// Option 2: Force Localhost (Uncomment to use)
// const API_BASE_URL = 'http://localhost:5000/api';

// Option 3: Force Production (Uncomment to use)
// const API_BASE_URL = 'https://dengue-backend-ylql.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
