import { Router } from 'express';
import { getExamSets, getExamSetById, getExamSetQuestions } from '../controllers/exam-set.controller';

const router = Router();

// 获取试题集列表
router.get('/', getExamSets);

// 获取试题集详情
router.get('/:id', getExamSetById);

// 获取试题集中的所有题目
router.get('/:id/questions', getExamSetQuestions);

export default router; 