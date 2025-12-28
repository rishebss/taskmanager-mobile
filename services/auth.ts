// services/auth.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Login method
  async login(email: string, password: string) {
    console.log(`🔐 Attempting login for: ${email}`);
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log('✅ Login response received:', response.data);
      
      // FIX: Token is inside response.data.data, not response.data
      if (response.data.success && response.data.data?.token) {
        const { token, user } = response.data.data;
        
        // Save token and user data
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Token saved successfully');
        
        return {
          success: true,
          user: user,
          token: token
        };
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: any) {
      console.error('❌ Login service error:', error);
      throw error;
    }
  },

  // Register method
  async register(name: string, email: string, password: string) {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });
      
      console.log('✅ Register response:', response.data);
      
      // FIX: Same issue - token is inside data.data
      if (response.data.success && response.data.data?.token) {
        const { token, user } = response.data.data;
        
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          user: user,
          token: token
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  // Logout method
  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      return !!token && !!user;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Get token
  async getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }
};

export default authService;