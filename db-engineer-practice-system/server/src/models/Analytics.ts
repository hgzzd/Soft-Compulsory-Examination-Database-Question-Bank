import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

// 学习概览接口
export interface OverviewData {
  total_practice: number;
  total_answered: number;
  total_correct: number;
  accuracy_rate: number;
  total_wrong_questions: number;
  total_favorites: number;
}

// 学习进度接口
export interface ProgressData {
  daily_activity: {
    date: string;
    practice_count: number;
    question_count: number;
    correct_count: number;
  }[];
  weekly_summary: {
    week: string;
    total_practice: number;
    total_questions: number;
    correct_ratio: number;
  }[];
}

// 知识点掌握度接口
export interface KnowledgePointData {
  knowledge_points: {
    name: string;
    total_questions: number;
    correct_count: number;
    mastery_level: number;
  }[];
}

// 题型分布接口
export interface QuestionTypeData {
  question_types: {
    type: string;
    count: number;
    correct_count: number;
    accuracy_rate: number;
  }[];
}

// 分析模型类
export class AnalyticsModel {
  /**
   * 获取学习概览数据
   */
  static async getOverviewData(userId: number): Promise<OverviewData> {
    try {
      // 获取练习和答题数据
      const [practiceResults] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(DISTINCT pr.id) as total_practice,
          (SELECT COUNT(*) FROM answer_records ar JOIN practice_records pr ON ar.practice_id = pr.id WHERE pr.user_id = ?) as total_answered,
          (SELECT COUNT(*) FROM answer_records ar JOIN practice_records pr ON ar.practice_id = pr.id WHERE pr.user_id = ? AND ar.is_correct = 1) as total_correct
         FROM practice_records pr
         WHERE pr.user_id = ?`,
        [userId, userId, userId]
      );

      // 获取错题和收藏数据
      const [wrongAndFavResults] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          (SELECT COUNT(*) FROM wrong_questions wq WHERE wq.user_id = ?) as total_wrong_questions,
          (SELECT COUNT(*) FROM user_favorites uf WHERE uf.user_id = ?) as total_favorites`,
        [userId, userId]
      );

      const practiceData = practiceResults[0] || {};
      const wrongAndFavData = wrongAndFavResults[0] || {};

      const total_practice = practiceData.total_practice || 0;
      const total_answered = practiceData.total_answered || 0;
      const total_correct = practiceData.total_correct || 0;
      const accuracy_rate = total_answered > 0 ? (total_correct / total_answered) * 100 : 0;
      const total_wrong_questions = wrongAndFavData.total_wrong_questions || 0;
      const total_favorites = wrongAndFavData.total_favorites || 0;

      return {
        total_practice,
        total_answered,
        total_correct,
        accuracy_rate,
        total_wrong_questions,
        total_favorites
      };
    } catch (error) {
      console.error('获取学习概览数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习进度数据
   */
  static async getProgressData(userId: number): Promise<ProgressData> {
    try {
      // 获取每日活动数据
      const [dailyActivity] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          DATE(ar.created_at) as date,
          COUNT(DISTINCT ar.practice_id) as practice_count,
          COUNT(*) as question_count,
          SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
         FROM answer_records ar
         JOIN practice_records pr ON ar.practice_id = pr.id
         WHERE pr.user_id = ?
         GROUP BY DATE(ar.created_at)
         ORDER BY date DESC
         LIMIT 14`, // 最近14天的数据
        [userId]
      );

      // 获取每周总结数据
      const [weeklySummary] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          CONCAT(YEAR(ar.created_at), '-', WEEK(ar.created_at)) as week,
          COUNT(DISTINCT ar.practice_id) as total_practice,
          COUNT(*) as total_questions,
          SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*) as correct_ratio
         FROM answer_records ar
         JOIN practice_records pr ON ar.practice_id = pr.id
         WHERE pr.user_id = ?
         GROUP BY week
         ORDER BY MIN(ar.created_at) DESC
         LIMIT 8`, // 最近8周的数据
        [userId]
      );

      return {
        daily_activity: dailyActivity.map((item: any) => ({
          date: item.date.toISOString().split('T')[0],
          practice_count: item.practice_count || 0,
          question_count: item.question_count || 0,
          correct_count: item.correct_count || 0
        })),
        weekly_summary: weeklySummary.map((item: any) => ({
          week: item.week,
          total_practice: item.total_practice || 0,
          total_questions: item.total_questions || 0,
          correct_ratio: item.correct_ratio || 0
        }))
      };
    } catch (error) {
      console.error('获取学习进度数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取知识点掌握度数据
   */
  static async getKnowledgePointsData(userId: number): Promise<KnowledgePointData> {
    try {
      // 假设exam_set_id可以作为知识点的代表
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          es.exam_name as name,
          COUNT(DISTINCT q.question_id) as total_questions,
          SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
          SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(DISTINCT q.question_id) as mastery_level
         FROM answer_records ar
         JOIN practice_records pr ON ar.practice_id = pr.id
         JOIN questions q ON ar.question_id = q.question_id
         JOIN exam_sets es ON q.exam_set_id = es.exam_set_id
         WHERE pr.user_id = ?
         GROUP BY es.exam_set_id, es.exam_name
         ORDER BY total_questions DESC`,
        [userId]
      );

      return {
        knowledge_points: rows.map((item: any) => ({
          name: item.name,
          total_questions: item.total_questions || 0,
          correct_count: item.correct_count || 0,
          mastery_level: item.mastery_level || 0
        }))
      };
    } catch (error) {
      console.error('获取知识点掌握度数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取题型分布数据
   */
  static async getQuestionTypesData(userId: number): Promise<QuestionTypeData> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          q.question_type as type,
          COUNT(*) as count,
          SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
          SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*) as accuracy_rate
         FROM answer_records ar
         JOIN practice_records pr ON ar.practice_id = pr.id
         JOIN questions q ON ar.question_id = q.question_id
         WHERE pr.user_id = ?
         GROUP BY q.question_type`,
        [userId]
      );

      return {
        question_types: rows.map((item: any) => ({
          type: item.type,
          count: item.count || 0,
          correct_count: item.correct_count || 0,
          accuracy_rate: item.accuracy_rate || 0
        }))
      };
    } catch (error) {
      console.error('获取题型分布数据失败:', error);
      throw error;
    }
  }
} 