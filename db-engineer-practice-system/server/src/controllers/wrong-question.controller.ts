import { Request, Response } from 'express';
import { WrongQuestionModel, WrongQuestion, WrongQuestionFilters } from '../models/WrongQuestion';
import { QuestionModel } from '../models/Question';

// 获取用户错题列表
export const getWrongQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 处理筛选条件
    const filters: WrongQuestionFilters = {};
    
    if (req.query.status) {
      filters.status = req.query.status as WrongQuestion['status'];
    }

    // 获取错题列表
    const wrongQuestions = await WrongQuestionModel.getWrongQuestions(userId, filters);

    res.status(200).json({
      total: wrongQuestions.length,
      wrong_questions: wrongQuestions
    });
  } catch (error) {
    console.error('获取错题列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取错题详情
export const getWrongQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const wrongQuestionId = parseInt(req.params.id);
    if (isNaN(wrongQuestionId)) {
      res.status(400).json({ message: '无效的错题ID' });
      return;
    }

    // 获取错题详情
    const wrongQuestion = await WrongQuestionModel.getWrongQuestionById(wrongQuestionId);
    
    if (!wrongQuestion) {
      res.status(404).json({ message: '错题不存在' });
      return;
    }

    // 验证用户所有权
    if (wrongQuestion.user_id !== userId) {
      res.status(403).json({ message: '没有权限查看此错题' });
      return;
    }

    res.status(200).json(wrongQuestion);
  } catch (error) {
    console.error('获取错题详情失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 添加题目到错题本
export const addToWrongQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const { question_id, status, note } = req.body;

    // 验证请求体
    if (!question_id) {
      res.status(400).json({ message: '题目ID是必填项' });
      return;
    }

    // 检查题目是否存在
    const question = await QuestionModel.getQuestionById(question_id);
    if (!question) {
      res.status(404).json({ message: '题目不存在' });
      return;
    }

    // 添加到错题本
    const wrongQuestion: WrongQuestion = {
      user_id: userId,
      question_id,
      status: status || 'new',
      note
    };

    const wrongQuestionId = await WrongQuestionModel.addToWrongQuestions(wrongQuestion);

    res.status(201).json({
      message: '添加到错题本成功',
      wrong_question_id: wrongQuestionId
    });
  } catch (error) {
    console.error('添加到错题本失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新错题状态或笔记
export const updateWrongQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const wrongQuestionId = parseInt(req.params.id);
    if (isNaN(wrongQuestionId)) {
      res.status(400).json({ message: '无效的错题ID' });
      return;
    }

    // 获取错题记录
    const wrongQuestion = await WrongQuestionModel.getWrongQuestionById(wrongQuestionId);
    if (!wrongQuestion) {
      res.status(404).json({ message: '错题不存在' });
      return;
    }

    // 验证用户所有权
    if (wrongQuestion.user_id !== userId) {
      res.status(403).json({ message: '没有权限更新此错题' });
      return;
    }

    const { status, note } = req.body;
    
    // 检查是否有要更新的内容
    if (!status && note === undefined) {
      res.status(400).json({ message: '没有提供要更新的字段' });
      return;
    }

    // 更新错题记录
    const updateData: { status?: WrongQuestion['status'], note?: string } = {};
    if (status) updateData.status = status;
    if (note !== undefined) updateData.note = note;

    const success = await WrongQuestionModel.updateWrongQuestion(wrongQuestionId, updateData);
    
    if (!success) {
      res.status(400).json({ message: '更新错题失败' });
      return;
    }

    // 获取更新后的错题记录
    const updatedWrongQuestion = await WrongQuestionModel.getWrongQuestionById(wrongQuestionId);

    res.status(200).json({
      message: '错题更新成功',
      wrong_question: updatedWrongQuestion
    });
  } catch (error) {
    console.error('更新错题失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 从错题本中删除题目
export const removeFromWrongQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const wrongQuestionId = parseInt(req.params.id);
    if (isNaN(wrongQuestionId)) {
      res.status(400).json({ message: '无效的错题ID' });
      return;
    }

    // 获取错题记录
    const wrongQuestion = await WrongQuestionModel.getWrongQuestionById(wrongQuestionId);
    if (!wrongQuestion) {
      res.status(404).json({ message: '错题不存在' });
      return;
    }

    // 验证用户所有权
    if (wrongQuestion.user_id !== userId) {
      res.status(403).json({ message: '没有权限删除此错题' });
      return;
    }

    // 从错题本中删除
    const success = await WrongQuestionModel.removeFromWrongQuestions(wrongQuestionId);
    
    if (!success) {
      res.status(400).json({ message: '删除错题失败' });
      return;
    }

    res.status(200).json({
      message: '从错题本中删除成功'
    });
  } catch (error) {
    console.error('删除错题失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}; 