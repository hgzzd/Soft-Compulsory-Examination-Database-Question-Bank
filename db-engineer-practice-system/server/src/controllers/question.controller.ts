import { Request, Response } from 'express';
import { QuestionModel, QuestionFilters, Pagination } from '../models/Question';

// 获取题目列表
export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    // 处理分页参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({ message: '无效的分页参数' });
      return;
    }

    // 处理筛选条件
    const filters: QuestionFilters = {};
    
    if (req.query.exam_set_id) {
      filters.exam_set_id = parseInt(req.query.exam_set_id as string);
    }
    
    if (req.query.question_type) {
      filters.question_type = req.query.question_type as string;
    }

    // 分页配置
    const pagination: Pagination = { page, limit };

    // 获取题目列表
    const { questions, total } = await QuestionModel.getQuestions(pagination, filters);

    // 返回结果
    res.status(200).json({
      total,
      page,
      limit,
      questions
    });
  } catch (error) {
    console.error('获取题目列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取题目详情
export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const questionId = parseInt(req.params.id);
    
    if (isNaN(questionId)) {
      res.status(400).json({ message: '无效的题目ID' });
      return;
    }

    // 获取题目详情
    const question = await QuestionModel.getQuestionById(questionId);
    
    if (!question) {
      res.status(404).json({ message: '题目不存在' });
      return;
    }

    // 返回结果
    res.status(200).json(question);
  } catch (error) {
    console.error('获取题目详情失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}; 