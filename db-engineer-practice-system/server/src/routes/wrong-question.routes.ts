import { Router } from 'express';
import { getWrongQuestions, getWrongQuestionById, addToWrongQuestions, updateWrongQuestion, removeFromWrongQuestions } from '../controllers/wrong-question.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要身份验证
router.use(authenticate);

// 获取用户错题列表
router.get('/', getWrongQuestions);

// 获取错题详情
router.get('/:id', getWrongQuestionById);

// 添加题目到错题本
router.post('/', addToWrongQuestions);

// 更新错题状态或笔记
router.put('/:id', updateWrongQuestion);

// 从错题本中删除题目
router.delete('/:id', removeFromWrongQuestions);

export default router; 