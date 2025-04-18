import { Request, Response } from 'express';
import { PracticeModel, Practice } from '../models/Practice';
import { QuestionModel } from '../models/Question';
import { ExamSetModel } from '../models/ExamSet';

// 创建新练习记录
export const createPractice = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const { exam_set_id, question_ids, time_limit } = req.body;

    // 需要提供试题集ID或题目ID列表
    if (!exam_set_id && (!question_ids || !Array.isArray(question_ids) || question_ids.length === 0)) {
      res.status(400).json({ message: '必须提供试题集ID或题目ID列表' });
      return;
    }

    let questionIds: number[] = [];

    // 如果提供了试题集ID，从试题集获取题目
    if (exam_set_id) {
      // 验证试题集是否存在
      const examSet = await ExamSetModel.getExamSetById(exam_set_id);
      if (!examSet) {
        res.status(404).json({ message: '试题集不存在' });
        return;
      }

      // 获取试题集中的题目
      const questions = await ExamSetModel.getExamSetQuestions(exam_set_id);
      questionIds = questions.map(q => q.question_id);

      if (questionIds.length === 0) {
        res.status(400).json({ message: '试题集中没有题目' });
        return;
      }
    } else {
      // 使用提供的题目ID列表
      questionIds = question_ids.map((id: string | number) => Number(id));

      // 验证题目ID是否有效
      const questions = await QuestionModel.getQuestionsByIds(questionIds);
      if (questions.length !== questionIds.length) {
        res.status(400).json({ message: '存在无效的题目ID' });
        return;
      }
    }

    // 创建练习记录
    const practice: Practice = {
      user_id: userId,
      exam_set_id: exam_set_id || undefined,
      start_time: new Date()
    };

    const practiceId = await PracticeModel.createPractice(practice);

    // 获取题目详情
    const questions = await QuestionModel.getQuestionsByIds(questionIds);

    res.status(201).json({
      practice_id: practiceId,
      start_time: practice.start_time,
      questions: questions
    });
  } catch (error) {
    console.error('创建练习记录失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新练习记录
export const updatePractice = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const practiceId = parseInt(req.params.id);
    if (isNaN(practiceId)) {
      res.status(400).json({ message: '无效的练习ID' });
      return;
    }

    // 获取练习记录
    const practice = await PracticeModel.getPracticeById(practiceId);
    if (!practice) {
      res.status(404).json({ message: '练习不存在' });
      return;
    }

    // 验证用户所有权
    if (practice.user_id !== userId) {
      res.status(403).json({ message: '没有权限更新此练习' });
      return;
    }

    const { end_practice, score, duration } = req.body;

    // 更新数据
    const updateData: Partial<Practice> = {};
    
    if (end_practice) {
      updateData.end_time = new Date();
    }
    
    if (score !== undefined) {
      updateData.score = score;
    }
    
    if (duration !== undefined) {
      updateData.duration = duration;
    }

    const success = await PracticeModel.updatePractice(practiceId, updateData);
    
    if (!success) {
      res.status(400).json({ message: '更新练习失败' });
      return;
    }

    // 获取更新后的练习记录
    const updatedPractice = await PracticeModel.getPracticeById(practiceId);

    res.status(200).json({
      message: '练习更新成功',
      practice: updatedPractice
    });
  } catch (error) {
    console.error('更新练习记录失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取用户练习历史
export const getPracticeHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 获取用户练习历史
    const practices = await PracticeModel.getUserPracticeHistory(userId);

    res.status(200).json({
      total: practices.length,
      practices: practices
    });
  } catch (error) {
    console.error('获取练习历史失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取练习详情
export const getPracticeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const practiceId = parseInt(req.params.id);
    if (isNaN(practiceId)) {
      res.status(400).json({ message: '无效的练习ID' });
      return;
    }

    // 获取练习记录
    const practice = await PracticeModel.getPracticeById(practiceId);
    if (!practice) {
      res.status(404).json({ message: '练习不存在' });
      return;
    }

    // 验证用户所有权
    if (practice.user_id !== userId) {
      res.status(403).json({ message: '没有权限查看此练习' });
      return;
    }

    res.status(200).json(practice);
  } catch (error) {
    console.error('获取练习详情失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}; 