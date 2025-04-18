import api from './api';

// 学习资料类型
export interface Material {
  material_id: number;
  category: string;
  title: string;
  description: string;
  content_type: 'text' | 'pdf' | 'video' | 'link';
  content_url?: string;
  content_text?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  tags: string[];
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface MaterialFilters {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  tags?: string[];
  search?: string;
  sort_by?: 'views' | 'likes' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// 资料服务
export default {
  /**
   * 获取学习资料列表
   */
  async getMaterials(filters: MaterialFilters = {}) {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      ...(filters.category && { category: filters.category }),
      ...(filters.difficulty && { difficulty: filters.difficulty }),
      ...(filters.tags && { tags: filters.tags.join(',') }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sort_by && { sort_by: filters.sort_by }),
      ...(filters.sort_order && { sort_order: filters.sort_order })
    };
    
    return await api.get('/materials', { params });
  },
  
  /**
   * 获取学习资料详情
   */
  async getMaterialById(materialId: number): Promise<Material> {
    const response = await api.get(`/materials/${materialId}`);
    return response.data;
  },
  
  /**
   * 获取相关学习资料推荐
   */
  async getRelatedMaterials(materialId: number, limit: number = 5) {
    const params = { limit };
    const response = await api.get(`/materials/${materialId}/related`, { params });
    return response.data;
  },
  
  /**
   * 获取按分类的学习资料统计
   */
  async getMaterialStats() {
    const response = await api.get('/materials/stats');
    return response.data;
  },
  
  /**
   * 点赞学习资料
   */
  async likeMaterial(materialId: number) {
    return await api.post(`/materials/${materialId}/like`);
  },
  
  /**
   * 取消点赞学习资料
   */
  async unlikeMaterial(materialId: number) {
    return await api.delete(`/materials/${materialId}/like`);
  },
  
  /**
   * 记录资料浏览
   */
  async viewMaterial(materialId: number) {
    return await api.post(`/materials/${materialId}/view`);
  },
  
  /**
   * 获取用户收藏的学习资料
   */
  async getFavoriteMaterials(page: number = 1, limit: number = 20) {
    const params = { page, limit };
    const response = await api.get('/user/favorite-materials', { params });
    return response.data;
  },
  
  /**
   * 收藏学习资料
   */
  async favoriteMaterial(materialId: number) {
    return await api.post(`/materials/${materialId}/favorite`);
  },
  
  /**
   * 取消收藏学习资料
   */
  async unfavoriteMaterial(materialId: number) {
    return await api.delete(`/materials/${materialId}/favorite`);
  },
  
  /**
   * 获取推荐的学习资料
   * 基于用户最近学习记录、错题和学习计划
   */
  async getRecommendedMaterials(limit: number = 10) {
    const params = { limit };
    const response = await api.get('/materials/recommended', { params });
    return response.data;
  }
}; 