import api from './api';

// 学习资料类型
export interface StudyMaterial {
  material_id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  author: string;
  view_count: number;
  like_count: number;
  estimated_time: number; // 预计阅读时间（分钟）
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface MaterialComment {
  comment_id: number;
  material_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialNote {
  note_id: number;
  material_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialFilters {
  category?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  tags?: string[];
  searchTerm?: string;
}

// 学习资料服务
export default {
  /**
   * 获取学习资料列表
   */
  async getMaterials(filters: MaterialFilters = {}, page: number = 1, limit: number = 20): Promise<{ items: StudyMaterial[], total: number }> {
    const params = { ...filters, page, limit };
    const response = await api.get('/materials', { params });
    return response.data;
  },

  /**
   * 获取学习资料详情
   */
  async getMaterialById(id: number): Promise<StudyMaterial> {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },

  /**
   * 获取推荐学习资料
   */
  async getRecommendedMaterials(limit: number = 5): Promise<StudyMaterial[]> {
    const params = { limit };
    const response = await api.get('/materials/recommended', { params });
    return response.data;
  },

  /**
   * 记录学习资料浏览
   */
  async recordMaterialView(materialId: number): Promise<void> {
    await api.post(`/materials/${materialId}/view`);
  },

  /**
   * 点赞学习资料
   */
  async likeMaterial(materialId: number): Promise<void> {
    await api.post(`/materials/${materialId}/like`);
  },

  /**
   * 取消点赞学习资料
   */
  async unlikeMaterial(materialId: number): Promise<void> {
    await api.delete(`/materials/${materialId}/like`);
  },

  /**
   * 获取学习资料评论
   */
  async getMaterialComments(materialId: number, page: number = 1, limit: number = 20): Promise<{ items: MaterialComment[], total: number }> {
    const params = { page, limit };
    const response = await api.get(`/materials/${materialId}/comments`, { params });
    return response.data;
  },

  /**
   * 添加学习资料评论
   */
  async addMaterialComment(materialId: number, content: string): Promise<MaterialComment> {
    const response = await api.post(`/materials/${materialId}/comments`, { content });
    return response.data;
  },

  /**
   * 获取我的学习笔记
   */
  async getMaterialNotes(materialId: number): Promise<MaterialNote[]> {
    const response = await api.get(`/materials/${materialId}/notes`);
    return response.data;
  },

  /**
   * 添加学习笔记
   */
  async addMaterialNote(materialId: number, content: string): Promise<MaterialNote> {
    const response = await api.post(`/materials/${materialId}/notes`, { content });
    return response.data;
  },

  /**
   * 更新学习笔记
   */
  async updateMaterialNote(noteId: number, content: string): Promise<MaterialNote> {
    const response = await api.put(`/materials/notes/${noteId}`, { content });
    return response.data;
  },

  /**
   * 删除学习笔记
   */
  async deleteMaterialNote(noteId: number): Promise<void> {
    await api.delete(`/materials/notes/${noteId}`);
  },

  /**
   * 获取学习资料的相关问题
   */
  async getMaterialRelatedQuestions(materialId: number): Promise<any[]> {
    const response = await api.get(`/materials/${materialId}/related-questions`);
    return response.data;
  },

  /**
   * 获取收藏的学习资料
   */
  async getFavoriteMaterials(page: number = 1, limit: number = 20): Promise<{ items: StudyMaterial[], total: number }> {
    const params = { page, limit };
    const response = await api.get('/materials/favorites', { params });
    return response.data;
  },

  /**
   * 收藏学习资料
   */
  async favoriteMaterial(materialId: number): Promise<void> {
    await api.post(`/materials/${materialId}/favorite`);
  },

  /**
   * 取消收藏学习资料
   */
  async unfavoriteMaterial(materialId: number): Promise<void> {
    await api.delete(`/materials/${materialId}/favorite`);
  },

  /**
   * 获取最近浏览的学习资料
   */
  async getRecentlyViewedMaterials(limit: number = 10): Promise<StudyMaterial[]> {
    const params = { limit };
    const response = await api.get('/materials/recently-viewed', { params });
    return response.data;
  },

  /**
   * 获取学习资料的阅读进度
   */
  async getMaterialReadingProgress(materialId: number): Promise<{ progress: number }> {
    const response = await api.get(`/materials/${materialId}/reading-progress`);
    return response.data;
  },

  /**
   * 更新学习资料阅读进度
   */
  async updateMaterialReadingProgress(materialId: number, progress: number): Promise<void> {
    await api.post(`/materials/${materialId}/reading-progress`, { progress });
  }
};