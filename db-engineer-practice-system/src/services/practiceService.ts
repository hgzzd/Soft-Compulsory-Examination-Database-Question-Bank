import api from './api';

// 练习题目类型
export interface Question {
  question_id: number;
  category: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'short_answer' | 'sql';
  options?: { id: string; content: string }[];
  correct_answer?: string | string[];
  explanation?: string;
  tags: string[];
  source?: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionFilters {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'short_answer' | 'sql';
  tags?: string[];
  search?: string;
}

export interface UserAnswer {
  question_id: number;
  user_answer: string | string[];
  spent_time?: number; // 单位：秒
}

export interface QuestionResult {
  question_id: number;
  user_answer: string | string[];
  correct_answer: string | string[];
  is_correct: boolean;
  explanation: string;
  spent_time?: number;
}

export interface PracticeSession {
  session_id: number;
  start_time: string;
  end_time?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  category: string;
  total_questions: number;
  correct_questions: number;
  total_time?: number;
  questions: Question[];
  results?: QuestionResult[];
}

export interface PracticeHistory {
  history_id: number;
  session_id: number;
  category: string;
  start_time: string;
  end_time: string;
  total_questions: number;
  correct_questions: number;
  total_time: number;
  score?: number;
  accuracy: number;
}

// 练习服务
export default {
  /**
   * 获取练习题目列表
   */
  async getQuestions(filters: QuestionFilters = {}) {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      ...(filters.category && { category: filters.category }),
      ...(filters.difficulty && { difficulty: filters.difficulty }),
      ...(filters.type && { type: filters.type }),
      ...(filters.tags && { tags: filters.tags.join(',') }),
      ...(filters.search && { search: filters.search })
    };
    
    const response = await api.get('/questions', { params });
    return response.data;
  },
  
  /**
   * 获取题目详情
   */
  async getQuestionById(questionId: number): Promise<Question> {
    const response = await api.get(`/questions/${questionId}`);
    return response.data;
  },
  
  /**
   * 开始新的练习会话
   * @param category 练习类别
   * @param count 题目数量
   * @param options 其他选项（如难度、类型等）
   */
  async startPracticeSession(category: string, count: number = 10, options: any = {}): Promise<PracticeSession> {
    const params = {
      category,
      count,
      ...options
    };
    
    const response = await api.post('/practice/sessions', params);
    return response.data;
  },
  
  /**
   * 提交答案
   */
  async submitAnswer(sessionId: number, answer: UserAnswer): Promise<QuestionResult> {
    const response = await api.post(`/practice/sessions/${sessionId}/answers`, answer);
    return response.data;
  },
  
  /**
   * 完成练习会话
   */
  async completePracticeSession(sessionId: number): Promise<PracticeSession> {
    const response = await api.post(`/practice/sessions/${sessionId}/complete`);
    return response.data;
  },
  
  /**
   * 放弃练习会话
   */
  async abandonPracticeSession(sessionId: number): Promise<void> {
    await api.post(`/practice/sessions/${sessionId}/abandon`);
  },
  
  /**
   * 获取当前进行中的练习会话
   */
  async getCurrentSession(): Promise<PracticeSession | null> {
    try {
      const response = await api.get('/practice/current-session');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  /**
   * 获取练习历史记录
   */
  async getPracticeHistory(page: number = 1, limit: number = 20): Promise<{ items: PracticeHistory[], total: number }> {
    const params = { page, limit };
    const response = await api.get('/practice/history', { params });
    return response.data;
  },
  
  /**
   * 获取练习会话详情
   */
  async getSessionDetail(sessionId: number): Promise<PracticeSession> {
    const response = await api.get(`/practice/sessions/${sessionId}`);
    return response.data;
  },
  
  /**
   * 获取错题集
   */
  async getWrongQuestions(page: number = 1, limit: number = 20) {
    const params = { page, limit };
    const response = await api.get('/practice/wrong-questions', { params });
    return response.data;
  },
  
  /**
   * 收藏题目
   */
  async favoriteQuestion(questionId: number) {
    return await api.post(`/questions/${questionId}/favorite`);
  },
  
  /**
   * 取消收藏题目
   */
  async unfavoriteQuestion(questionId: number) {
    return await api.delete(`/questions/${questionId}/favorite`);
  },
  
  /**
   * 获取收藏的题目
   */
  async getFavoriteQuestions(page: number = 1, limit: number = 20) {
    const params = { page, limit };
    const response = await api.get('/user/favorite-questions', { params });
    return response.data;
  },
  
  /**
   * 获取用户练习统计数据
   */
  async getPracticeStats() {
    const response = await api.get('/practice/stats');
    return response.data;
  },
  
  /**
   * 获取推荐练习题目
   */
  async getRecommendedQuestions(limit: number = 10) {
    const params = { limit };
    const response = await api.get('/questions/recommended', { params });
    return response.data;
  }
}; 