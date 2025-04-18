import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import userService from '../services/userService';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  lastLogin: string;
  stats: {
    totalQuestions: number;
    correctAnswers: number;
    accuracyRate: number;
  };
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<UserProfile | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userProfile = computed(() => user.value);
  
  // Actions
  async function login(username: string, password: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // 使用 userService 调用真实的登录 API
      const response = await userService.login({
        username,
        password
      });
      
      // 服务层已经处理了将 token 存储到 localStorage 的逻辑
      token.value = localStorage.getItem('token');
      
      // 设置用户信息
      if (response && response.user) {
        // 将 API 返回的用户信息转换为前端需要的格式
        user.value = {
          id: response.user.id.toString(),
          username: response.user.username,
          email: response.user.email,
          avatar: response.user.avatar || null,
          createdAt: response.user.created_at,
          lastLogin: response.user.last_login || new Date().toISOString(),
          stats: {
            totalQuestions: 0,
            correctAnswers: 0,
            accuracyRate: 0
          }
        };
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function register(username: string, password: string, email: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // 使用 userService 调用真实的注册 API
      await userService.register({
        username,
        password,
        email
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Registration failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function logout() {
    try {
      // 调用真实的登出 API
      await userService.logout();
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
    }
  }
  
  async function fetchUserProfile() {
    if (!token.value) return;
    
    isLoading.value = true;
    
    try {
      // 调用真实的获取用户信息 API
      const userInfo = await userService.getUserInfo();
      
      // 转换格式
      user.value = {
        id: userInfo.id.toString(),
        username: userInfo.username,
        email: userInfo.email,
        avatar: userInfo.avatar || null,
        createdAt: userInfo.created_at,
        lastLogin: userInfo.last_login || new Date().toISOString(),
        stats: {
          totalQuestions: 0,
          correctAnswers: 0,
          accuracyRate: 0
        }
      };
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user profile';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateProfile(profileData: Partial<UserProfile>) {
    if (!token.value) return false;
    
    isLoading.value = true;
    
    try {
      // 调用真实的更新用户信息 API
      await userService.updateUserInfo({
        username: profileData.username,
        email: profileData.email
      });
      
      // 更新本地用户数据
      if (user.value) {
        user.value = { ...user.value, ...profileData };
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateAvatar(avatarFile: File) {
    if (!token.value) return false;
    
    isLoading.value = true;
    
    try {
      // TODO: 实现真实的头像上传 API
      // 目前暂时使用本地 URL
      const avatarUrl = URL.createObjectURL(avatarFile);
      
      if (user.value) {
        user.value.avatar = avatarUrl;
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to update avatar';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // 初始化 - 如果有 token 则尝试获取用户信息
  function init() {
    if (token.value) {
      fetchUserProfile();
    }
  }

  // 调用初始化
  init();

  return {
    // State
    token,
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userProfile,
    
    // Actions
    login,
    register,
    logout,
    fetchUserProfile,
    updateProfile,
    updateAvatar
  };
}); 