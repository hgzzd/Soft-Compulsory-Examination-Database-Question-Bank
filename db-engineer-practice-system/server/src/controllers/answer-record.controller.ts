import { Request, Response } from 'express';
import { AnswerRecordModel, AnswerRecord } from '../models/AnswerRecord';
import { PracticeModel } from '../models/Practice';
import { QuestionModel } from '../models/Question';

// 提交题目答案
export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const { practice_id, question_id, user_answer, time_spent } = req.body;

    // 验证请求体
    if (!practice_id || !question_id || !user_answer) {
      res.status(400).json({ message: '练习ID、题目ID和用户答案都是必填项' });
      return;
    }

    // 检查练习是否存在且属于该用户
    const practice = await PracticeModel.getPracticeById(practice_id);
    if (!practice) {
      res.status(404).json({ message: '练习不存在' });
      return;
    }

    if (practice.user_id !== userId) {
      res.status(403).json({ message: '没有权限提交此练习的答案' });
      return;
    }

    // 检查练习是否已经完成
    if (practice.end_time) {
      res.status(400).json({ message: '只能提交进行中的练习答案' });
      return;
    }

    // 检查题目是否存在
    const question = await QuestionModel.getQuestionById(question_id);
    if (!question) {
      res.status(404).json({ message: '题目不存在' });
      return;
    }

    // 检查用户是否已经回答过这个题目
    const existingAnswers = await AnswerRecordModel.getAnswerRecordsByPracticeId(practice_id);
    const hasAnswered = existingAnswers.some(record => record.question_id === question_id);
    
    if (hasAnswered) {
      res.status(400).json({ message: '已经回答过此题目' });
      return;
    }

    // 检查答案是否正确
    const is_correct = await AnswerRecordModel.validateAnswer(question_id, user_answer);

    // 创建答题记录
    const answerRecord: AnswerRecord = {
      practice_id,
      question_id,
      user_answer,
      is_correct,
      time_spent
    };

    await AnswerRecordModel.createAnswerRecord(answerRecord);

    // 获取正确答案
    const correctAnswer = question.correct_answer;

    res.status(201).json({
      is_correct,
      correct_answer: correctAnswer
    });
  } catch (error) {
    console.error('提交答案失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取用户答题记录
export const getAnswerRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 可选的练习ID筛选
    let practiceId: number | undefined = undefined;
    if (req.query.practice_id) {
      practiceId = parseInt(req.query.practice_id as string);
      if (isNaN(practiceId)) {
        res.status(400).json({ message: '无效的练习ID' });
        return;
      }
    }

    // 获取用户的练习历史
    const practices = await PracticeModel.getUserPracticeHistory(userId);
    
    // 如果指定了practiceId，筛选特定练习
    const targetPractices = practiceId 
      ? practices.filter(p => p.id === practiceId)
      : practices;
    
    // 获取所有相关练习的答题记录
    const allRecords = [];
    for (const practice of targetPractices) {
      if (practice.id) {
        const records = await AnswerRecordModel.getAnswerRecordsByPracticeId(practice.id);
        allRecords.push(...records);
      }
    }

    res.status(200).json({
      total: allRecords.length,
      records: allRecords
    });
  } catch (error) {
    console.error('获取答题记录失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取用户答题统计数据
export const getAnswerStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 获取用户答题统计数据
    const stats = await AnswerRecordModel.getUserAnswerStats(userId);

    res.status(200).json(stats);
  } catch (error) {
    console.error('获取答题统计数据失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}; 