// services/auth.ts - UPDATED TO MATCH BACKEND
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Login user
  async login(email: string, password: string) {
    try {
      console.log('Attempting login with:', { email });
      const response = await api.post('/auth/login', { email, password });
      const responseData = response.data;
      
      // Your backend returns: { success, message, data: { token, user } }
      if (responseData.success && responseData.data) {
        const { token, user } = responseData.data;
        
        // Store token and user data
        if (token) {
          await AsyncStorage.setItem('token', token);
        }
        
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
        
        console.log('Login successful for user:', user?.email || email);
        return { success: true, user, token };
      } else {
        throw new Error(responseData.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        const data = error.response.data;
        errorMessage = data.error || data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw { message: errorMessage, status: error.response?.status };
    }
  },

  // Register user - ALSO FIXED FOR BACKEND RESPONSE
  async register(userData: { email: string; password: string; name?: string }) {
    try {
      const response = await api.post('/auth/register', userData);
      const responseData = response.data;
      
      if (responseData.success) {
        return { 
          success: true, 
          message: responseData.message || 'Registration successful'
        };
      } else {
        throw new Error(responseData.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Register error details:', error.response?.data || error.message);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data) {
        const data = error.response.data;
        errorMessage = data.error || data.message || errorMessage;
      }
      
      throw { message: errorMessage };
    }
  },

  // ... rest of the functions remain the same
  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('Check login error:', error);
      return false;
    }
  },

  async getCurrentUser() {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
};