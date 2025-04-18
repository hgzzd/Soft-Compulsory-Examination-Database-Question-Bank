import api from './api';
import { Question } from './questionService';

// 答题记录接口定义
export interface AnswerRecord {
  record_id: number;
  user_id: number;
  question_id: number;
  exam_set_id?: number;
  selected_option?: string;
  is_correct: boolean;
  created_at: string;
  question?: Question;
}

export interface RecordFilters {
  page?: number;
  limit?: number;
  exam_set_id?: number;
  is_correct?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface RecordStats {
  total_answered: number;
  correct_count: number;
  incorrect_count: number;
  accuracy_rate: number;
  daily_stats?: {
    date: string;
    answered_count: number;
    correct_count: number;
  }[];
}

// 答题记录服务
export default {
  /**
   * 提交答题记录
   */
  async submitAnswer(questionId: number, selectedOption: string, examSetId?: number) {
    return await api.post('/records', {
      question_id: questionId,
      selected_option: selectedOption,
      ...(examSetId && { exam_set_id: examSetId })
    });
  },
  
  /**
   * 获取用户答题记录
   */
  async getRecords(filters: RecordFilters = {}) {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.exam_set_id && { exam_set_id: filters.exam_set_id }),
      ...(filters.is_correct !== undefined && { is_correct: filters.is_correct }),
      ...(filters.date_from && { date_from: filters.date_from }),
      ...(filters.date_to && { date_to: filters.date_to })
    };
    
    return await api.get('/records', { params });
  },
  
  /**
   * 获取某道题目的答题历史
   */
  async getQuestionRecords(questionId: number) {
    return await api.get(`/records/question/${questionId}`);
  },
  
  /**
   * 获取某个考试集的答题记录
   */
  async getExamSetRecords(examSetId: number) {
    return await api.get(`/records/exam-set/${examSetId}`);
  },
  
  /**
   * 获取答题统计信息
   */
  async getRecordStats(dateFrom?: string, dateTo?: string): Promise<RecordStats> {
    const params = {
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo })
    };
    
    const response = await api.get('/records/stats', { params });
    return response.data;
  },
  
  /**
   * 获取今日答题统计
   */
  async getTodayStats(): Promise<{
    answered_count: number;
    correct_count: number;
    accuracy_rate: number;
  }> {
    const response = await api.get('/records/today');
    return response.data;
  }
}; 