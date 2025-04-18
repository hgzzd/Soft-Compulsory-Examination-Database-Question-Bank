import { Router } from 'express';
import authRoutes from './auth.routes';
import questionRoutes from './question.routes';
import examSetRoutes from './exam-set.routes';
import practiceRoutes from './practice.routes';
import answerRecordRoutes from './answer-record.routes';
import wrongQuestionRoutes from './wrong-question.routes';
import favoriteRoutes from './favorite.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// API版本前缀
const API_PREFIX = '/api';

// 用户认证相关路由
router.use(`${API_PREFIX}/auth`, authRoutes);

// 题目相关路由
router.use(`${API_PREFIX}/questions`, questionRoutes);

// 试题集相关路由
router.use(`${API_PREFIX}/exam-sets`, examSetRoutes);

// 练习相关路由
router.use(`${API_PREFIX}/practice`, practiceRoutes);

// 答题记录相关路由
router.use(`${API_PREFIX}/answer-records`, answerRecordRoutes);

// 错题本相关路由
router.use(`${API_PREFIX}/wrong-questions`, wrongQuestionRoutes);

// 收藏夹相关路由
router.use(`${API_PREFIX}/favorites`, favoriteRoutes);

// 数据分析相关路由
router.use(`${API_PREFIX}/analytics`, analyticsRoutes);

export default router; 