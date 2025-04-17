<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard, ElButton, ElInput, ElSelect, ElOption, ElTag, ElTree, ElPagination, ElSkeleton, ElEmpty, ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useExerciseStore } from '../../stores/exerciseStore'

const router = useRouter()
const exerciseStore = useExerciseStore()

// Loading states
const isLoading = computed(() => exerciseStore.isLoading)
const isLoadingChapters = ref(true)

// Filter states
const filters = reactive({
  chapterId: '',
  difficulty: '',
  tag: '',
  searchText: '',
  onlyFavorites: false
})

// Chapters tree data
const chaptersData = computed(() => exerciseStore.chapters)

// Tags cloud
const availableTags = ref(['SQL', '数据模型', '数据库设计', 'ER图', '关系代数', '范式', '存储过程', '索引', '事务', '并发控制'])

// Selected chapter path
const selectedChapterPath = ref<string[]>([])

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Questions list
const filteredQuestions = computed(() => {
  let questions = [...exerciseStore.questions]
  
  // Apply filters
  if (filters.chapterId) {
    questions = questions.filter(q => q.chapterId === filters.chapterId)
  }
  
  if (filters.difficulty) {
    questions = questions.filter(q => q.difficulty === filters.difficulty)
  }
  
  if (filters.tag) {
    questions = questions.filter(q => q.tags.includes(filters.tag))
  }
  
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase()
    questions = questions.filter(q => 
      q.title.toLowerCase().includes(searchLower) || 
      q.content.toLowerCase().includes(searchLower)
    )
  }
  
  if (filters.onlyFavorites) {
    questions = questions.filter(q => exerciseStore.favoriteQuestions.has(q.id))
  }
  
  return questions
})

// Paginated questions
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuestions.value.slice(start, end)
})

// Total questions count
const totalQuestions = computed(() => filteredQuestions.value.length)

// Handler for chapter selection
const handleChapterSelect = (data: any, node: any) => {
  filters.chapterId = data.id
  selectedChapterPath.value = node.path.map((n: any) => n.label)
}

// Handler for difficulty selection
const handleDifficultyChange = (value: string) => {
  filters.difficulty = value
  currentPage.value = 1
}

// Handler for tag selection
const handleTagSelect = (tag: string) => {
  filters.tag = filters.tag === tag ? '' : tag
  currentPage.value = 1
}

// Handler for favorites toggle
const handleFavoritesToggle = () => {
  filters.onlyFavorites = !filters.onlyFavorites
  currentPage.value = 1
}

// Handler for search
const handleSearch = () => {
  currentPage.value = 1
}

// Handler for page change
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Handler for favorites toggle
const toggleFavorite = (questionId: string) => {
  exerciseStore.toggleFavorite(questionId)
}

// Navigation to question detail
const navigateToQuestion = (questionId: string) => {
  router.push(`/exercise/${questionId}`)
}

// Start a new exercise
const startExercise = () => {
  // Check if we have questions
  if (filteredQuestions.value.length === 0) {
    ElMessage.warning('没有可用的题目，请调整筛选条件')
    return
  }
  
  // Get selected question IDs
  const questionIds = filteredQuestions.value.map(q => q.id)
  
  // Start the exercise
  const questionCount = exerciseStore.startExercise({
    questionIds: questionIds,
    chapterId: filters.chapterId,
    timeLimit: 3600 // 1 hour in seconds
  })
  
  if (questionCount > 0) {
    // Navigate to the first question
    router.push(`/exercise/${questionIds[0]}`)
  } else {
    ElMessage.error('启动练习失败，请稍后再试')
  }
}

// Reset filters
const resetFilters = () => {
  filters.chapterId = ''
  filters.difficulty = ''
  filters.tag = ''
  filters.searchText = ''
  filters.onlyFavorites = false
  selectedChapterPath.value = []
  currentPage.value = 1
}

// Fetch data on component mount
onMounted(async () => {
  // Fetch chapters
  if (exerciseStore.chapters.length === 0) {
    await exerciseStore.fetchChapters()
  }
  isLoadingChapters.value = false
  
  // Fetch questions
  if (exerciseStore.questions.length === 0) {
    await exerciseStore.fetchQuestions()
  }
})

// Watch for filter changes to reset page
watch([
  () => filters.chapterId,
  () => filters.difficulty,
  () => filters.tag,
  () => filters.onlyFavorites
], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="exercise-list-container">
    <h1 class="page-title">题库练习</h1>
    
    <div class="exercise-layout">
      <!-- Filters sidebar -->
      <div class="filters-sidebar">
        <ElCard class="filters-card">
          <template #header>
            <div class="card-header">
              <span>筛选条件</span>
              <ElButton type="text" @click="resetFilters">重置</ElButton>
            </div>
          </template>
          
          <!-- Chapter tree selector -->
          <div class="filter-section">
            <h3 class="filter-title">章节</h3>
            <ElSkeleton :loading="isLoadingChapters" animated>
              <template #template>
                <div style="padding: 10px">
                  <ElSkeleton.Item variant="text" style="width: 100%" />
                  <ElSkeleton.Item variant="text" style="width: 90%" />
                  <ElSkeleton.Item variant="text" style="width: 95%" />
                  <ElSkeleton.Item variant="text" style="width: 85%" />
                </div>
              </template>
              
              <template #default>
                <ElTree
                  :data="chaptersData"
                  node-key="id"
                  :expand-on-click-node="false"
                  :default-expand-all="true"
                  @node-click="handleChapterSelect"
                >
                  <template #default="{ node, data }">
                    <span class="chapter-node">{{ node.label }}</span>
                  </template>
                </ElTree>
              </template>
            </ElSkeleton>
            
            <div class="selected-path" v-if="selectedChapterPath.length > 0">
              已选: {{ selectedChapterPath.join(' > ') }}
            </div>
          </div>
          
          <!-- Difficulty selector -->
          <div class="filter-section">
            <h3 class="filter-title">难度</h3>
            <ElSelect
              v-model="filters.difficulty"
              placeholder="选择难度"
              clearable
              style="width: 100%"
              @change="handleDifficultyChange"
            >
              <ElOption label="简单" value="easy">
                <ElTag type="success">简单</ElTag>
              </ElOption>
              <ElOption label="中等" value="medium">
                <ElTag type="warning">中等</ElTag>
              </ElOption>
              <ElOption label="困难" value="hard">
                <ElTag type="danger">困难</ElTag>
              </ElOption>
            </ElSelect>
          </div>
          
          <!-- Tags cloud -->
          <div class="filter-section">
            <h3 class="filter-title">知识点</h3>
            <div class="tags-cloud">
              <ElTag
                v-for="tag in availableTags"
                :key="tag"
                :type="filters.tag === tag ? 'primary' : ''"
                effect="plain"
                class="tag-item"
                @click="handleTagSelect(tag)"
              >
                {{ tag }}
              </ElTag>
            </div>
          </div>
          
          <!-- Favorites filter -->
          <div class="filter-section">
            <ElButton
              :type="filters.onlyFavorites ? 'primary' : ''"
              :icon="filters.onlyFavorites ? 'Star' : 'StarFilled'"
              @click="handleFavoritesToggle"
              class="favorites-button"
            >
              {{ filters.onlyFavorites ? '全部题目' : '只看收藏' }}
            </ElButton>
          </div>
        </ElCard>
      </div>
      
      <!-- Questions list -->
      <div class="questions-content">
        <ElCard class="search-card">
          <div class="search-bar">
            <ElInput
              v-model="filters.searchText"
              placeholder="搜索题目..."
              clearable
              @keyup.enter="handleSearch"
            >
              <template #suffix>
                <ElButton :icon="Search" circle @click="handleSearch"></ElButton>
              </template>
            </ElInput>
          </div>
          
          <div class="questions-actions">
            <ElButton type="primary" @click="startExercise">
              开始练习
            </ElButton>
          </div>
        </ElCard>
        
        <div class="questions-list">
          <ElSkeleton :loading="isLoading" animated :count="5">
            <template #template>
              <div style="margin-bottom: 16px">
                <ElSkeleton.Item variant="p" style="width: 100%" />
                <ElSkeleton.Item variant="text" style="width: 80%" />
                <ElSkeleton.Item variant="text" style="width: 60%" />
              </div>
            </template>
            
            <template #default>
              <div v-if="paginatedQuestions.length === 0" class="empty-state">
                <ElEmpty description="没有找到符合条件的题目" />
              </div>
              
              <ElCard 
                v-for="question in paginatedQuestions" 
                :key="question.id"
                class="question-card"
                @click="navigateToQuestion(question.id)"
              >
                <div class="question-header">
                  <h3 class="question-title">{{ question.title }}</h3>
                  <div class="question-actions">
                    <ElButton
                      circle
                      :icon="exerciseStore.favoriteQuestions.has(question.id) ? 'StarFilled' : 'Star'"
                      @click.stop="toggleFavorite(question.id)"
                    ></ElButton>
                  </div>
                </div>
                
                <div class="question-content">
                  {{ question.content.length > 100 
                    ? question.content.substring(0, 100) + '...' 
                    : question.content 
                  }}
                </div>
                
                <div class="question-footer">
                  <ElTag 
                    :type="
                      question.difficulty === 'easy' ? 'success' : 
                      question.difficulty === 'medium' ? 'warning' : 'danger'
                    "
                    size="small"
                  >
                    {{ 
                      question.difficulty === 'easy' ? '简单' : 
                      question.difficulty === 'medium' ? '中等' : '困难' 
                    }}
                  </ElTag>
                  
                  <div class="question-tags">
                    <ElTag 
                      v-for="tag in question.tags" 
                      :key="tag"
                      size="small"
                      effect="plain"
                    >
                      {{ tag }}
                    </ElTag>
                  </div>
                </div>
              </ElCard>
              
              <div class="pagination-container" v-if="totalQuestions > 0">
                <ElPagination
                  v-model:currentPage="currentPage"
                  :page-size="pageSize"
                  :total="totalQuestions"
                  layout="prev, pager, next, jumper"
                  @current-change="handlePageChange"
                ></ElPagination>
              </div>
            </template>
          </ElSkeleton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.page-title {
  font-size: var(--font-size-xxl);
  margin-bottom: var(--spacing-lg);
  color: var(--color-primary);
}

.exercise-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-lg);
}

.filters-sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
}

.filters-card {
  margin-bottom: var(--spacing-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  margin-bottom: var(--spacing-md);
}

.filter-title {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-sm);
  color: var(--color-primary);
}

.chapter-node {
  font-size: var(--font-size-sm);
}

.selected-path {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag-item {
  cursor: pointer;
  margin-bottom: var(--spacing-xs);
}

.favorites-button {
  width: 100%;
}

.search-card {
  margin-bottom: var(--spacing-md);
}

.search-bar {
  margin-bottom: var(--spacing-md);
}

.questions-actions {
  display: flex;
  justify-content: flex-end;
}

.questions-list {
  margin-top: var(--spacing-md);
}

.question-card {
  margin-bottom: var(--spacing-md);
  transition: box-shadow 0.3s, transform 0.3s;
  cursor: pointer;
}

.question-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.question-title {
  font-size: var(--font-size-lg);
  margin: 0;
  color: var(--color-primary);
  flex: 1;
}

.question-actions {
  margin-left: var(--spacing-sm);
}

.question-content {
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
  line-height: 1.6;
}

.question-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.question-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}

.empty-state {
  padding: var(--spacing-xl) 0;
}

/* Responsive styles */
@media (max-width: 1199.98px) {
  .exercise-layout {
    grid-template-columns: 250px 1fr;
    gap: var(--spacing-md);
  }
}

@media (max-width: 767.98px) {
  .exercise-layout {
    grid-template-columns: 1fr;
  }
  
  .filters-sidebar {
    position: static;
  }
}
</style> 