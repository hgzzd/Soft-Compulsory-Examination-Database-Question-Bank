import api from './api';

// 题目相关类型定义
export interface Option {
  exam_set_id: number;
  question_number: number;
  option_label: string;
  option_content: string;
}

export interface Question {
  question_id: number;
  exam_set_id: number;
  question_number: number;
  content: string;
  question_type: 'single_choice' | 'multiple_choice';
  correct_answer: string;
  options?: Option[];
}

export interface ExamSet {
  exam_set_id: number;
  exam_name: string;
  year: string;
  description?: string;
  questions?: Question[];
}

export interface QuestionFilters {
  exam_set_id?: number;
  question_type?: string;
  page?: number;
  limit?: number;
}

// 题目服务
export default {
  /**
   * 获取题目列表
   */
  async getQuestions(filters: QuestionFilters = {}) {
    // 构建查询参数
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.exam_set_id && { exam_set_id: filters.exam_set_id }),
      ...(filters.question_type && { question_type: filters.question_type })
    };

    return await api.get('/questions', { params });
  },

  /**
   * 获取题目详情
   */
  async getQuestionById(id: number) {
    return await api.get(`/questions/${id}`);
  },

  /**
   * 获取试题集列表
   */
  async getExamSets(page = 1, limit = 10, year?: string) {
    const params = { page, limit, ...(year && { year }) };
    return await api.get('/exam-sets', { params });
  },

  /**
   * 获取试题集详情
   */
  async getExamSetById(id: number) {
    return await api.get(`/exam-sets/${id}`);
  },

  /**
   * 获取试题集中的所有题目
   */
  async getExamSetQuestions(examSetId: number) {
    return await api.get(`/exam-sets/${examSetId}/questions`);
  },

  /**
   * 随机获取题目
   */
  async getRandomQuestions(count = 10, filters: QuestionFilters = {}) {
    const params = {
      count,
      ...(filters.exam_set_id && { exam_set_id: filters.exam_set_id }),
      ...(filters.question_type && { question_type: filters.question_type })
    };

    return await api.get('/questions/random', { params });
  }
}; 