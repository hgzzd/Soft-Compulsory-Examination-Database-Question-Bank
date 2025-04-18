import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils';

// 扩展Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * 验证用户是否已登录的中间件
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 从Authorization头中获取令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: '未提供有效的认证令牌' });
      return;
    }

    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ message: '认证令牌无效或已过期' });
      return;
    }

    // 将用户信息添加到请求对象中
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(500).json({ message: '认证处理失败' });
  }
}; 