import axios from 'axios';

// Vite automatically sets import.meta.env.DEV to true when you run 'npm run dev'
// and false when you build for production ('npm run build')
const isLocal = import.meta.env.DEV;

// Dynamically assign the URL based on the environment
const API_BASE_URL = isLocal 
    ? 'http://127.0.0.1:8000/api/'          // Local development backend
    : 'https://heavenautos.com.bd/api/';    // Live production backend

// Create a custom instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
    },
});

// Intercept requests to automatically add the JWT token if it exists
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;