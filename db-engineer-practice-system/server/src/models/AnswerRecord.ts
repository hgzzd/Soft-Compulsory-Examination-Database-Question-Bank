import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Question, QuestionModel } from './Question';

// 答题记录接口
export interface AnswerRecord {
  id?: number;
  practice_id: number;
  question_id: number;
  user_answer?: string;
  is_correct: boolean;
  time_spent?: number;
  created_at?: Date;
}

// 答题统计数据接口
export interface AnswerStats {
  total_answers: number;
  correct_answers: number;
  incorrect_answers: number;
  correct_rate: number;
  average_time_spent: number;
}

// 答题记录模型类
export class AnswerRecordModel {
  /**
   * 创建答题记录
   */
  static async createAnswerRecord(record: AnswerRecord): Promise<number> {
    try {
      const { practice_id, question_id, user_answer, is_correct, time_spent } = record;
      
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO answer_records (practice_id, question_id, user_answer, is_correct, time_spent) VALUES (?, ?, ?, ?, ?)',
        [practice_id, question_id, user_answer || null, is_correct ? 1 : 0, time_spent || null]
      );

      return result.insertId;
    } catch (error) {
      console.error('创建答题记录失败:', error);
      throw error;
    }
  }

  /**
   * 批量创建答题记录
   */
  static async createAnswerRecords(records: AnswerRecord[]): Promise<number[]> {
    try {
      if (records.length === 0) {
        return [];
      }

      // 创建批量插入的值
      const values = records.map(record => {
        return [
          record.practice_id,
          record.question_id,
          record.user_answer || null,
          record.is_correct ? 1 : 0,
          record.time_spent || null
        ];
      });

      // 构建占位符
      const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(', ');
      
      // 展平值数组
      const flatValues = values.flat();

      // 执行批量插入
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO answer_records (practice_id, question_id, user_answer, is_correct, time_spent) VALUES ${placeholders}`,
        flatValues
      );

      // 返回插入的ID数组（近似值，因为MySQL不返回批量插入的每个ID）
      const insertIds: number[] = [];
      const firstId = result.insertId;
      for (let i = 0; i < result.affectedRows; i++) {
        insertIds.push(firstId + i);
      }

      return insertIds;
    } catch (error) {
      console.error('批量创建答题记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取练习的所有答题记录
   */
  static async getAnswerRecordsByPracticeId(practiceId: number): Promise<AnswerRecord[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM answer_records WHERE practice_id = ? ORDER BY created_at',
        [practiceId]
      );

      return rows as AnswerRecord[];
    } catch (error) {
      console.error('获取练习答题记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户对特定题目的答题历史
   */
  static async getUserQuestionAnswerHistory(userId: number, questionId: number): Promise<AnswerRecord[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT ar.* 
         FROM answer_records ar
         JOIN practice_records pr ON ar.practice_id = pr.id
         WHERE pr.user_id = ? AND ar.question_id = ?
         ORDER BY ar.created_at DESC`,
        [userId, questionId]
      );

      return rows as AnswerRecord[];
    } catch (error) {
      console.error('获取用户题目答题历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的答题统计数据
   */
  static async getUserAnswerStats(userId: number): Promise<AnswerStats> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total_answers,
          SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
          SUM(CASE WHEN ar.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_answers,
          AVG(ar.time_spent) as average_time_spent
         FROM answer_records ar
         JOIN practice_records pr ON ar.practice_id = pr.id
         WHERE pr.user_id = ?`,
        [userId]
      );

      if (rows.length === 0 || !rows[0].total_answers) {
        return {
          total_answers: 0,
          correct_answers: 0,
          incorrect_answers: 0,
          correct_rate: 0,
          average_time_spent: 0
        };
      }

      const stats = rows[0] as any;
      const correctRate = stats.total_answers > 0 
        ? (stats.correct_answers / stats.total_answers) * 100 
        : 0;

      return {
        total_answers: stats.total_answers || 0,
        correct_answers: stats.correct_answers || 0,
        incorrect_answers: stats.incorrect_answers || 0,
        correct_rate: correctRate,
        average_time_spent: stats.average_time_spent || 0
      };
    } catch (error) {
      console.error('获取用户答题统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 验证答案是否正确
   */
  static async validateAnswer(questionId: number, userAnswer: string): Promise<boolean> {
    try {
      // 获取题目信息
      const question = await QuestionModel.getQuestionById(questionId);
      if (!question) {
        throw new Error('题目不存在');
      }

      // 直接比较答案
      const correctAnswer = question.correct_answer;
      return userAnswer.toUpperCase() === correctAnswer.toUpperCase();
    } catch (error) {
      console.error('验证答案失败:', error);
      throw error;
    }
  }
}