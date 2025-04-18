import api from './api';

// 学习进度类型
export interface Progress {
  progress_id: number;
  user_id: number;
  category: string; 
  completed_materials: number;
  total_materials: number;
  completed_questions: number;
  total_questions: number;
  completion_rate: number;
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  last_activity_time: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryProgress {
  category: string;
  completion_rate: number;
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  total_time_spent: number; // 单位：分钟
  last_activity_time: string;
}

export interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  streak_days: { date: string; activity_count: number }[];
}

export interface ActivityLog {
  activity_id: number;
  user_id: number;
  activity_type: 'material_view' | 'question_answer' | 'assessment_complete';
  target_id: number;
  target_type: 'material' | 'question' | 'assessment';
  result?: 'correct' | 'incorrect' | 'completed';
  time_spent: number; // 单位：秒
  created_at: string;
}

export interface UserGoal {
  goal_id: number;
  user_id: number;
  goal_type: 'daily_activity' | 'completion_rate' | 'mastery_level';
  target_value: number | string;
  current_value: number | string;
  start_date: string;
  target_date: string;
  status: 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

// 学习进度服务
export default {
  /**
   * 获取用户总体学习进度
   */
  async getOverallProgress(): Promise<Progress> {
    const response = await api.get('/progress/overall');
    return response.data;
  },
  
  /**
   * 获取各分类学习进度
   */
  async getCategoryProgress(): Promise<CategoryProgress[]> {
    const response = await api.get('/progress/categories');
    return response.data;
  },
  
  /**
   * 获取特定分类的学习进度
   */
  async getCategoryProgressDetail(category: string): Promise<Progress> {
    const response = await api.get(`/progress/categories/${category}`);
    return response.data;
  },
  
  /**
   * 获取用户学习连续天数信息
   */
  async getLearningStreak(): Promise<LearningStreak> {
    const response = await api.get('/progress/streak');
    return response.data;
  },
  
  /**
   * 获取学习活动日志
   */
  async getActivityLogs(page: number = 1, limit: number = 20): Promise<{ items: ActivityLog[], total: number }> {
    const params = { page, limit };
    const response = await api.get('/progress/activity-logs', { params });
    return response.data;
  },
  
  /**
   * 记录学习活动
   */
  async logActivity(activity: Omit<ActivityLog, 'activity_id' | 'user_id' | 'created_at'>): Promise<ActivityLog> {
    const response = await api.post('/progress/log-activity', activity);
    return response.data;
  },
  
  /**
   * 获取学习时间统计
   */
  async getLearningTimeStats(period: 'day' | 'week' | 'month' | 'year' = 'week') {
    const params = { period };
    const response = await api.get('/progress/time-stats', { params });
    return response.data;
  },
  
  /**
   * 获取用户设定的学习目标
   */
  async getUserGoals(): Promise<UserGoal[]> {
    const response = await api.get('/progress/goals');
    return response.data;
  },
  
  /**
   * 创建新的学习目标
   */
  async createGoal(goal: Omit<UserGoal, 'goal_id' | 'user_id' | 'current_value' | 'status' | 'created_at' | 'updated_at'>): Promise<UserGoal> {
    const response = await api.post('/progress/goals', goal);
    return response.data;
  },
  
  /**
   * 更新学习目标
   */
  async updateGoal(goalId: number, updates: Partial<UserGoal>): Promise<UserGoal> {
    const response = await api.put(`/progress/goals/${goalId}`, updates);
    return response.data;
  },
  
  /**
   * 删除学习目标
   */
  async deleteGoal(goalId: number): Promise<void> {
    await api.delete(`/progress/goals/${goalId}`);
  },
  
  /**
   * 获取学习建议
   */
  async getLearningRecommendations() {
    const response = await api.get('/progress/recommendations');
    return response.data;
  },
  
  /**
   * 获取下一步学习建议
   */
  async getNextLearningSteps() {
    const response = await api.get('/progress/next-steps');
    return response.data;
  },
  
  /**
   * 获取学习弱点分析
   */
  async getWeaknessAnalysis() {
    const response = await api.get('/progress/weakness-analysis');
    return response.data;
  },
  
  /**
   * 获取学习进度报告（周期性报告）
   */
  async getProgressReport(period: 'week' | 'month' = 'week') {
    const params = { period };
    const response = await api.get('/progress/report', { params });
    return response.data;
  }
}; 