import { Router } from 'express';
import { createPractice, updatePractice, getPracticeHistory, getPracticeById } from '../controllers/practice.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要身份验证
router.use(authenticate);

// 创建新的练习记录
router.post('/', createPractice);

// 更新练习记录
router.put('/:id', updatePractice);

// 获取用户练习历史
router.get('/history', getPracticeHistory);

// 获取特定练习详情
router.get('/:id', getPracticeById);

export default router; 