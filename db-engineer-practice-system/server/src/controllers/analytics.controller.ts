import { Request, Response } from 'express';
import { AnalyticsModel } from '../models/Analytics';

// 获取学习概览数据
export const getOverviewData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 获取学习概览数据
    const overviewData = await AnalyticsModel.getOverviewData(userId);

    res.status(200).json(overviewData);
  } catch (error) {
    console.error('获取学习概览数据失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取学习进度数据
export const getProgressData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 获取学习进度数据
    const progressData = await AnalyticsModel.getProgressData(userId);

    res.status(200).json(progressData);
  } catch (error) {
    console.error('获取学习进度数据失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取知识点掌握度数据
export const getKnowledgePointsData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 获取知识点掌握度数据
    const knowledgePointData = await AnalyticsModel.getKnowledgePointsData(userId);

    res.status(200).json(knowledgePointData);
  } catch (error) {
    console.error('获取知识点掌握度数据失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取题型分布数据
export const getQuestionTypesData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 获取题型分布数据
    const questionTypeData = await AnalyticsModel.getQuestionTypesData(userId);

    res.status(200).json(questionTypeData);
  } catch (error) {
    console.error('获取题型分布数据失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}; 