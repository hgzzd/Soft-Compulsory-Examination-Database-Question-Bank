<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ElCard, ElTable, ElTableColumn, ElTag, ElEmpty, 
  ElButton, ElDivider, ElTooltip, ElDrawer, ElSkeleton 
} from 'element-plus'
import { useExerciseStore } from '../../stores/exerciseStore'

const router = useRouter()
const exerciseStore = useExerciseStore()

// 加载状态
const isLoading = ref(true)

// 历史记录
const exerciseHistory = computed(() => exerciseStore.exerciseHistory)

// 答题详情抽屉
const detailDrawerVisible = ref(false)
const selectedExercise = ref<any>(null)

// 格式化时间
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 计算时长（分钟）
const calculateDuration = (startTime: string, endTime: string | null) => {
  if (!endTime) return '-'
  
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const diffInMinutes = Math.round((end - start) / (1000 * 60))
  
  return `${diffInMinutes} 分钟`
}

// 查看练习详情
const viewExerciseDetail = (exercise: any) => {
  selectedExercise.value = exercise
  detailDrawerVisible.value = true
}

// 获取题目
const getQuestionById = (questionId: string) => {
  return exerciseStore.allQuestions.find(q => q.id === questionId) || null
}

// 获取答案的类型（正确/错误）
const getAnswerType = (answer: any) => {
  return answer.isCorrect ? 'success' : 'danger'
}

// 跳转到题目详情
const goToExerciseList = () => {
  router.push('/exercise')
}

// 获取历史记录
const fetchHistory = async () => {
  isLoading.value = true
  await exerciseStore.fetchExerciseHistory()
  isLoading.value = false
}

// 组件加载时获取历史记录
onMounted(() => {
  fetchHistory()
})
</script>

<template>
  <div class="history-container">
    <h1 class="page-title">练习历史</h1>
    
    <!-- 加载状态 -->
    <ElSkeleton 
      :loading="isLoading" 
      animated 
      :rows="6" 
      :throttle="500"
    >
      <!-- 历史记录列表 -->
      <ElCard v-if="exerciseHistory.length > 0" class="history-card">
        <ElTable 
          :data="exerciseHistory" 
          style="width: 100%" 
          stripe
          @row-click="viewExerciseDetail"
        >
          <ElTableColumn label="开始时间" min-width="160">
            <template #default="{ row }">
              {{ formatDate(row.startedAt) }}
            </template>
          </ElTableColumn>
          
          <ElTableColumn label="练习类型" min-width="120">
            <template #default="{ row }">
              <ElTag type="info" effect="plain">
                {{ row.chapterId ? '章节练习' : '自定义练习' }}
              </ElTag>
            </template>
          </ElTableColumn>
          
          <ElTableColumn label="完成状态" min-width="120">
            <template #default="{ row }">
              <ElTag 
                :type="row.completedAt ? 'success' : 'warning'" 
                size="small"
              >
                {{ row.completedAt ? '已完成' : '未完成' }}
              </ElTag>
            </template>
          </ElTableColumn>
          
          <ElTableColumn label="题目数量" min-width="100">
            <template #default="{ row }">
              {{ row.totalQuestions }}
            </template>
          </ElTableColumn>
          
          <ElTableColumn label="正确题数" min-width="100">
            <template #default="{ row }">
              {{ row.correctAnswers }}
            </template>
          </ElTableColumn>
          
          <ElTableColumn label="正确率" min-width="100">
            <template #default="{ row }">
              <span 
                :class="[
                  'accuracy-value', 
                  row.score ? 
                    row.score >= 80 ? 'high-score' : 
                    row.score >= 60 ? 'medium-score' : 'low-score'
                    : ''
                ]"
              >
                {{ row.score ? row.score + '%' : '-' }}
              </span>
            </template>
          </ElTableColumn>
          
          <ElTableColumn label="用时" min-width="100">
            <template #default="{ row }">
              {{ calculateDuration(row.startedAt, row.completedAt) }}
            </template>
          </ElTableColumn>
          
          <ElTableColumn label="详情" width="80" fixed="right">
            <template #default>
              <ElButton 
                type="primary" 
                link 
                size="small"
              >
                查看
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
      
      <!-- 无历史记录 -->
      <ElEmpty 
        v-else 
        description="暂无练习历史" 
        class="empty-history"
      >
        <ElButton type="primary" @click="goToExerciseList">
          去练习
        </ElButton>
      </ElEmpty>
    </ElSkeleton>
    
    <!-- 详情抽屉 -->
    <ElDrawer
      v-model="detailDrawerVisible"
      title="练习详情"
      direction="rtl"
      size="80%"
    >
      <div class="exercise-detail" v-if="selectedExercise">
        <!-- 练习概要 -->
        <ElCard class="detail-card summary-card">
          <div class="detail-summary">
            <div class="summary-item">
              <div class="summary-label">开始时间</div>
              <div class="summary-value">{{ formatDate(selectedExercise.startedAt) }}</div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">完成时间</div>
              <div class="summary-value">
                {{ selectedExercise.completedAt ? formatDate(selectedExercise.completedAt) : '未完成' }}
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">用时</div>
              <div class="summary-value">
                {{ calculateDuration(selectedExercise.startedAt, selectedExercise.completedAt) }}
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">题目数量</div>
              <div class="summary-value">{{ selectedExercise.totalQuestions }}</div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">正确题数</div>
              <div class="summary-value">{{ selectedExercise.correctAnswers }}</div>
            </div>
            
            <div class="summary-item">
              <div class="summary-label">正确率</div>
              <div 
                class="summary-value"
                :class="[
                  selectedExercise.score ? 
                    selectedExercise.score >= 80 ? 'high-score' : 
                    selectedExercise.score >= 60 ? 'medium-score' : 'low-score'
                    : ''
                ]"
              >
                {{ selectedExercise.score ? selectedExercise.score + '%' : '-' }}
              </div>
            </div>
          </div>
        </ElCard>
        
        <ElDivider>答题详情</ElDivider>
        
        <!-- 答题详情 -->
        <div class="answer-details">
          <ElCard 
            v-for="answer in selectedExercise.answers" 
            :key="answer.questionId"
            class="answer-card"
            :class="{ 'correct-answer': answer.isCorrect, 'wrong-answer': !answer.isCorrect }"
          >
            <template v-if="getQuestionById(answer.questionId)">
              <div class="question-title">
                {{ getQuestionById(answer.questionId)?.title }}
              </div>
              
              <div class="tags-container">
                <ElTag 
                  :type="getAnswerType(answer)" 
                  effect="dark" 
                  size="small"
                >
                  {{ answer.isCorrect ? '正确' : '错误' }}
                </ElTag>
                
                <ElTag 
                  v-for="tag in getQuestionById(answer.questionId)?.tags"
                  :key="tag"
                  effect="plain"
                  size="small"
                >
                  {{ tag }}
                </ElTag>
              </div>
              
              <div class="answer-info">
                <div class="info-item">
                  <span class="info-label">您的答案：</span>
                  <span 
                    class="info-value"
                    :class="{ 'correct-text': answer.isCorrect, 'wrong-text': !answer.isCorrect }"
                  >
                    {{ answer.answer }}
                  </span>
                </div>
                
                <div v-if="!answer.isCorrect" class="info-item">
                  <span class="info-label">正确答案：</span>
                  <span class="info-value correct-text">
                    {{ getQuestionById(answer.questionId)?.answer }}
                  </span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">耗时：</span>
                  <span class="info-value">{{ answer.timeSpent }} 秒</span>
                </div>
              </div>
              
              <div v-if="!answer.isCorrect" class="explanation">
                <ElDivider content-position="left">解析</ElDivider>
                <p>{{ getQuestionById(answer.questionId)?.explanation }}</p>
              </div>
            </template>
            
            <div v-else class="question-not-found">
              题目信息不可用
            </div>
          </ElCard>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<style scoped>
.history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.page-title {
  font-size: var(--font-size-xxl);
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
}

.history-card {
  margin-bottom: var(--spacing-lg);
}

.empty-history {
  padding: var(--spacing-xxl) 0;
}

/* 详情抽屉样式 */
.detail-card {
  margin-bottom: var(--spacing-md);
}

.detail-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.summary-value {
  font-size: var(--font-size-lg);
  font-weight: 500;
}

.answer-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.answer-card {
  padding: var(--spacing-sm);
  border-left: 4px solid transparent;
}

.correct-answer {
  border-left-color: var(--color-success);
  background-color: rgba(76, 175, 80, 0.05);
}

.wrong-answer {
  border-left-color: var(--color-error);
  background-color: rgba(255, 82, 82, 0.05);
}

.question-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
  color: var(--color-primary);
}

.tags-container {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-sm);
}

.answer-info {
  margin: var(--spacing-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  width: 80px;
}

.info-value {
  font-weight: 500;
}

.correct-text {
  color: var(--color-success);
}

.wrong-text {
  color: var(--color-error);
}

.explanation {
  background-color: #f8f8f8;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-sm);
}

.explanation p {
  margin: 0;
  white-space: pre-line;
  line-height: 1.6;
}

.question-not-found {
  color: var(--color-text-light);
  font-style: italic;
  text-align: center;
  padding: var(--spacing-md);
}

.accuracy-value {
  font-weight: 500;
}

.high-score {
  color: var(--color-success);
}

.medium-score {
  color: var(--color-warning);
}

.low-score {
  color: var(--color-error);
}

@media (max-width: 767.98px) {
  .detail-summary {
    grid-template-columns: 1fr;
  }
  
  .summary-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--color-border);
  }
  
  .summary-label {
    margin-bottom: 0;
  }
}
</style> 