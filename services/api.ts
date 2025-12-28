// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use localhost for testing
const getApiUrl = () => {
  // Always use localhost for now
  return 'http://localhost:3000/api';
  
  // If testing on physical device, you'll need your computer's IP:
  // return 'http://192.168.1.5:3000/api'; // Replace with your computer's IP
};

const API_URL = getApiUrl();
console.log(`📡 Using API URL: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Add token if exists
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✓ Token attached to request');
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
    });

    // Better error messages
    let errorMessage = 'Network error';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Is your backend running?';
    } else if (!error.response) {
      errorMessage = `Cannot connect to server at ${API_URL}. Make sure:\n\n1. Backend is running (npm start)\n2. Correct port (3000)\n3. No firewall blocking`;
    }
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      originalError: error
    });
  }
);

export default api;