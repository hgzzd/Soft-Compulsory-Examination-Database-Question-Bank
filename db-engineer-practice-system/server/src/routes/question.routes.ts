import { Router } from 'express';
import { getQuestions, getQuestionById } from '../controllers/question.controller';

const router = Router();

// 获取题目列表，支持分页和筛选
router.get('/', getQuestions);

// 获取题目详情
router.get('/:id', getQuestionById);

export default router; 