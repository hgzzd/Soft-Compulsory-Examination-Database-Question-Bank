import { Request, Response } from 'express';
import { ExamSetModel, Pagination } from '../models/ExamSet';

// 获取试题集列表
export const getExamSets = async (req: Request, res: Response): Promise<void> => {
  try {
    // 处理分页参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({ message: '无效的分页参数' });
      return;
    }

    // 处理年份筛选
    let year: string | undefined;
    if (req.query.year) {
      year = req.query.year as string;
    }

    // 分页配置
    const pagination: Pagination = { page, limit };

    // 获取试题集列表
    const { exam_sets, total } = await ExamSetModel.getExamSets(pagination, year);

    // 返回结果
    res.status(200).json({
      total,
      page,
      limit,
      exam_sets
    });
  } catch (error) {
    console.error('获取试题集列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取试题集详情
export const getExamSetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const examSetId = parseInt(req.params.id);
    
    if (isNaN(examSetId)) {
      res.status(400).json({ message: '无效的试题集ID' });
      return;
    }

    // 获取试题集详情
    const examSet = await ExamSetModel.getExamSetById(examSetId);
    
    if (!examSet) {
      res.status(404).json({ message: '试题集不存在' });
      return;
    }

    // 返回结果
    res.status(200).json(examSet);
  } catch (error) {
    console.error('获取试题集详情失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取试题集中的所有题目
export const getExamSetQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const examSetId = parseInt(req.params.id);
    
    if (isNaN(examSetId)) {
      res.status(400).json({ message: '无效的试题集ID' });
      return;
    }

    // 获取试题集详情
    const examSet = await ExamSetModel.getExamSetById(examSetId);
    
    if (!examSet) {
      res.status(404).json({ message: '试题集不存在' });
      return;
    }

    // 获取试题集中的所有题目
    const questions = await ExamSetModel.getExamSetQuestions(examSetId);

    // 返回结果
    res.status(200).json({
      exam_set: {
        exam_set_id: examSet.exam_set_id,
        exam_name: examSet.exam_name,
        year: examSet.year,
        description: examSet.description
      },
      questions
    });
  } catch (error) {
    console.error('获取试题集题目失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}; 