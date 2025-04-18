import { Router } from 'express';
import { register, login, getProfile, updateProfile, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 获取用户个人信息 - 需要身份验证
router.get('/profile', authenticate, getProfile);

// 更新用户个人信息 - 需要身份验证
router.put('/profile', authenticate, updateProfile);

// 用户登出
router.post('/logout', authenticate, logout);

export default router; 