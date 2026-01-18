import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import API_BASE_URL from '@/config/api';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available (use localStorage for API calls - shared across tabs)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Không set Content-Type cho FormData, để browser tự set với boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const responseData = error.response.data as any;
      
      // Extract error message - prioritize message field, then error field
      let message = responseData?.message || responseData?.error || error.message;
      
      // If validation error, try to extract details
      if (status === 400 && responseData?.errorCode === 'VALIDATION_ERROR') {
        if (responseData?.message) {
          message = responseData.message;
        } else if (responseData?.details && Array.isArray(responseData.details) && responseData.details.length > 0) {
          const firstError = responseData.details[0];
          const fieldPath = firstError.path?.join('.') || 'unknown';
          message = `Lỗi validation: ${fieldPath} - ${firstError.message || 'Giá trị không hợp lệ'}`;
        }
      }
      
      // Don't log 404 errors as they're often expected
      if (status !== 404) {
        console.error(`API Error [${status}]:`, message);
        if (responseData?.details) {
          console.error('Error details:', responseData.details);
        }
      }
      
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response (network error, timeout, etc.)
      // Only log if it's not a timeout (timeouts are expected)
      if (error.code !== 'ECONNABORTED') {
        console.error('Network Error:', error.message);
      }
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'));
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig) => {
    return (axiosInstance.get<T>(url, config) as unknown) as Promise<T>;
  },
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return (axiosInstance.post<T>(url, data, config) as unknown) as Promise<T>;
  },
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return (axiosInstance.put<T>(url, data, config) as unknown) as Promise<T>;
  },
  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return (axiosInstance.patch<T>(url, data, config) as unknown) as Promise<T>;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig) => {
    return (axiosInstance.delete<T>(url, config) as unknown) as Promise<T>;
  },
};

export default apiClient;

