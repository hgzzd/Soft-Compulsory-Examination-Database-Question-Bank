import { Request, Response } from 'express';
import { FavoriteModel, Favorite } from '../models/Favorite';
import { QuestionModel } from '../models/Question';

// 获取用户收藏列表
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 获取收藏列表
    const favorites = await FavoriteModel.getFavorites(userId);

    res.status(200).json({
      total: favorites.length,
      favorites
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 添加题目到收藏夹
export const addToFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const { question_id } = req.body;

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

    // 添加到收藏夹
    const favorite: Favorite = {
      user_id: userId,
      question_id
    };

    const favoriteId = await FavoriteModel.addToFavorites(favorite);

    res.status(201).json({
      message: '添加到收藏夹成功',
      favorite_id: favoriteId
    });
  } catch (error) {
    console.error('添加到收藏夹失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 取消收藏题目
export const removeFromFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const favoriteId = parseInt(req.params.id);
    if (isNaN(favoriteId)) {
      res.status(400).json({ message: '无效的收藏ID' });
      return;
    }

    // 检查收藏是否存在
    const favorites = await FavoriteModel.getFavorites(userId);
    const favorite = favorites.find(f => f.id === favoriteId);
    
    if (!favorite) {
      res.status(404).json({ message: '收藏不存在或不属于该用户' });
      return;
    }

    // 取消收藏
    const success = await FavoriteModel.removeFromFavorites(favoriteId);
    
    if (!success) {
      res.status(400).json({ message: '取消收藏失败' });
      return;
    }

    res.status(200).json({
      message: '取消收藏成功'
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}; 