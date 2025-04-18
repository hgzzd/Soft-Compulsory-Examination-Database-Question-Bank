import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 选项接口
export interface Option {
  exam_set_id: number;
  question_number: number;
  option_label: string;  // A, B, C, D...
  option_content: string;
}

// 题目接口
export interface Question {
  question_id: number;
  exam_set_id: number;
  question_number: number;
  content: string;
  question_type: 'single_choice' | 'multiple_choice';
  correct_answer: string;  // e.g., "A" or "A,B"
  options?: Option[];
}

// 筛选条件接口
export interface QuestionFilters {
  exam_set_id?: number;
  question_type?: string;
}

// 分页接口
export interface Pagination {
  page: number;
  limit: number;
}

// 题目模型类
export class QuestionModel {
  /**
   * 获取题目列表，支持分页和筛选
   */
  static async getQuestions(pagination: Pagination, filters?: QuestionFilters): Promise<{ questions: Question[], total: number }> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // 构建查询条件
      let whereClause = '';
      const queryParams: any[] = [];

      if (filters) {
        const conditions: string[] = [];

        if (filters.exam_set_id) {
          conditions.push('exam_set_id = ?');
          queryParams.push(filters.exam_set_id);
        }

        if (filters.question_type) {
          conditions.push('question_type = ?');
          queryParams.push(filters.question_type);
        }

        if (conditions.length > 0) {
          whereClause = 'WHERE ' + conditions.join(' AND ');
        }
      }

      // 查询总数
      const [countRows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM questions ${whereClause}`,
        queryParams
      );
      const total = countRows[0].total;

      // 查询分页数据
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM questions ${whereClause} LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      const questions = rows as Question[];

      // 获取题目的选项
      for (const question of questions) {
        const [optionRows] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM options WHERE exam_set_id = ? AND question_number = ? ORDER BY option_label',
          [question.exam_set_id, question.question_number]
        );
        question.options = optionRows as Option[];
      }

      return { questions, total };
    } catch (error) {
      console.error('获取题目列表失败:', error);
      throw error;
    }
  }

  /**
   * 通过ID获取题目详情
   */
  static async getQuestionById(id: number): Promise<Question | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM questions WHERE question_id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const question = rows[0] as Question;

      // 获取题目选项
      const [optionRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM options WHERE exam_set_id = ? AND question_number = ? ORDER BY option_label',
        [question.exam_set_id, question.question_number]
      );

      question.options = optionRows as Option[];

      return question;
    } catch (error) {
      console.error('获取题目详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取多个题目详情
   */
  static async getQuestionsByIds(ids: number[]): Promise<Question[]> {
    try {
      if (ids.length === 0) {
        return [];
      }

      const placeholders = ids.map(() => '?').join(',');
      
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM questions WHERE question_id IN (${placeholders})`,
        ids
      );

      const questions = rows as Question[];

      // 获取题目选项 - 为所有题目一次性获取选项
      if (questions.length > 0) {
        // 构建exam_set_id和question_number的条件组合
        const conditions = questions.map(q => `(exam_set_id = ? AND question_number = ?)`);
        const params = questions.flatMap(q => [q.exam_set_id, q.question_number]);
        
        // 获取所有相关选项
        const [optionRows] = await pool.execute<RowDataPacket[]>(
          `SELECT * FROM options WHERE ${conditions.join(' OR ')} ORDER BY exam_set_id, question_number, option_label`,
          params
        );
        
        // 将选项分配给对应题目
        const optionsMap = new Map<string, Option[]>();
        (optionRows as Option[]).forEach(option => {
          const key = `${option.exam_set_id}-${option.question_number}`;
          if (!optionsMap.has(key)) {
            optionsMap.set(key, []);
          }
          optionsMap.get(key)!.push(option);
        });
        
        // 分配选项到题目
        questions.forEach(question => {
          const key = `${question.exam_set_id}-${question.question_number}`;
          question.options = optionsMap.get(key) || [];
        });
      }

      return questions;
    } catch (error) {
      console.error('获取多个题目详情失败:', error);
      throw error;
    }
  }
} 