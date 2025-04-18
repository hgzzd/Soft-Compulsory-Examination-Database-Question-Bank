import { Router } from 'express';
import { submitAnswer, getAnswerRecords, getAnswerStats } from '../controllers/answer-record.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要身份验证
router.use(authenticate);

// 提交题目答案
router.post('/', submitAnswer);

// 获取用户答题记录
router.get('/', getAnswerRecords);

// 获取用户答题统计数据
router.get('/stats', getAnswerStats);

export default router; 