import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Question, QuestionModel } from './Question';

// 收藏接口
export interface Favorite {
  id?: number;
  user_id: number;
  question_id: number;
  created_at?: Date;
  question?: Question;
}

// 收藏夹模型类
export class FavoriteModel {
  /**
   * 添加题目到收藏夹
   */
  static async addToFavorites(favorite: Favorite): Promise<number> {
    try {
      const { user_id, question_id } = favorite;

      // 检查是否已存在
      const exists = await this.checkExists(user_id, question_id);
      if (exists) {
        return exists;
      }

      // 如果不存在，创建新记录
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO user_favorites (user_id, question_id) VALUES (?, ?)',
        [user_id, question_id]
      );

      return result.insertId;
    } catch (error) {
      console.error('添加题目到收藏夹失败:', error);
      throw error;
    }
  }

  /**
   * 检查题目是否已收藏
   */
  static async checkExists(userId: number, questionId: number): Promise<number | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM user_favorites WHERE user_id = ? AND question_id = ?',
        [userId, questionId]
      );

      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      console.error('检查收藏是否存在失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户收藏列表
   */
  static async getFavorites(userId: number): Promise<Favorite[]> {
    try {
      // 执行查询获取收藏记录
      const [favRows] = await pool.execute<RowDataPacket[]>(
        `SELECT f.* FROM user_favorites f WHERE f.user_id = ? ORDER BY f.created_at DESC`,
        [userId]
      );

      const favorites: Favorite[] = [];
      
      // 对于每个收藏记录，获取对应的题目信息
      for (const row of favRows) {
        const favorite: Favorite = {
          id: row.id,
          user_id: row.user_id,
          question_id: row.question_id,
          created_at: row.created_at
        };
        
        // 获取题目详细信息
        const question = await QuestionModel.getQuestionById(row.question_id);
        if (question) {
          favorite.question = question;
        }
        
        favorites.push(favorite);
      }

      return favorites;
    } catch (error) {
      console.error('获取用户收藏列表失败:', error);
      throw error;
    }
  }

  /**
   * 从收藏夹中删除题目
   */
  static async removeFromFavorites(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM user_favorites WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('从收藏夹删除题目失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户收藏的题目数量
   */
  static async getFavoriteCount(userId: number): Promise<number> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?',
        [userId]
      );

      return rows[0].count || 0;
    } catch (error) {
      console.error('获取用户收藏数量失败:', error);
      throw error;
    }
  }
}