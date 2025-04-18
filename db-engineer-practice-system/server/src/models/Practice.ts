import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Question, QuestionModel } from './Question';

// 练习记录接口
export interface Practice {
  id?: number;
  user_id: number;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  total_questions?: number;
  correct_count?: number;
  incorrect_count?: number;
  score?: number;
  exam_set_id?: number;
  created_at?: Date;
}

// 练习统计数据接口
export interface PracticeStats {
  total_practice: number;
  completed_practice: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  average_score: number;
  average_duration: number;
}

// 练习模型类
export class PracticeModel {
  /**
   * 创建新的练习记录
   */
  static async createPractice(practice: Practice): Promise<number> {
    try {
      const { user_id, exam_set_id, start_time } = practice;
      
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO practice_records (user_id, exam_set_id, start_time) VALUES (?, ?, ?)',
        [user_id, exam_set_id || null, start_time]
      );

      return result.insertId;
    } catch (error) {
      console.error('创建练习记录失败:', error);
      throw error;
    }
  }

  /**
   * 通过ID获取练习详情
   */
  static async getPracticeById(id: number): Promise<Practice | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM practice_records WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as Practice;
    } catch (error) {
      console.error('获取练习详情失败:', error);
      throw error;
    }
  }

  /**
   * 通过练习ID获取关联的题目
   */
  static async getPracticeQuestions(practiceId: number, examSetId?: number): Promise<Question[]> {
    try {
      if (!examSetId) {
        // 获取练习记录信息
        const practice = await this.getPracticeById(practiceId);
        if (!practice || !practice.exam_set_id) {
          return [];
        }
        examSetId = practice.exam_set_id;
      }

      // 获取该考试集下的所有题目
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM questions WHERE exam_set_id = ? ORDER BY question_number',
        [examSetId]
      );

      const questions = rows as Question[];

      // 获取答题记录，用于标记已回答的题目
      const [answerRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM answer_records WHERE practice_id = ?',
        [practiceId]
      );

      const answeredMap = new Map<number, any>();
      (answerRows as any[]).forEach(answer => {
        answeredMap.set(answer.question_id, answer);
      });

      // 为题目添加答题记录信息
      for (const question of questions) {
        // 获取题目的选项
        const [optionRows] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM options WHERE exam_set_id = ? AND question_number = ? ORDER BY option_label',
          [examSetId, question.question_number]
        );
        question.options = optionRows as any;

        // 添加用户答案信息（如果已答题）
        const answer = answeredMap.get(question.question_id);
        if (answer) {
          (question as any).user_answer = answer.user_answer;
          (question as any).is_correct = answer.is_correct;
          (question as any).time_spent = answer.time_spent;
        }
      }

      return questions;
    } catch (error) {
      console.error('获取练习题目失败:', error);
      throw error;
    }
  }

  /**
   * 更新练习记录
   */
  static async updatePractice(id: number, data: Partial<Practice>): Promise<boolean> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      // 动态构建UPDATE语句
      if (data.end_time) {
        updateFields.push('end_time = ?');
        values.push(data.end_time);
      }
      
      if (data.duration !== undefined) {
        updateFields.push('duration = ?');
        values.push(data.duration);
      }
      
      if (data.total_questions !== undefined) {
        updateFields.push('total_questions = ?');
        values.push(data.total_questions);
      }
      
      if (data.correct_count !== undefined) {
        updateFields.push('correct_count = ?');
        values.push(data.correct_count);
      }

      if (data.incorrect_count !== undefined) {
        updateFields.push('incorrect_count = ?');
        values.push(data.incorrect_count);
      }
      
      if (data.score !== undefined) {
        updateFields.push('score = ?');
        values.push(data.score);
      }
      
      // 添加练习ID到值数组
      values.push(id);

      if (updateFields.length === 0) {
        return false; // 没有字段需要更新
      }

      const query = `UPDATE practice_records SET ${updateFields.join(', ')} WHERE id = ?`;
      const [result] = await pool.execute<ResultSetHeader>(query, values);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新练习记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的练习历史记录
   */
  static async getUserPracticeHistory(userId: number): Promise<Practice[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT pr.*, es.exam_name,
         (SELECT COUNT(*) FROM answer_records ar WHERE ar.practice_id = pr.id) as answered_count,
         (SELECT COUNT(*) FROM answer_records ar WHERE ar.practice_id = pr.id AND ar.is_correct = 1) as correct_count
         FROM practice_records pr
         LEFT JOIN exam_sets es ON pr.exam_set_id = es.exam_set_id
         WHERE pr.user_id = ?
         ORDER BY pr.start_time DESC`,
        [userId]
      );

      return rows as Practice[];
    } catch (error) {
      console.error('获取用户练习历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的练习统计数据
   */
  static async getUserPracticeStats(userId: number): Promise<PracticeStats> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total_practice,
          COUNT(end_time) as completed_practice,
          SUM(total_questions) as total_questions,
          SUM(correct_count) as correct_answers,
          SUM(incorrect_count) as wrong_answers,
          AVG(score) as average_score,
          AVG(duration) as average_duration
         FROM practice_records
         WHERE user_id = ?`,
        [userId]
      );

      if (rows.length === 0) {
        return {
          total_practice: 0,
          completed_practice: 0,
          total_questions: 0,
          correct_answers: 0,
          wrong_answers: 0,
          average_score: 0,
          average_duration: 0
        };
      }

      const stats = rows[0] as PracticeStats;
      
      // 处理NULL值
      return {
        total_practice: stats.total_practice || 0,
        completed_practice: stats.completed_practice || 0,
        total_questions: stats.total_questions || 0,
        correct_answers: stats.correct_answers || 0,
        wrong_answers: stats.wrong_answers || 0,
        average_score: stats.average_score || 0,
        average_duration: stats.average_duration || 0
      };
    } catch (error) {
      console.error('获取用户练习统计数据失败:', error);
      throw error;
    }
  }
} 