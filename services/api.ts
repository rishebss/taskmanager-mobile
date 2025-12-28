// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API URLs for different environments
const API_URLS = {
  development: 'http://10.0.2.2:3000/api', // Android emulator
  staging: 'https://your-staging-backend.vercel.app/api',
  production: 'https://your-production-backend.vercel.app/api',
};

// Determine environment
const getEnvironment = () => {
  if (__DEV__) return 'development';
  // You can also check release channel or build type
  return 'production';
};

const ENV = getEnvironment();
const API_URL = API_URLS[ENV] || API_URLS.production;

console.log(`API Environment: ${ENV}, URL: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    
    // Log only in development
    if (__DEV__) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
      });
    }
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default api;