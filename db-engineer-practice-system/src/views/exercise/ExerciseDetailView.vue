<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ElCard, ElButton, ElInput, ElRadio, ElRadioGroup, 
  ElCheckbox, ElCheckboxGroup, ElSteps, ElStep, ElTag,
  ElDivider, ElAlert, ElDialog, ElMessageBox, ElMessage 
} from 'element-plus'
import { useExerciseStore } from '../../stores/exerciseStore'
import { useUserStore } from '../../stores/userStore'
import { QuestionType, QuestionStatus } from '../../types/exercise'
import CodeEditor from '../../components/CodeEditor.vue'
import { Check, Close, ArrowRight, Timer, Flag, DocumentCopy, Back } from '@element-plus/icons-vue'

// 路由参数
const route = useRoute()
const router = useRouter()
const exerciseId = ref<string>(route.params.id as string)
const exerciseStore = useExerciseStore()
const userStore = useUserStore()

// 练习状态
const loading = ref(true)
const exercise = ref<any>(null)
const currentQuestionIndex = ref(0)
const userAnswers = ref<Record<string, any>>({})
const questionStatuses = ref<Record<string, QuestionStatus>>({})
const timeRemaining = ref(0)
const timer = ref<number | null>(null)
const isSubmitting = ref(false)
const showResultDialog = ref(false)
const isExerciseCompleted = ref(false)

// 计算当前题目
const currentQuestion = computed(() => {
  if (!exercise.value || !exercise.value.questions || exercise.value.questions.length === 0) {
    return null
  }
  return exercise.value.questions[currentQuestionIndex.value]
})

// 标记题目是否已作答
const isAnswered = computed(() => {
  if (!currentQuestion.value) return false
  return !!userAnswers.value[currentQuestion.value.id]
})

// 格式化剩余时间
const formattedTimeRemaining = computed(() => {
  const hours = Math.floor(timeRemaining.value / 3600)
  const minutes = Math.floor((timeRemaining.value % 3600) / 60)
  const seconds = timeRemaining.value % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 进度百分比
const progressPercentage = computed(() => {
  if (!exercise.value || !exercise.value.questions) return 0
  const total = exercise.value.questions.length
  const answered = Object.keys(userAnswers.value).length
  return Math.round((answered / total) * 100)
})

// 练习结果
const exerciseResult = computed(() => {
  if (!exercise.value || !exercise.value.questions) return null
  
  const totalQuestions = exercise.value.questions.length
  const correctCount = Object.values(questionStatuses.value).filter(status => status === QuestionStatus.CORRECT).length
  const incorrectCount = Object.values(questionStatuses.value).filter(status => status === QuestionStatus.INCORRECT).length
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  
  return {
    totalQuestions,
    answeredQuestions: Object.keys(userAnswers.value).length,
    correctCount,
    incorrectCount,
    score,
    isPassed: score >= 60,
    timeSpent: exercise.value.totalTime - timeRemaining.value
  }
})

// 获取练习数据
const fetchExercise = async () => {
  loading.value = true
  try {
    // 从练习库获取练习
    const fetchedExercise = await exerciseStore.getExerciseById(exerciseId.value)
    
    if (!fetchedExercise) {
      ElMessageBox.alert('练习不存在或已被删除', '加载失败', {
        confirmButtonText: '返回',
        callback: () => {
          router.push('/exercise')
        }
      })
      return
    }
    
    exercise.value = fetchedExercise
    
    // 设置初始状态
    if (exercise.value.questions) {
      exercise.value.questions.forEach((question: any) => {
        questionStatuses.value[question.id] = QuestionStatus.UNANSWERED
      })
    }
    
    // 设置倒计时
    if (exercise.value.totalTime) {
      timeRemaining.value = exercise.value.totalTime
      startTimer()
    }
    
    // 加载已保存的答案（如果有）
    if (exercise.value.answers && exercise.value.answers.length > 0) {
      exercise.value.answers.forEach((answer: any) => {
        userAnswers.value[answer.questionId] = answer.userAnswer
        questionStatuses.value[answer.questionId] = answer.isCorrect 
          ? QuestionStatus.CORRECT 
          : QuestionStatus.INCORRECT
      })
      
      // 如果练习已完成，显示结果
      if (exercise.value.completedAt) {
        isExerciseCompleted.value = true
      }
    } else {
      // 如果没有保存的答案，标记练习开始
      await exerciseStore.startExercise(exerciseId.value)
    }
  } catch (error) {
    console.error('获取练习失败', error)
    ElMessage.error('获取练习失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理选择题答案
const handleOptionSelect = (questionId: string, answer: any) => {
  userAnswers.value[questionId] = answer
}

// 处理多选题答案
const handleMultiSelect = (questionId: string, answers: any[]) => {
  userAnswers.value[questionId] = [...answers]
}

// 处理填空题答案
const handleFillBlankInput = (questionId: string, answer: string) => {
  userAnswers.value[questionId] = answer.trim()
}

// 处理SQL编程题答案
const handleSqlInput = (questionId: string, sql: string) => {
  userAnswers.value[questionId] = sql
}

// 提交当前题目答案
const submitCurrentAnswer = async () => {
  if (!currentQuestion.value || !isAnswered.value) return
  
  const questionId = currentQuestion.value.id
  const userAnswer = userAnswers.value[questionId]
  
  try {
    isSubmitting.value = true
    const result = await exerciseStore.submitAnswer(exerciseId.value, questionId, userAnswer)
    
    // 更新问题状态
    questionStatuses.value[questionId] = result.isCorrect 
      ? QuestionStatus.CORRECT 
      : QuestionStatus.INCORRECT
    
    // 显示结果提示
    ElMessage({
      message: result.isCorrect ? '回答正确！' : '回答错误',
      type: result.isCorrect ? 'success' : 'error',
      duration: 2000
    })
  } catch (error) {
    console.error('提交答案失败', error)
    ElMessage.error('提交答案失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 标记题目
const markQuestion = (questionId: string) => {
  if (questionStatuses.value[questionId] === QuestionStatus.MARKED) {
    questionStatuses.value[questionId] = QuestionStatus.UNANSWERED
  } else {
    questionStatuses.value[questionId] = QuestionStatus.MARKED
  }
}

// 跳转到下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < exercise.value.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

// 跳转到上一题
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

// 跳转到指定题目
const goToQuestion = (index: number) => {
  if (index >= 0 && index < exercise.value.questions.length) {
    currentQuestionIndex.value = index
  }
}

// 结束练习
const finishExercise = async () => {
  // 检查是否有未回答的题目
  const unansweredCount = exercise.value.questions.length - Object.keys(userAnswers.value).length
  
  if (unansweredCount > 0) {
    try {
      await ElMessageBox.confirm(
        `还有 ${unansweredCount} 道题目未回答，确定要交卷吗？`,
        '确认交卷',
        {
          confirmButtonText: '确认交卷',
          cancelButtonText: '继续答题',
          type: 'warning'
        }
      )
    } catch (e) {
      return // 用户取消
    }
  }
  
  try {
    isSubmitting.value = true
    await exerciseStore.completeExercise(exerciseId.value)
    
    stopTimer()
    isExerciseCompleted.value = true
    showResultDialog.value = true
  } catch (error) {
    console.error('完成练习失败', error)
    ElMessage.error('提交练习失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 倒计时
const startTimer = () => {
  if (timer.value !== null) return
  
  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      // 时间到，自动交卷
      stopTimer()
      ElMessage.warning('时间已到，系统将自动交卷')
      finishExercise()
    }
  }, 1000) as unknown as number
}

const stopTimer = () => {
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// 格式化显示时间
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  return `${hours > 0 ? hours + '小时' : ''}${minutes > 0 ? minutes + '分钟' : ''}${remainingSeconds}秒`
}

// 返回试题列表
const goBack = () => {
  router.push('/exercise')
}

// 声明周期钩子
onMounted(() => {
  fetchExercise()
})

onBeforeUnmount(() => {
  stopTimer()
})
</script>

<template>
  <div class="exercise-container">
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载试题...</p>
    </div>
    
    <template v-else>
      <!-- 顶部导航栏 -->
      <div class="top-bar">
        <div class="back-button" @click="goBack">
          <el-icon><Back /></el-icon>
          <span>返回题库</span>
        </div>
        
        <div class="exercise-info">
          <h2>{{ exercise?.title || '练习' }}</h2>
          <div class="timer" :class="{ 'timer-warning': timeRemaining < 300 }">
            <el-icon><Timer /></el-icon>
            <span>{{ formattedTimeRemaining }}</span>
          </div>
        </div>
        
        <div class="progress-info">
          <span>已完成: {{ progressPercentage }}%</span>
          <el-button 
            type="primary" 
            :disabled="isSubmitting || isExerciseCompleted" 
            @click="finishExercise"
          >
            交卷
          </el-button>
        </div>
      </div>
      
      <div class="main-content">
        <!-- 左侧题目导航 -->
        <div class="question-nav">
          <div class="question-nav-header">
            <h3>题目导航</h3>
          </div>
          
          <div class="question-buttons">
            <button 
              v-for="(question, index) in exercise?.questions" 
              :key="question.id"
              :class="[
                'question-button', 
                {
                  'current': index === currentQuestionIndex,
                  'answered': !!userAnswers[question.id],
                  'correct': questionStatuses[question.id] === 'CORRECT',
                  'incorrect': questionStatuses[question.id] === 'INCORRECT',
                  'marked': questionStatuses[question.id] === 'MARKED'
                }
              ]"
              @click="goToQuestion(index)"
            >
              {{ index + 1 }}
            </button>
          </div>
          
          <div class="nav-legend">
            <div class="legend-item">
              <div class="legend-color current"></div>
              <span>当前题目</span>
            </div>
            <div class="legend-item">
              <div class="legend-color answered"></div>
              <span>已作答</span>
            </div>
            <div class="legend-item">
              <div class="legend-color marked"></div>
              <span>已标记</span>
            </div>
            <div class="legend-item">
              <div class="legend-color correct"></div>
              <span>正确</span>
            </div>
            <div class="legend-item">
              <div class="legend-color incorrect"></div>
              <span>错误</span>
            </div>
          </div>
        </div>
        
        <!-- 右侧题目内容 -->
        <div class="question-content">
          <ElCard v-if="currentQuestion" class="question-card">
            <div class="question-header">
              <div class="question-title">
                <span class="question-number">第 {{ currentQuestionIndex + 1 }} 题</span>
                <ElTag 
                  :type="currentQuestion.difficulty === 'easy' ? 'success' : 
                         currentQuestion.difficulty === 'medium' ? 'warning' : 'danger'"
                >
                  {{ 
                    currentQuestion.difficulty === 'easy' ? '简单' : 
                    currentQuestion.difficulty === 'medium' ? '中等' : '困难'
                  }}
                </ElTag>
                <ElTag v-for="tag in currentQuestion.tags" :key="tag">
                  {{ tag }}
                </ElTag>
              </div>
              
              <div class="question-actions">
                <ElButton 
                  :icon="Flag" 
                  circle 
                  :type="questionStatuses[currentQuestion.id] === 'MARKED' ? 'warning' : 'info'"
                  @click="markQuestion(currentQuestion.id)"
                  title="标记此题"
                />
              </div>
            </div>
            
            <ElDivider />
            
            <div class="question-body">
              <!-- 题目描述 -->
              <div class="question-description" v-html="currentQuestion.description"></div>
              
              <!-- 选择题 -->
              <template v-if="currentQuestion.type === 'SINGLE_CHOICE'">
                <ElRadioGroup 
                  v-model="userAnswers[currentQuestion.id]" 
                  class="option-group"
                  :disabled="isExerciseCompleted"
                >
                  <ElRadio 
                    v-for="option in currentQuestion.options" 
                    :key="option.value" 
                    :label="option.value"
                    class="option-item"
                  >
                    {{ option.label }}
                  </ElRadio>
                </ElRadioGroup>
              </template>
              
              <!-- 多选题 -->
              <template v-else-if="currentQuestion.type === 'MULTIPLE_CHOICE'">
                <ElCheckboxGroup 
                  v-model="userAnswers[currentQuestion.id]" 
                  class="option-group"
                  :disabled="isExerciseCompleted"
                >
                  <ElCheckbox 
                    v-for="option in currentQuestion.options" 
                    :key="option.value" 
                    :label="option.value"
                    class="option-item"
                  >
                    {{ option.label }}
                  </ElCheckbox>
                </ElCheckboxGroup>
              </template>
              
              <!-- 填空题 -->
              <template v-else-if="currentQuestion.type === 'FILL_BLANK'">
                <ElInput
                  v-model="userAnswers[currentQuestion.id]"
                  type="textarea"
                  rows="3"
                  placeholder="请输入答案"
                  :disabled="isExerciseCompleted"
                  @input="handleFillBlankInput(currentQuestion.id, userAnswers[currentQuestion.id])"
                />
              </template>
              
              <!-- SQL编程题 -->
              <template v-else-if="currentQuestion.type === 'SQL_PROGRAMMING'">
                <CodeEditor
                  v-model="userAnswers[currentQuestion.id]"
                  :disabled="isExerciseCompleted"
                  language="sql"
                  @change="handleSqlInput(currentQuestion.id, userAnswers[currentQuestion.id])"
                />
                
                <!-- 示例数据表信息 -->
                <div v-if="currentQuestion.databaseSchema" class="schema-info">
                  <h4>数据表结构</h4>
                  <pre>{{ currentQuestion.databaseSchema }}</pre>
                </div>
              </template>
              
              <!-- 答案解析（仅在已完成时显示） -->
              <div v-if="isExerciseCompleted && questionStatuses[currentQuestion.id]" class="answer-explanation">
                <ElAlert
                  :type="questionStatuses[currentQuestion.id] === 'CORRECT' ? 'success' : 'error'"
                  :title="questionStatuses[currentQuestion.id] === 'CORRECT' ? '答案正确' : '答案错误'"
                  :closable="false"
                >
                  <template #default>
                    <div v-if="questionStatuses[currentQuestion.id] === 'INCORRECT'" class="correct-answer">
                      <p><strong>正确答案：</strong></p>
                      <p v-if="['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(currentQuestion.type)">
                        {{ 
                          Array.isArray(currentQuestion.answer) 
                            ? currentQuestion.answer.map(a => {
                                const option = currentQuestion.options.find(o => o.value === a)
                                return option ? option.label : a
                              }).join(', ')
                            : currentQuestion.options.find(o => o.value === currentQuestion.answer)?.label 
                        }}
                      </p>
                      <p v-else>{{ currentQuestion.answer }}</p>
                    </div>
                    <div class="explanation" v-if="currentQuestion.explanation">
                      <p><strong>解析：</strong></p>
                      <div v-html="currentQuestion.explanation"></div>
                    </div>
                  </template>
                </ElAlert>
              </div>
            </div>
          </ElCard>
          
          <!-- 底部导航按钮 -->
          <div class="question-footer">
            <ElButton 
              :disabled="currentQuestionIndex === 0"
              @click="prevQuestion"
            >
              上一题
            </ElButton>
            
            <ElButton 
              type="primary" 
              @click="submitCurrentAnswer"
              :disabled="!isAnswered || isSubmitting || isExerciseCompleted 
                || questionStatuses[currentQuestion?.id] === 'CORRECT' 
                || questionStatuses[currentQuestion?.id] === 'INCORRECT'"
            >
              提交答案
            </ElButton>
            
            <ElButton 
              :disabled="currentQuestionIndex === exercise?.questions.length - 1"
              @click="nextQuestion"
            >
              下一题
            </ElButton>
          </div>
        </div>
      </div>
      
      <!-- 练习结果弹窗 -->
      <ElDialog 
        v-model="showResultDialog" 
        title="练习结果" 
        width="600px"
        :close-on-click-modal="false"
        :show-close="false"
      >
        <div class="result-content">
          <div class="result-header" :class="{ 'passed': exerciseResult?.isPassed }">
            <h2>{{ exerciseResult?.isPassed ? '恭喜你通过了练习！' : '很遗憾，未通过练习' }}</h2>
            <div class="score-display">{{ exerciseResult?.score }}分</div>
          </div>
          
          <div class="result-stats">
            <div class="stat-item">
              <div class="stat-label">总题目数</div>
              <div class="stat-value">{{ exerciseResult?.totalQuestions }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">已答题数</div>
              <div class="stat-value">{{ exerciseResult?.answeredQuestions }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">正确题数</div>
              <div class="stat-value correct">{{ exerciseResult?.correctCount }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">错误题数</div>
              <div class="stat-value incorrect">{{ exerciseResult?.incorrectCount }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">练习用时</div>
              <div class="stat-value">{{ formatTime(exerciseResult?.timeSpent || 0) }}</div>
            </div>
          </div>
          
          <div class="result-actions">
            <ElButton type="primary" @click="router.push('/exercise/history')">
              查看历史记录
            </ElButton>
            <ElButton @click="router.push('/exercise')">
              返回题库
            </ElButton>
          </div>
        </div>
      </ElDialog>
    </template>
  </div>
</template>

<style scoped>
.exercise-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--el-color-primary);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-light);
  border-bottom: 1px solid var(--color-border);
}

.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--color-text);
}

.back-button:hover {
  color: var(--color-primary);
}

.back-button .el-icon {
  margin-right: var(--spacing-xs);
}

.exercise-info {
  display: flex;
  align-items: center;
}

.exercise-info h2 {
  margin: 0 var(--spacing-md) 0 0;
  font-size: var(--font-size-lg);
}

.timer {
  display: flex;
  align-items: center;
  background-color: var(--color-bg);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-weight: bold;
}

.timer .el-icon {
  margin-right: var(--spacing-xs);
}

.timer-warning {
  color: var(--color-error);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.progress-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.question-nav {
  width: 200px;
  padding: var(--spacing-md);
  background-color: var(--color-bg-light);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.question-nav-header {
  margin-bottom: var(--spacing-md);
}

.question-nav-header h3 {
  margin: 0;
  font-size: var(--font-size-md);
}

.question-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--spacing-md);
}

.question-button {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.2s;
}

.question-button.current {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.question-button.answered {
  background-color: var(--color-bg-light);
  border-color: var(--color-primary-light);
}

.question-button.correct {
  background-color: var(--color-success-light);
  border-color: var(--color-success);
  color: var(--color-success);
}

.question-button.incorrect {
  background-color: var(--color-error-light);
  border-color: var(--color-error);
  color: var(--color-error);
}

.question-button.marked {
  background-color: var(--color-warning-light);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.nav-legend {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-md);
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-right: var(--spacing-xs);
}

.legend-color.current {
  background-color: var(--color-primary);
}

.legend-color.answered {
  background-color: var(--color-bg-light);
  border: 1px solid var(--color-primary-light);
}

.legend-color.correct {
  background-color: var(--color-success-light);
  border: 1px solid var(--color-success);
}

.legend-color.incorrect {
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error);
}

.legend-color.marked {
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning);
}

.question-content {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.question-card {
  flex: 1;
  margin-bottom: var(--spacing-md);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.question-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.question-number {
  font-weight: bold;
  font-size: var(--font-size-lg);
}

.question-body {
  padding: var(--spacing-md) 0;
}

.question-description {
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.option-item {
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s;
}

.option-item:hover {
  background-color: var(--color-bg-light);
}

.schema-info {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-light);
  border-radius: 4px;
  overflow-x: auto;
}

.schema-info h4 {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
}

.schema-info pre {
  margin: 0;
  white-space: pre-wrap;
}

.answer-explanation {
  margin-top: var(--spacing-lg);
}

.correct-answer,
.explanation {
  margin-top: var(--spacing-sm);
}

.explanation {
  white-space: pre-line;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

/* 结果弹窗样式 */
.result-content {
  text-align: center;
}

.result-header {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-error-light);
  border-radius: 4px;
}

.result-header.passed {
  background-color: var(--color-success-light);
}

.result-header h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
}

.score-display {
  font-size: 48px;
  font-weight: bold;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-lg);
}

.stat-item {
  padding: var(--spacing-md);
  min-width: 100px;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: bold;
}

.stat-value.correct {
  color: var(--color-success);
}

.stat-value.incorrect {
  color: var(--color-error);
}

.result-actions {
  margin-top: var(--spacing-lg);
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .question-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .exercise-info,
  .progress-info {
    width: 100%;
    margin: var(--spacing-xs) 0;
  }
}
</style> 