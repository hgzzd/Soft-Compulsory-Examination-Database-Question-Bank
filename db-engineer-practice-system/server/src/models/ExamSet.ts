import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Question, QuestionModel, Option } from './Question';

// 试题集接口
export interface ExamSet {
  exam_set_id: number;
  exam_name: string;
  year: string;
  description?: string;
  questions?: Question[];
}

// 分页接口
export interface Pagination {
  page: number;
  limit: number;
}

// 试题集模型类
export class ExamSetModel {
  /**
   * 获取试题集列表，支持分页和筛选
   */
  static async getExamSets(pagination: Pagination, year?: string): Promise<{ exam_sets: ExamSet[], total: number }> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // 构建查询条件
      let whereClause = '';
      const queryParams: any[] = [];

      if (year) {
        whereClause = 'WHERE year = ?';
        queryParams.push(year);
      }

      // 查询总数
      const [countRows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM exam_sets ${whereClause}`,
        queryParams
      );
      const total = countRows[0].total;

      // 查询分页数据
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM exam_sets ${whereClause} ORDER BY year DESC, exam_set_id DESC LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      return { exam_sets: rows as ExamSet[], total };
    } catch (error) {
      console.error('获取试题集列表失败:', error);
      throw error;
    }
  }

  /**
   * 通过ID获取试题集详情
   */
  static async getExamSetById(id: number): Promise<ExamSet | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM exam_sets WHERE exam_set_id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as ExamSet;
    } catch (error) {
      console.error('获取试题集详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取试题集中的所有题目
   */
  static async getExamSetQuestions(examSetId: number): Promise<Question[]> {
    try {
      // 直接从questions表获取该exam_set_id的所有题目
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM questions WHERE exam_set_id = ? ORDER BY question_number',
        [examSetId]
      );

      if (rows.length === 0) {
        return [];
      }

      const questions = rows as Question[];

      // 获取所有题目的选项
      for (const question of questions) {
        const [optionRows] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM options WHERE exam_set_id = ? AND question_number = ? ORDER BY option_label',
          [examSetId, question.question_number]
        );
        question.options = optionRows as any[];
      }

      return questions;
    } catch (error) {
      console.error('获取试题集题目失败:', error);
      throw error;
    }
  }
}