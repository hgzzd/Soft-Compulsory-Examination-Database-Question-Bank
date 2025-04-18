<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard, ElButton, ElInput, ElTag, ElPagination, ElSkeleton, ElEmpty, ElMessage } from 'element-plus'
import { Search, Star, View, ThumbUp, Calendar } from '@element-plus/icons-vue'
import { studyMaterialService, type StudyMaterial } from '@/services/studyMaterialService'

const router = useRouter()
const isLoading = ref(true)
const materials = ref<StudyMaterial[]>([])
const totalCount = ref(0)
const searchText = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(12)

// 加载收藏材料
const loadFavoriteMaterials = async () => {
  isLoading.value = true
  try {
    const result = await studyMaterialService.getFavoriteMaterials({
      searchText: searchText.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    materials.value = result.items
    totalCount.value = result.total
  } catch (error) {
    ElMessage.error('获取收藏材料失败')
    console.error('Failed to load favorite materials:', error)
  } finally {
    isLoading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadFavoriteMaterials()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadFavoriteMaterials()
}

// 跳转到详情页
const navigateToDetail = (materialId: string) => {
  router.push(`/materials/${materialId}`)
}

// 取消收藏
const removeFavorite = async (material: StudyMaterial, event: Event) => {
  event.stopPropagation()
  try {
    await studyMaterialService.toggleFavorite(material.id, false)
    
    // 从列表中移除
    materials.value = materials.value.filter(m => m.id !== material.id)
    totalCount.value--
    
    ElMessage.success('已取消收藏')
  } catch (error) {
    ElMessage.error('操作失败，请稍后再试')
    console.error('Failed to remove favorite:', error)
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
  loadFavoriteMaterials()
})
</script>

<template>
  <div class="favorite-materials-container">
    <h1 class="page-title">我的收藏</h1>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <ElInput
        v-model="searchText"
        placeholder="搜索收藏的学习资料..."
        prefix-icon="Search"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <ElButton :icon="Search" @click="handleSearch" />
        </template>
      </ElInput>
    </div>
    
    <!-- 材料列表 -->
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
          <ElEmpty description="暂无收藏的学习资料" />
          <ElButton type="primary" @click="router.push('/materials')" style="margin-top: 15px">
            去浏览学习资料
          </ElButton>
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
                  type="warning"
                  :icon="Star"
                  size="small"
                  @click="(e) => removeFavorite(material, e)"
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
</template>

<style scoped>
.favorite-materials-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.search-bar {
  margin-bottom: 20px;
  max-width: 500px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 768px) {
  .materials-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style> 