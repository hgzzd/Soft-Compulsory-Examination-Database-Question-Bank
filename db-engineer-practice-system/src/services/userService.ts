import axios from 'axios'
import type { UserInfo, UserLoginData, UserRegisterData, LoginResponse, UserUpdateData } from '../types/user'

const API_URL = '/api'

/**
 * User service for handling user-related API requests
 */
export default {
  /**
   * Login user with credentials
   * @param {UserLoginData} credentials - User login credentials
   * @returns {Promise<LoginResponse>} - Login response with token and user info
   */
  async login(credentials: UserLoginData): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {UserRegisterData} userData - User registration data
   * @returns {Promise<{success: boolean, message: string}>} - Registration result
   */
  async register(userData: UserRegisterData): Promise<{success: boolean, message: string}> {
    try {
      console.log('正在发送注册请求到:', `${API_URL}/auth/register`);
      console.log('注册数据:', userData);
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      console.log('注册响应:', response);
      return {
        success: true,
        message: response.data.message || 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Get current user information
   * @returns {Promise<UserInfo>} - User information
   */
  async getUserInfo(): Promise<UserInfo> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  },

  /**
   * Update user information
   * @param {UserUpdateData} userData - User data to update
   * @returns {Promise<UserInfo>} - Updated user information
   */
  async updateUserInfo(userData: UserUpdateData): Promise<UserInfo> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(`${API_URL}/users/me`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Update user info error:', error);
      throw error;
    }
  },

  /**
   * Validate authentication token
   * @returns {Promise<{valid: boolean}>} - Token validation result
   */
  async validateToken(): Promise<{valid: boolean}> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { valid: false };
      }

      const response = await axios.get(`${API_URL}/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { valid: true };
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  },

  /**
   * Logout current user
   * @returns {Promise<{success: boolean}>} - Logout result
   */
  async logout(): Promise<{success: boolean}> {
    try {
      // Remove token from local storage
      localStorage.removeItem('token');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },

  /**
   * Check if user is logged in
   * @returns {boolean} - True if user is logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
} 