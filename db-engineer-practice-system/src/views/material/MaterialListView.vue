<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard, ElButton, ElInput, ElSelect, ElOption, ElTag, ElPagination, ElSkeleton, ElEmpty, ElMessage } from 'element-plus'
import { Search, Star, View, ThumbUp, Calendar } from '@element-plus/icons-vue'
import { studyMaterialService, type StudyMaterial, type MaterialFilters } from '@/services/studyMaterialService'

const router = useRouter()
const isLoading = ref(true)
const materials = ref<StudyMaterial[]>([])
const totalCount = ref(0)

// 筛选条件
const filters = reactive<MaterialFilters>({
  category: '',
  tag: '',
  searchText: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  onlyFavorites: false
})

// 分页
const currentPage = ref(1)
const pageSize = ref(12)

// 可用标签列表
const availableTags = ref(['SQL', '数据建模', 'ER图', '关系代数', '数据仓库', 'NoSQL', '性能优化', '数据治理', '事务', '并发控制'])

// 可用分类列表
const availableCategories = ref(['文章', '视频', '电子书', '教程', '文档', '案例'])

// 加载材料列表
const loadMaterials = async () => {
  isLoading.value = true
  try {
    const result = await studyMaterialService.getMaterials({
      ...filters,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    materials.value = result.items
    totalCount.value = result.total
  } catch (error) {
    ElMessage.error('获取学习材料失败')
    console.error('Failed to load materials:', error)
  } finally {
    isLoading.value = false
  }
}

// 处理分类选择
const handleCategoryChange = (value: string) => {
  filters.category = value
  currentPage.value = 1
  loadMaterials()
}

// 处理标签选择
const handleTagSelect = (tag: string) => {
  filters.tag = filters.tag === tag ? '' : tag
  currentPage.value = 1
  loadMaterials()
}

// 处理收藏过滤
const handleFavoritesToggle = () => {
  filters.onlyFavorites = !filters.onlyFavorites
  currentPage.value = 1
  loadMaterials()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadMaterials()
}

// 处理排序方式更改
const handleSortChange = (value: string) => {
  const [sortBy, sortOrder] = value.split('-')
  filters.sortBy = sortBy as 'createdAt' | 'views' | 'likes'
  filters.sortOrder = sortOrder as 'asc' | 'desc'
  loadMaterials()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadMaterials()
}

// 重置筛选条件
const resetFilters = () => {
  filters.category = ''
  filters.tag = ''
  filters.searchText = ''
  filters.sortBy = 'createdAt'
  filters.sortOrder = 'desc'
  filters.onlyFavorites = false
  currentPage.value = 1
  loadMaterials()
}

// 跳转到详情页
const navigateToDetail = (materialId: string) => {
  router.push(`/materials/${materialId}`)
}

// 收藏/取消收藏
const toggleFavorite = async (material: StudyMaterial, event: Event) => {
  event.stopPropagation()
  try {
    const isFavorited = material.isFavorited
    await studyMaterialService.toggleFavorite(material.id, !isFavorited)
    
    // 更新本地状态
    material.isFavorited = !isFavorited
    
    ElMessage.success(isFavorited ? '已取消收藏' : '已加入收藏')
  } catch (error) {
    ElMessage.error('操作失败，请稍后再试')
    console.error('Failed to toggle favorite:', error)
  }
}

// 获取难度对应的标签类型
const getDifficultyTag = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'success'
    case 'intermediate': return 'warning'
    case 'advanced': return 'danger'
    default: return 'info'
  }
}

// 获取难度对应的中文文本
const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return '初级'
    case 'intermediate': return '中级'
    case 'advanced': return '高级'
    default: return '未知'
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 初始化
onMounted(() => {
  loadMaterials()
})

// 监听筛选条件变化
watch(
  [
    () => filters.category,
    () => filters.tag,
    () => filters.onlyFavorites
  ],
  () => {
    if (isLoading.value) return
    currentPage.value = 1
    loadMaterials()
  }
)
</script>

<template>
  <div class="material-list-container">
    <h1 class="page-title">学习资料</h1>
    
    <div class="material-layout">
      <!-- 筛选侧边栏 -->
      <div class="filters-sidebar">
        <ElCard class="filters-card">
          <template #header>
            <div class="card-header">
              <span>筛选条件</span>
              <ElButton type="text" @click="resetFilters">重置</ElButton>
            </div>
          </template>
          
          <!-- 分类筛选 -->
          <div class="filter-section">
            <h3 class="filter-title">资料分类</h3>
            <ElSelect
              v-model="filters.category"
              placeholder="选择分类"
              clearable
              style="width: 100%"
              @change="handleCategoryChange"
            >
              <ElOption 
                v-for="category in availableCategories" 
                :key="category" 
                :label="category" 
                :value="category" 
              />
            </ElSelect>
          </div>
          
          <!-- 标签筛选 -->
          <div class="filter-section">
            <h3 class="filter-title">标签</h3>
            <div class="tags-cloud">
              <ElTag
                v-for="tag in availableTags"
                :key="tag"
                :effect="filters.tag === tag ? 'dark' : 'light'"
                @click="handleTagSelect(tag)"
                class="clickable-tag"
              >
                {{ tag }}
              </ElTag>
            </div>
          </div>
          
          <!-- 我的收藏 -->
          <div class="filter-section">
            <ElButton 
              :type="filters.onlyFavorites ? 'primary' : 'default'" 
              @click="handleFavoritesToggle"
              :icon="Star"
              style="width: 100%"
            >
              我的收藏
            </ElButton>
          </div>
          
          <!-- 排序 -->
          <div class="filter-section">
            <h3 class="filter-title">排序方式</h3>
            <ElSelect
              v-model="filters.sortBy + '-' + filters.sortOrder"
              style="width: 100%"
              @change="handleSortChange"
            >
              <ElOption label="最新发布" value="createdAt-desc" />
              <ElOption label="最早发布" value="createdAt-asc" />
              <ElOption label="最多浏览" value="views-desc" />
              <ElOption label="最多点赞" value="likes-desc" />
            </ElSelect>
          </div>
        </ElCard>
      </div>
      
      <!-- 资料列表 -->
      <div class="materials-content">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <ElInput
            v-model="filters.searchText"
            placeholder="搜索学习资料..."
            prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <ElButton :icon="Search" @click="handleSearch" />
            </template>
          </ElInput>
        </div>
        
        <!-- 资料卡片 -->
        <ElSkeleton :loading="isLoading" animated :count="3" :throttle="500">
          <template #template>
            <div class="materials-grid">
              <ElCard v-for="i in 6" :key="i" class="material-card-skeleton">
                <template #header>
                  <ElSkeleton.Item variant="h3" style="width: 50%" />
                </template>
                <ElSkeleton.Item variant="p" style="width: 100%" />
                <ElSkeleton.Item variant="p" style="width: 80%" />
                <div style="margin-top: 20px">
                  <ElSkeleton.Item variant="text" style="width: 30%" />
                  <ElSkeleton.Item variant="text" style="width: 30%" />
                </div>
              </ElCard>
            </div>
          </template>
          
          <template #default>
            <div v-if="materials.length === 0" class="empty-state">
              <ElEmpty description="没有找到相关学习资料" />
            </div>
            
            <div v-else class="materials-grid">
              <ElCard 
                v-for="material in materials" 
                :key="material.id" 
                class="material-card"
                shadow="hover"
                @click="navigateToDetail(material.id)"
              >
                <template #header>
                  <div class="material-header">
                    <h3 class="material-title">{{ material.title }}</h3>
                    <ElButton
                      circle
                      :type="material.isFavorited ? 'warning' : 'default'"
                      :icon="Star"
                      size="small"
                      @click="(e) => toggleFavorite(material, e)"
                    />
                  </div>
                </template>
                
                <p class="material-description">{{ material.description }}</p>
                
                <div class="material-tags">
                  <ElTag 
                    v-for="tag in material.tags" 
                    :key="tag" 
                    size="small"
                    style="margin-right: 5px; margin-bottom: 5px"
                  >
                    {{ tag }}
                  </ElTag>
                </div>
                
                <ElTag 
                  :type="getDifficultyTag(material.difficulty)" 
                  style="margin-top: 10px"
                >
                  {{ getDifficultyText(material.difficulty) }}
                </ElTag>
                
                <div class="material-meta">
                  <span class="meta-item">
                    <el-icon><View /></el-icon>
                    {{ material.views }}
                  </span>
                  <span class="meta-item">
                    <el-icon><ThumbUp /></el-icon>
                    {{ material.likes }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(material.createdAt) }}
                  </span>
                </div>
              </ElCard>
            </div>
            
            <!-- 分页 -->
            <div class="pagination-container" v-if="totalCount > 0">
              <ElPagination
                layout="prev, pager, next"
                :total="totalCount"
                v-model:current-page="currentPage"
                :page-size="pageSize"
                @current-change="handlePageChange"
              />
            </div>
          </template>
        </ElSkeleton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.material-layout {
  display: flex;
  gap: 20px;
}

.filters-sidebar {
  width: 250px;
  flex-shrink: 0;
}

.filters-card {
  position: sticky;
  top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-title {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.clickable-tag {
  cursor: pointer;
}

.materials-content {
  flex: 1;
}

.search-bar {
  margin-bottom: 20px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.material-card {
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.material-card-skeleton {
  height: 250px;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-description {
  margin-top: 5px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  height: 4.5em;
}

.material-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
}

.material-meta {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.empty-state {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .material-layout {
    flex-direction: column;
  }

  .filters-sidebar {
    width: 100%;
  }

  .materials-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style> 