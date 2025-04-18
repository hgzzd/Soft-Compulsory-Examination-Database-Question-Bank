import { Request, Response } from 'express';
import { UserModel, User } from '../models/User';
import { generateToken, comparePassword } from '../utils/auth.utils';

/**
 * 用户注册控制器
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 验证请求体
    if (!username || !email || !password) {
      res.status(400).json({ message: '用户名、邮箱和密码都是必填项' });
      return;
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await UserModel.findByUsername(username);
    if (existingUserByUsername) {
      res.status(409).json({ message: '用户名已被使用' });
      return;
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await UserModel.findByEmail(email);
    if (existingUserByEmail) {
      res.status(409).json({ message: '邮箱已被注册' });
      return;
    }

    // 创建新用户
    const newUser: User = { username, email, password };
    const userId = await UserModel.create(newUser);

    res.status(201).json({
      success: true,
      message: '用户注册成功',
      user_id: userId
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

/**
 * 用户登录控制器
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // 验证请求体
    if (!username || !password) {
      res.status(400).json({ message: '用户名和密码都是必填项' });
      return;
    }

    // 查找用户
    const user = await UserModel.findByUsername(username);
    if (!user) {
      res.status(401).json({ message: '用户名或密码不正确' });
      return;
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: '用户名或密码不正确' });
      return;
    }

    // 确保user.id存在
    if (!user.id) {
      res.status(500).json({ message: '用户数据错误' });
      return;
    }

    // 更新最后登录时间
    await UserModel.updateLastLogin(user.id);

    // 生成JWT令牌
    const token = generateToken({
      id: user.id,
      username: user.username
    });

    // 获取用户信息（不包含密码）
    const userInfo = await UserModel.getUserInfo(user.id);

    res.status(200).json({
      token,
      user_info: userInfo
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

/**
 * 获取用户个人信息控制器
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    // 获取用户信息
    const userInfo = await UserModel.getUserInfo(userId);
    if (!userInfo) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // TODO: 在这里添加用户统计数据的获取
    const stats = {
      total_questions: 0,
      correct_answers: 0,
      wrong_answers: 0,
      favorite_count: 0
    };

    res.status(200).json({
      user_info: userInfo,
      stats: stats
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

/**
 * 更新用户个人信息控制器
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权访问' });
      return;
    }

    const { username, email, password, avatar } = req.body;
    
    // 检查是否有要更新的内容
    if (!username && !email && !password && avatar === undefined) {
      res.status(400).json({ message: '没有提供要更新的字段' });
      return;
    }

    // 如果用户想更新用户名，检查是否已存在
    if (username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        res.status(409).json({ message: '用户名已被使用' });
        return;
      }
    }

    // 如果用户想更新邮箱，检查是否已存在
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        res.status(409).json({ message: '邮箱已被注册' });
        return;
      }
    }

    // 更新用户信息
    const updateData: Partial<User> = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (avatar !== undefined) updateData.avatar = avatar;

    const success = await UserModel.update(userId, updateData);
    
    if (!success) {
      res.status(404).json({ message: '用户不存在或更新失败' });
      return;
    }

    // 获取更新后的用户信息
    const updatedUserInfo = await UserModel.getUserInfo(userId);

    res.status(200).json({
      message: '用户信息更新成功',
      user_info: updatedUserInfo
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

/**
 * 用户登出控制器（实际上只需前端清除令牌，此API可作为记录用途）
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // JWT是无状态的，真正的登出在客户端完成（清除令牌）
    // 这里可以实现令牌黑名单或记录登出事件等功能
    
    res.status(200).json({
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}; 