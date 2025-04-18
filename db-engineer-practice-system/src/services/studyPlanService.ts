import api from './api';

// 学习计划接口定义
export interface StudyPlan {
  plan_id: number;
  user_id: number;
  title: string;
  start_date: string;
  end_date: string;
  days_per_week: number;
  questions_per_day: number;
  focus_categories?: string[];
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
  progress?: number;
}

export interface StudyPlanFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'paused';
}

export interface CreatePlanParams {
  title: string;
  start_date: string;
  end_date: string;
  days_per_week: number;
  questions_per_day: number;
  focus_categories?: string[];
}

export interface StudyPlanProgress {
  plan_id: number;
  completed_days: number;
  total_days: number;
  completed_questions: number;
  total_questions: number;
  progress_percentage: number;
  daily_progress: {
    date: string;
    completed: boolean;
    questions_completed: number;
  }[];
}

// 学习计划服务
export default {
  /**
   * 获取用户学习计划列表
   */
  async getPlans(filters: StudyPlanFilters = {}) {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.status && { status: filters.status })
    };
    
    return await api.get('/study-plans', { params });
  },
  
  /**
   * 创建新的学习计划
   */
  async createPlan(planData: CreatePlanParams) {
    return await api.post('/study-plans', planData);
  },
  
  /**
   * 获取单个学习计划详情
   */
  async getPlanById(planId: number): Promise<StudyPlan> {
    const response = await api.get(`/study-plans/${planId}`);
    return response.data;
  },
  
  /**
   * 更新学习计划
   */
  async updatePlan(planId: number, updates: Partial<CreatePlanParams>) {
    return await api.put(`/study-plans/${planId}`, updates);
  },
  
  /**
   * 暂停学习计划
   */
  async pausePlan(planId: number) {
    return await api.put(`/study-plans/${planId}/status`, { status: 'paused' });
  },
  
  /**
   * 重新激活学习计划
   */
  async activatePlan(planId: number) {
    return await api.put(`/study-plans/${planId}/status`, { status: 'active' });
  },
  
  /**
   * 完成学习计划
   */
  async completePlan(planId: number) {
    return await api.put(`/study-plans/${planId}/status`, { status: 'completed' });
  },
  
  /**
   * 获取学习计划进度
   */
  async getPlanProgress(planId: number): Promise<StudyPlanProgress> {
    const response = await api.get(`/study-plans/${planId}/progress`);
    return response.data;
  },
  
  /**
   * 获取今日学习计划建议
   */
  async getTodayPlan(): Promise<{
    plan_id?: number;
    plan_title?: string;
    target_questions: number;
    completed_questions: number;
    recommended_categories?: string[];
    recommended_questions?: number[];
  }> {
    const response = await api.get('/study-plans/today');
    return response.data;
  }
}; 