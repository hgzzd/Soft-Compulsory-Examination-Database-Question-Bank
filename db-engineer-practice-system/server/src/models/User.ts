import { pool } from '../config/database';
import { hashPassword } from '../utils/auth.utils';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 用户接口定义
export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  created_at?: Date;
  last_login?: Date;
  status?: number;
}

// 用户信息接口（不包含敏感信息）
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  created_at: Date;
  last_login?: Date;
  status: number;
}

// 用户模型类
export class UserModel {
  /**
   * 通过用户名查找用户
   * @param username 用户名
   * @returns 用户对象或null
   */
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE username = ? AND status = 1',
        [username]
      );
      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 通过电子邮件查找用户
   * @param email 电子邮件
   * @returns 用户对象或null
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ? AND status = 1',
        [email]
      );
      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 通过用户ID查找用户
   * @param id 用户ID
   * @returns 用户对象或null
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ? AND status = 1',
        [id]
      );
      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 创建新用户
   * @param userData 用户数据
   * @returns 创建的用户ID
   */
  static async create(userData: User): Promise<number> {
    try {
      // 加密密码
      const hashedPassword = await hashPassword(userData.password);
      
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO users (username, email, password, avatar, status) VALUES (?, ?, ?, ?, ?)',
        [
          userData.username,
          userData.email,
          hashedPassword,
          userData.avatar || null,
          1 // 默认状态为启用
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param userData 要更新的用户数据
   * @returns 是否更新成功
   */
  static async update(id: number, userData: Partial<User>): Promise<boolean> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      // 动态构建UPDATE语句
      if (userData.username) {
        updateFields.push('username = ?');
        values.push(userData.username);
      }
      
      if (userData.email) {
        updateFields.push('email = ?');
        values.push(userData.email);
      }
      
      if (userData.password) {
        updateFields.push('password = ?');
        const hashedPassword = await hashPassword(userData.password);
        values.push(hashedPassword);
      }
      
      if (userData.avatar !== undefined) {
        updateFields.push('avatar = ?');
        values.push(userData.avatar);
      }
      
      if (userData.last_login) {
        updateFields.push('last_login = ?');
        values.push(userData.last_login);
      }
      
      // 添加用户ID到值数组
      values.push(id);

      if (updateFields.length === 0) {
        return false; // 没有字段需要更新
      }

      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      const [result] = await pool.execute<ResultSetHeader>(query, values);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新用户失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户最后登录时间
   */
  static async updateLastLogin(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新用户最后登录时间失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户信息（不包含敏感数据）
   * @param id 用户ID
   * @returns 用户信息对象或null
   */
  static async getUserInfo(id: number): Promise<UserInfo | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, username, email, avatar, created_at, last_login, status FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] as UserInfo : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
} 