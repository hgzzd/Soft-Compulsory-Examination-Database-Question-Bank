export interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profile?: UserProfile;
}

export interface UserLoginData {
  username: string;
  password: string;
}

export interface UserRegisterData {
  username: string;
  password: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  avatar?: string;
  password?: string;
  newPassword?: string;
}

export interface UserProfile {
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  interests?: string[];
} 