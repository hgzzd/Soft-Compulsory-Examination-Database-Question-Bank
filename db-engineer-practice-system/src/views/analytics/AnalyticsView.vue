<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ElCard, ElDivider, ElSelect, ElOption, ElRow, ElCol, 
  ElSkeleton, ElAlert, ElBadge, ElEmpty, ElButton
} from 'element-plus'

// 导入类型和模拟服务
import type { Question, ExerciseRecord } from '@/types/exercise'
import mockExerciseService from '@/services/mockExerciseService'

// 数据加载状态
const isLoading = ref(true)
const exerciseHistory = ref<ExerciseRecord[]>([])
const questions = ref<Question[]>([])

// 时间范围选择
const timeRange = ref('all')
const timeRangeOptions = [
  { value: 'all', label: '全部时间' },
  { value: 'month', label: '最近一个月' },
  { value: 'week', label: '最近一周' },
  { value: 'day', label: '今天' }
]

// 过滤后的练习历史数据
const filteredHistory = computed(() => {
  const history = exerciseHistory.value
  if (timeRange.value === 'all') return history
  
  const now = new Date()
  const filterDate = new Date()
  
  if (timeRange.value === 'month') {
    filterDate.setMonth(now.getMonth() - 1)
  } else if (timeRange.value === 'week') {
    filterDate.setDate(now.getDate() - 7)
  } else if (timeRange.value === 'day') {
    filterDate.setHours(0, 0, 0, 0)
  }
  
  return history.filter(item => new Date(item.date) >= filterDate)
})

// 只取已完成的练习
const completedExercises = computed(() => {
  return filteredHistory.value
})

// 统计数据
const statistics = computed(() => {
  const completed = completedExercises.value
  
  // 练习次数
  const exerciseCount = completed.length
  
  // 总题目数
  const totalQuestions = completed.reduce((sum, item) => sum + item.questions.length, 0)
  
  // 平均正确率
  const avgAccuracy = completed.length > 0
    ? Math.round(completed.reduce((sum, item) => sum + (item.score || 0), 0) / completed.length)
    : 0
  
  // 总用时（分钟）
  const totalTimeInMinutes = completed.reduce((sum, item) => sum + item.duration, 0)
  
  // 平均每次练习用时
  const avgTimePerExercise = exerciseCount > 0 
    ? Math.round(totalTimeInMinutes / exerciseCount) 
    : 0
  
  // 平均每题用时（秒）
  const avgTimePerQuestion = totalQuestions > 0 
    ? Math.round((totalTimeInMinutes * 60) / totalQuestions) 
    : 0
  
  return {
    exerciseCount,
    totalQuestions,
    avgAccuracy,
    totalTimeInMinutes,
    avgTimePerExercise,
    avgTimePerQuestion
  }
})

// 正确率趋势图配置
const accuracyTrendOptions = computed(() => {
  const exercises = [...completedExercises.value].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  const dates = exercises.map(e => {
    const date = new Date(e.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  
  const scores = exercises.map(e => e.score || 0)
  
  return {
    title: {
      text: '正确率趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '正确率',
        type: 'line',
        data: scores,
        markLine: {
          data: [
            {
              name: '及格线',
              yAxis: 60,
              lineStyle: {
                color: '#F56C6C'
              },
              label: {
                formatter: '及格线 (60%)'
              }
            }
          ]
        }
      }
    ],
    color: ['#409EFF']
  }
})

// 知识点掌握情况图表配置
const knowledgeRadarOptions = computed(() => {
  // 从答题历史中分析各知识点的掌握情况
  const knowledgeMap = new Map<string, { total: number; correct: number }>()
  
  // 收集所有练习的答案
  completedExercises.value.forEach(exercise => {
    exercise.questions.forEach((question, index) => {
      const knowledge = question.knowledge
      if (!knowledgeMap.has(knowledge)) {
        knowledgeMap.set(knowledge, { total: 0, correct: 0 })
      }
      
      // 根据回答更新统计
      const stats = knowledgeMap.get(knowledge)!
      stats.total++
      
      // 检查答案是否正确
      if (exercise.answers[index].isCorrect) {
        stats.correct++
      }
    })
  })
  
  // 计算每个知识点的正确率
  const knowledgeNames = Array.from(knowledgeMap.keys())
  const knowledgeScores = knowledgeNames.map(name => {
    const { total, correct } = knowledgeMap.get(name)!
    return total > 0 ? Math.round((correct / total) * 100) : 0
  })
  
  return {
    title: {
      text: '知识点掌握情况',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return `${params.name}: ${params.value}% 正确率`
      }
    },
    radar: {
      indicator: knowledgeNames.map(name => ({ name, max: 100 })),
      shape: 'circle',
      splitNumber: 4
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: knowledgeScores,
            name: '掌握程度',
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.2)'
            }
          }
        ]
      }
    ],
    color: ['#409EFF']
  }
})

// 题型分布图表配置
const questionTypePieOptions = computed(() => {
  // 按题型分组统计
  const typeStats = new Map<string, number>()
  
  completedExercises.value.forEach(exercise => {
    exercise.questions.forEach(question => {
      const type = question.type
      typeStats.set(type, (typeStats.get(type) || 0) + 1)
    })
  })
  
  // 转换为图表数据
  const pieData = Array.from(typeStats.entries()).map(([name, value]) => ({ name, value }))
  
  return {
    title: {
      text: '题型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  }
})

// 每日练习时长柱状图配置
const dailyTimeBarOptions = computed(() => {
  const exercises = completedExercises.value
  
  // 按日期分组
  const dateGroups = new Map<string, number>()
  exercises.forEach(exercise => {
    const date = new Date(exercise.date)
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    
    dateGroups.set(dateKey, (dateGroups.get(dateKey) || 0) + exercise.duration)
  })
  
  // 排序日期并转换为图表数据
  const sortedDates = Array.from(dateGroups.keys()).sort()
  const formattedDates = sortedDates.map(date => {
    const parts = date.split('-')
    return `${parts[1]}/${parts[2]}`
  })
  
  const timeData = sortedDates.map(date => dateGroups.get(date) || 0)
  
  return {
    title: {
      text: '每日练习时长',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c} 分钟'
    },
    xAxis: {
      type: 'category',
      data: formattedDates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 分钟'
      }
    },
    series: [
      {
        type: 'bar',
        data: timeData,
        barWidth: '60%'
      }
    ],
    color: ['#67C23A']
  }
})

// 数据加载
const loadAnalyticsData = async () => {
  isLoading.value = true
  try {
    exerciseHistory.value = await mockExerciseService.getUserExerciseHistory()
    questions.value = await mockExerciseService.getAllQuestions()
  } catch (error) {
    console.error('Failed to load analytics data', error)
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAnalyticsData()
})
</script>

<template>
  <div class="analytics-container">
    <h1 class="page-title">学习分析</h1>
    
    <!-- 时间范围选择 -->
    <div class="filter-bar">
      <ElSelect v-model="timeRange" placeholder="选择时间范围">
        <ElOption
          v-for="item in timeRangeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </div>
    
    <!-- 加载状态 -->
    <ElSkeleton :loading="isLoading" animated :rows="15" :throttle="500">
      <!-- 无数据提示 -->
      <ElEmpty 
        v-if="completedExercises.length === 0" 
        description="暂无练习数据，快去练习吧！" 
        class="empty-data"
      >
        <ElButton type="primary" @click="$router.push('/exercise')">
          开始练习
        </ElButton>
      </ElEmpty>
      
      <template v-else>
        <!-- 基础数据卡片 -->
        <ElRow :gutter="20" class="stat-cards">
          <ElCol :span="6" :xs="12">
            <ElCard class="stat-card">
              <div class="stat-value">{{ statistics.exerciseCount }}</div>
              <div class="stat-label">练习次数</div>
            </ElCard>
          </ElCol>
          
          <ElCol :span="6" :xs="12">
            <ElCard class="stat-card">
              <div class="stat-value">{{ statistics.totalQuestions }}</div>
              <div class="stat-label">已做题目</div>
            </ElCard>
          </ElCol>
          
          <ElCol :span="6" :xs="12">
            <ElCard class="stat-card">
              <div 
                class="stat-value"
                :class="[
                  statistics.avgAccuracy >= 80 ? 'high-score' : 
                  statistics.avgAccuracy >= 60 ? 'medium-score' : 'low-score'
                ]"
              >
                {{ statistics.avgAccuracy }}%
              </div>
              <div class="stat-label">平均正确率</div>
            </ElCard>
          </ElCol>
          
          <ElCol :span="6" :xs="12">
            <ElCard class="stat-card">
              <div class="stat-value">{{ statistics.totalTimeInMinutes }}分钟</div>
              <div class="stat-label">总练习时长</div>
            </ElCard>
          </ElCol>
        </ElRow>
        
        <!-- 练习效率数据卡片 -->
        <ElRow :gutter="20" class="stat-cards">
          <ElCol :span="12" :xs="24">
            <ElCard class="stat-card">
              <div class="stat-value">{{ statistics.avgTimePerExercise }}分钟</div>
              <div class="stat-label">平均每次练习时长</div>
            </ElCard>
          </ElCol>
          
          <ElCol :span="12" :xs="24">
            <ElCard class="stat-card">
              <div class="stat-value">{{ statistics.avgTimePerQuestion }}秒</div>
              <div class="stat-label">平均每题用时</div>
            </ElCard>
          </ElCol>
        </ElRow>
        
        <ElDivider>详细分析</ElDivider>
        
        <!-- 图表区域 -->
        <ElRow :gutter="20" class="chart-row">
          <!-- 正确率趋势 -->
          <ElCol :span="24" :lg="12" class="chart-col">
            <ElCard class="chart-card">
              <v-chart 
                class="chart" 
                :option="accuracyTrendOptions"
                autoresize
              />
            </ElCard>
          </ElCol>
          
          <!-- 题型分布 -->
          <ElCol :span="24" :lg="12" class="chart-col">
            <ElCard class="chart-card">
              <v-chart 
                class="chart" 
                :option="questionTypePieOptions"
                autoresize
              />
            </ElCard>
          </ElCol>
        </ElRow>
        
        <ElRow :gutter="20" class="chart-row">
          <!-- 知识点掌握情况 -->
          <ElCol :span="24" :lg="12" class="chart-col">
            <ElCard class="chart-card">
              <v-chart 
                class="chart" 
                :option="knowledgeRadarOptions"
                autoresize
              />
            </ElCard>
          </ElCol>
          
          <!-- 每日练习时长 -->
          <ElCol :span="24" :lg="12" class="chart-col">
            <ElCard class="chart-card">
              <v-chart 
                class="chart" 
                :option="dailyTimeBarOptions"
                autoresize
              />
            </ElCard>
          </ElCol>
        </ElRow>
        
        <!-- 学习建议 -->
        <ElDivider>学习建议</ElDivider>
        
        <ElCard class="advice-card">
          <div class="advice-header">
            <ElBadge value="新" type="primary">
              <h3 class="advice-title">个性化学习建议</h3>
            </ElBadge>
          </div>
          
          <div class="advice-content">
            <p class="advice-text">
              根据你的练习数据，我们为你提供以下学习建议：
            </p>
            
            <ElAlert
              title="加强薄弱知识点"
              type="warning"
              :closable="false"
              class="advice-alert"
            >
              <template #default>
                <p v-if="knowledgeRadarOptions.radar.indicator?.length > 0">
                  你在
                  <strong>
                    {{ 
                      knowledgeRadarOptions.radar.indicator
                        .map((item, index) => ({ name: item.name, score: knowledgeRadarOptions.series[0].data[0].value[index] }))
                        .sort((a, b) => a.score - b.score)
                        .slice(0, 2)
                        .map(item => item.name)
                        .join('、') 
                    }}
                  </strong>
                  等知识点上的掌握度较低，建议重点复习。
                </p>
                <p v-else>
                  暂无足够的数据分析你的薄弱知识点。请继续练习，完成更多题目。
                </p>
              </template>
            </ElAlert>
            
            <ElAlert
              title="合理安排练习时间"
              type="info"
              :closable="false"
              class="advice-alert"
            >
              <template #default>
                <p>
                  建议每天坚持练习至少30分钟，形成良好的学习习惯。
                  {{ statistics.avgTimePerExercise < 30 ? '你的平均练习时长偏短，可以适当增加每次练习的题量。' : '' }}
                </p>
              </template>
            </ElAlert>
            
            <ElAlert
              title="提高答题速度"
              type="success"
              :closable="false"
              class="advice-alert"
            >
              <template #default>
                <p>
                  你的平均答题速度为 {{ statistics.avgTimePerQuestion }} 秒/题。
                  {{ 
                    statistics.avgTimePerQuestion > 90 
                      ? '对于数据库工程师考试，建议将答题速度控制在60秒以内，可以多进行模拟训练提高速度。' 
                      : '继续保持这个答题速度，并注意在保证准确率的前提下适当提高速度。' 
                  }}
                </p>
              </template>
            </ElAlert>
          </div>
        </ElCard>
      </template>
    </ElSkeleton>
  </div>
</template>

<style scoped>
.analytics-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.empty-data {
  padding: 60px 0;
}

/* 统计卡片样式 */
.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  height: 100%;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.high-score {
  color: #67C23A;
}

.medium-score {
  color: #E6A23C;
}

.low-score {
  color: #F56C6C;
}

/* 图表样式 */
.chart-row {
  margin-bottom: 24px;
}

.chart-col {
  margin-bottom: 16px;
}

.chart-card {
  height: 400px;
}

.chart {
  height: 360px;
}

/* 建议样式 */
.advice-card {
  margin-bottom: 24px;
}

.advice-header {
  margin-bottom: 16px;
}

.advice-title {
  font-size: 18px;
  margin: 0;
}

.advice-content {
  color: #303133;
}

.advice-text {
  margin-bottom: 16px;
}

.advice-alert {
  margin-bottom: 12px;
}

.advice-alert p {
  line-height: 1.6;
  margin: 4px 0;
}

@media (max-width: 767.98px) {
  .page-title {
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .chart-card {
    height: 300px;
  }
  
  .chart {
    height: 260px;
  }
}
</style> 