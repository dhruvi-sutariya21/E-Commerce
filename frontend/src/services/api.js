import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Base API setup using Vite proxy
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// List of public endpoints that MUST NOT send an Authorization header
const PUBLIC_ENDPOINTS = [
  '/user_login',
  '/user_register',
  '/admin_register',
  '/forgot_password',
  '/otp_generate',
  '/otp_verify',
  '/reset_password',
  '/all_products',
  '/all_category',
];

// Request Interceptor: Attach JWT Token automatically from localStorage ONLY for authenticated routes
api.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => config.url?.endsWith(endpoint));
    
    if (isPublic) {
      delete config.headers?.Authorization;
      if (config.headers) {
        delete config.headers.Authorization;
      }
    } else {
      const token = localStorage.getItem('aura_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Detailed Debug Logging (Requirement 10)
    console.log(`[API Request Debug] ${config.method?.toUpperCase()} ${config.url}`, {
      apiUrl: `${config.baseURL || ''}${config.url || ''}`,
      headers: { ...config.headers },
      payload: config.data,
      hasAuthorizationHeader: Boolean(config.headers?.Authorization || config.headers?.authorization)
    });

    return config;
  },
  (error) => {
    console.error('[API Request Error Debug]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Extract clean error message from backend FastAPI detail/message
api.interceptors.response.use(
  (response) => {
    // Detailed Success Debug Logging
    console.log(`[API Response Success Debug] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      apiUrl: `${response.config.baseURL || ''}${response.config.url || ''}`,
      status: response.status,
      body: response.data,
    });
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.response) {
      const detail = error.response.data?.detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = detail.map((err) => err.msg || err.detail || (typeof err === 'object' ? JSON.stringify(err) : String(err))).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        errorMessage = detail.msg || JSON.stringify(detail);
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to server. Please check your backend status.';
    }

    // Detailed Error Debug Logging
    console.log(`[API Response Error Debug] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      apiUrl: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
      status: error.response?.status,
      body: error.response?.data,
      errorMessage: errorMessage,
    });

    error.formattedMessage = errorMessage;
    return Promise.reject(error);
  }
);

// Helper function for building backend static upload image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const normalized = imagePath.replace(/\\/g, '/');
  return `/${normalized.startsWith('/') ? normalized.slice(1) : normalized}`;
};

export default api;

