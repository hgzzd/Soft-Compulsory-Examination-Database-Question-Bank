import { Router } from 'express';
import { getFavorites, addToFavorites, removeFromFavorites } from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要身份验证
router.use(authenticate);

// 获取用户收藏列表
router.get('/', getFavorites);

// 添加题目到收藏夹
router.post('/', addToFavorites);

// 取消收藏题目
router.delete('/:id', removeFromFavorites);

export default router; 