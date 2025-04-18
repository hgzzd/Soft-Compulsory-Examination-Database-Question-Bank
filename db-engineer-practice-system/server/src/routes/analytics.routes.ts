import { Router } from 'express';
import { getOverviewData, getProgressData, getKnowledgePointsData, getQuestionTypesData } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要身份验证
router.use(authenticate);

// 获取学习概览数据
router.get('/overview', getOverviewData);

// 获取学习进度数据
router.get('/progress', getProgressData);

// 获取知识点掌握度数据
router.get('/knowledge-points', getKnowledgePointsData);

// 获取题型分布数据
router.get('/question-types', getQuestionTypesData);

export default router; 