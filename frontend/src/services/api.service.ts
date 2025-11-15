import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import API_BASE_URL from '../config/api';
import { REQUEST_TIMEOUT, API_ERROR_MESSAGES, HTTP_STATUS } from '../constants/api';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
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
    // Handle standardized API response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // If response has success field, return data field
      return response.data.success ? (response.data.data ?? response.data) : Promise.reject(response.data);
    }
    return response.data;
  },
  (error: AxiosError) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const responseData = error.response.data as any;
      const message = responseData?.error || responseData?.message || error.message;
      const statusCode = error.response.status;
      
      // Map status codes to user-friendly messages
      let userMessage = message;
      if (statusCode === HTTP_STATUS.UNAUTHORIZED) {
        userMessage = API_ERROR_MESSAGES.UNAUTHORIZED;
      } else if (statusCode === HTTP_STATUS.FORBIDDEN) {
        userMessage = API_ERROR_MESSAGES.FORBIDDEN;
      } else if (statusCode === HTTP_STATUS.NOT_FOUND) {
        userMessage = API_ERROR_MESSAGES.NOT_FOUND;
      } else if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        userMessage = API_ERROR_MESSAGES.SERVER_ERROR;
      }
      
      console.error('API Error:', userMessage);
      return Promise.reject(new Error(userMessage));
    } else if (error.request) {
      // Request made but no response (network error or timeout)
      const isTimeout = error.code === 'ECONNABORTED';
      const message = isTimeout ? API_ERROR_MESSAGES.TIMEOUT : API_ERROR_MESSAGES.NETWORK_ERROR;
      console.error('Network Error:', message);
      return Promise.reject(new Error(message));
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(new Error(API_ERROR_MESSAGES.UNKNOWN_ERROR));
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

