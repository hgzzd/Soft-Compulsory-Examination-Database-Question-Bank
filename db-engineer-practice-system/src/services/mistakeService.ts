import api from './api';
import type { Question } from './questionService';

// 错题记录接口定义
export interface MistakeRecord {
  mistake_id: number;
  user_id: number;
  question_id: number;
  created_at: string;
  question?: Question;
}

export interface MistakeFilters {
  page?: number;
  limit?: number;
  exam_set_id?: number;
}

// 错题本服务
export default {
  /**
   * 获取用户的错题列表
   */
  async getMistakes(filters: MistakeFilters = {}) {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.exam_set_id && { exam_set_id: filters.exam_set_id })
    };
    
    return await api.get('/mistakes', { params });
  },
  
  /**
   * 添加题目到错题本
   */
  async addMistake(questionId: number) {
    return await api.post('/mistakes', { question_id: questionId });
  },
  
  /**
   * 从错题本中删除题目
   */
  async removeMistake(mistakeId: number) {
    return await api.delete(`/mistakes/${mistakeId}`);
  },
  
  /**
   * 检查题目是否在错题本中
   */
  async checkIsMistake(questionId: number) {
    try {
      const response = await api.get(`/mistakes/check/${questionId}`);
      return response.data.exists;
    } catch (error) {
      console.error('检查错题失败', error);
      return false;
    }
  },
  
  /**
   * 获取错题统计信息
   */
  async getMistakeStats() {
    return await api.get('/mistakes/stats');
  }
}; 