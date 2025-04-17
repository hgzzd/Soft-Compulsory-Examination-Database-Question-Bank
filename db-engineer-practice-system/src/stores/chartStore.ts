import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useExerciseStore } from './exerciseStore';

interface ChartData {
  knowledgeMastery: {
    categories: string[];
    data: Array<{
      name: string;
      value: number;
    }>;
  };
  learningTrend: {
    dates: string[];
    questionCounts: number[];
    accuracyRates: number[];
  };
  questionTypes: {
    categories: string[];
    data: number[];
  };
}

interface ChartFilters {
  timeRange: {
    start: string | null;
    end: string | null;
  };
  knowledgePoint: string | null;
}

export const useChartStore = defineStore('chart', () => {
  // State
  const chartData = ref<ChartData>({
    knowledgeMastery: {
      categories: [],
      data: []
    },
    learningTrend: {
      dates: [],
      questionCounts: [],
      accuracyRates: []
    },
    questionTypes: {
      categories: [],
      data: []
    }
  });
  
  const filters = ref<ChartFilters>({
    timeRange: {
      start: null,
      end: null
    },
    knowledgePoint: null
  });
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getKnowledgeMasteryData = computed(() => chartData.value.knowledgeMastery);
  const getLearningTrendData = computed(() => chartData.value.learningTrend);
  const getQuestionTypesData = computed(() => chartData.value.questionTypes);
  const getCurrentFilters = computed(() => filters.value);
  
  // Actions
  async function fetchChartData() {
    const exerciseStore = useExerciseStore();
    isLoading.value = true;
    
    try {
      // TODO: API endpoint for analytics data
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get history from exercise store
      await exerciseStore.fetchExerciseHistory();
      const history = exerciseStore.exerciseHistory;
      
      // Mock knowledge mastery data
      chartData.value.knowledgeMastery = {
        categories: ['SQL语言', '数据库设计', '数据模型', 'E-R图', '事务处理', '索引优化'],
        data: [
          { name: 'SQL语言', value: 75 },
          { name: '数据库设计', value: 82 },
          { name: '数据模型', value: 65 },
          { name: 'E-R图', value: 90 },
          { name: '事务处理', value: 68 },
          { name: '索引优化', value: 72 }
        ]
      };
      
      // Generate learning trend data (last 30 days)
      const dates: string[] = [];
      const questionCounts: number[] = [];
      const accuracyRates: number[] = [];
      
      // Generate dates for the last 30 days
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
        
        // Random data for demonstration
        questionCounts.push(Math.floor(Math.random() * 10));
        accuracyRates.push(Math.round(Math.random() * 40 + 60)); // 60-100% accuracy
      }
      
      chartData.value.learningTrend = {
        dates,
        questionCounts,
        accuracyRates
      };
      
      // Mock question types data
      chartData.value.questionTypes = {
        categories: ['单选题', '多选题', '填空题', '判断题', 'SQL实操题'],
        data: [85, 72, 65, 90, 68]
      };
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch chart data';
    } finally {
      isLoading.value = false;
    }
  }
  
  function updateFilters(newFilters: Partial<ChartFilters>) {
    filters.value = {
      ...filters.value,
      ...newFilters
    };
    
    // After updating filters, fetch data again
    fetchChartData();
  }
  
  // Chart configuration getters for different chart types
  const pieChartOptions = computed(() => {
    return {
      title: {
        text: '知识点掌握度',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: chartData.value.knowledgeMastery.categories
      },
      series: [
        {
          name: '掌握度',
          type: 'pie',
          radius: ['50%', '70%'],
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
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData.value.knowledgeMastery.data
        }
      ]
    };
  });
  
  const lineChartOptions = computed(() => {
    return {
      title: {
        text: '学习趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['题目数量', '正确率'],
        bottom: '0'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: chartData.value.learningTrend.dates
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '题目数量',
          position: 'left'
        },
        {
          type: 'value',
          name: '正确率(%)',
          position: 'right',
          min: 0,
          max: 100
        }
      ],
      series: [
        {
          name: '题目数量',
          type: 'line',
          stack: '总量',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: chartData.value.learningTrend.questionCounts,
          yAxisIndex: 0
        },
        {
          name: '正确率',
          type: 'line',
          stack: '总量',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: chartData.value.learningTrend.accuracyRates,
          yAxisIndex: 1
        }
      ]
    };
  });
  
  const radarChartOptions = computed(() => {
    return {
      title: {
        text: '题型掌握度',
        left: 'center'
      },
      tooltip: {},
      legend: {
        data: ['掌握度'],
        bottom: '0'
      },
      radar: {
        // shape: 'circle',
        indicator: chartData.value.questionTypes.categories.map(category => ({
          name: category,
          max: 100
        }))
      },
      series: [
        {
          name: '题型掌握度',
          type: 'radar',
          data: [
            {
              value: chartData.value.questionTypes.data,
              name: '掌握度'
            }
          ]
        }
      ]
    };
  });

  return {
    // State
    chartData,
    filters,
    isLoading,
    error,
    
    // Getters
    getKnowledgeMasteryData,
    getLearningTrendData,
    getQuestionTypesData,
    getCurrentFilters,
    pieChartOptions,
    lineChartOptions,
    radarChartOptions,
    
    // Actions
    fetchChartData,
    updateFilters
  };
}); 