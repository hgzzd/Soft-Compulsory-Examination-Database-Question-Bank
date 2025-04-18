import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Question, QuestionModel } from './Question';

// 错题状态类型
export type WrongQuestionStatus = 'new' | 'reviewing' | 'mastered';

// 错题接口
export interface WrongQuestion {
  id?: number;
  user_id: number;
  question_id: number;
  wrong_count?: number;
  last_wrong_time?: Date;
  note?: string;
  status: WrongQuestionStatus;
  created_at?: Date;
  updated_at?: Date;
  question?: Question;
}

// 筛选条件接口
export interface WrongQuestionFilters {
  status?: WrongQuestionStatus;
}

// 错题本模型类
export class WrongQuestionModel {
  /**
   * 添加题目到错题本
   */
  static async addToWrongQuestions(wrongQuestion: WrongQuestion): Promise<number> {
    try {
      const { user_id, question_id, status, note } = wrongQuestion;

      // 检查是否已存在
      const exists = await this.checkExists(user_id, question_id);
      if (exists) {
        // 如果已存在，更新状态和笔记，增加错误次数
        await pool.execute(
          'UPDATE wrong_questions SET wrong_count = wrong_count + 1, last_wrong_time = NOW(), status = ?, note = ?, updated_at = NOW() WHERE id = ?',
          [status, note || null, exists]
        );
        return exists;
      }

      // 如果不存在，创建新记录
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO wrong_questions (user_id, question_id, wrong_count, last_wrong_time, status, note) VALUES (?, ?, 1, NOW(), ?, ?)',
        [user_id, question_id, status, note || null]
      );

      return result.insertId;
    } catch (error) {
      console.error('添加题目到错题本失败:', error);
      throw error;
    }
  }

  /**
   * 检查题目是否已在错题本中
   */
  static async checkExists(userId: number, questionId: number): Promise<number | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM wrong_questions WHERE user_id = ? AND question_id = ?',
        [userId, questionId]
      );

      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      console.error('检查错题是否存在失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户错题列表
   */
  static async getWrongQuestions(userId: number, filters?: WrongQuestionFilters): Promise<WrongQuestion[]> {
    try {
      // 构建查询条件
      let whereClause = 'WHERE wq.user_id = ?';
      const queryParams: any[] = [userId];

      if (filters) {
        if (filters.status) {
          whereClause += ' AND wq.status = ?';
          queryParams.push(filters.status);
        }
      }

      // 执行查询
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT wq.*, q.* 
         FROM wrong_questions wq
         JOIN questions q ON wq.question_id = q.question_id
         ${whereClause}
         ORDER BY wq.updated_at DESC`,
        queryParams
      );

      const wrongQuestions: WrongQuestion[] = [];

      for (const row of rows) {
        const wrongQuestion: WrongQuestion = {
          id: row.id,
          user_id: row.user_id,
          question_id: row.question_id,
          wrong_count: row.wrong_count,
          last_wrong_time: row.last_wrong_time,
          note: row.note,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          question: {
            question_id: row.question_id,
            exam_set_id: row.exam_set_id,
            question_number: row.question_number,
            content: row.content,
            question_type: row.question_type,
            correct_answer: row.correct_answer
          }
        };

        // 获取题目选项
        const [optionRows] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM options WHERE exam_set_id = ? AND question_number = ? ORDER BY option_label',
          [row.exam_set_id, row.question_number]
        );
        
        if (wrongQuestion.question) {
          wrongQuestion.question.options = optionRows as any[];
        }

        wrongQuestions.push(wrongQuestion);
      }

      return wrongQuestions;
    } catch (error) {
      console.error('获取用户错题列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取错题详情
   */
  static async getWrongQuestionById(id: number): Promise<WrongQuestion | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM wrong_questions WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const wrongQuestion = rows[0] as WrongQuestion;

      // 获取题目详情
      const question = await QuestionModel.getQuestionById(wrongQuestion.question_id);
      if (question) {
        wrongQuestion.question = question;
      }

      return wrongQuestion;
    } catch (error) {
      console.error('获取错题详情失败:', error);
      throw error;
    }
  }

  /**
   * 更新错题状态或笔记
   */
  static async updateWrongQuestion(id: number, data: { status?: WrongQuestionStatus, note?: string }): Promise<boolean> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      // 动态构建UPDATE语句
      if (data.status) {
        updateFields.push('status = ?');
        values.push(data.status);
      }

      if (data.note !== undefined) {
        updateFields.push('note = ?');
        values.push(data.note);
      }

      // 添加最后更新时间
      updateFields.push('updated_at = NOW()');

      // 添加ID到值数组
      values.push(id);

      if (updateFields.length === 0) {
        return false; // 没有字段需要更新
      }

      const query = `UPDATE wrong_questions SET ${updateFields.join(', ')} WHERE id = ?`;
      const [result] = await pool.execute<ResultSetHeader>(query, values);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新错题失败:', error);
      throw error;
    }
  }

  /**
   * 从错题本中删除题目
   */
  static async removeFromWrongQuestions(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM wrong_questions WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('从错题本删除题目失败:', error);
      throw error;
    }
  }
} 