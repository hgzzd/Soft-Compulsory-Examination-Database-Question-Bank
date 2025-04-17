import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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
      // TODO: API endpoint for login
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock successful login
      token.value = 'mock-token-' + Math.random().toString(36).substring(2);
      localStorage.setItem('token', token.value);
      
      // Fetch user profile
      await fetchUserProfile();
      
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
      // TODO: API endpoint for registration
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      return true;
    } catch (err: any) {
      error.value = err.message || 'Registration failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function logout() {
    // TODO: API endpoint for logout
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }
  
  async function fetchUserProfile() {
    if (!token.value) return;
    
    isLoading.value = true;
    
    try {
      // TODO: API endpoint for user profile
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock user data
      user.value = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        avatar: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        stats: {
          totalQuestions: 120,
          correctAnswers: 85,
          accuracyRate: 0.71
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
      // TODO: API endpoint for profile update
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local user data
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
      // TODO: API endpoint for avatar upload
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock avatar URL
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