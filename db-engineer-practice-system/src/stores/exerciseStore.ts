import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import questionService, { Question as APIQuestion, ExamSet } from '../services/questionService';
import practiceService from '../services/practiceService';
import mistakeService from '../services/mistakeService';

export interface Chapter {
  id: string;
  name: string;
  children?: Chapter[];
}

export interface Question {
  id: string;
  title: string;
  content: string;
  options: Array<{
    key: string;
    content: string;
  }>;
  answer: string;
  explanation: string;
  chapterId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  submittedAt: string;
}

export interface ExerciseHistory {
  id: string;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  totalQuestions: number;
  correctAnswers: number;
  answers: UserAnswer[];
  chapterId: string | null;
}

export const useExerciseStore = defineStore('exercise', () => {
  // State
  const chapters = ref<Chapter[]>([]);
  const questions = ref<Question[]>([]);
  const currentExercise = ref<{
    questions: Question[];
    answers: Record<string, string>;
    startTime: Date;
    timeLimit: number | null;
    chapterId: string | null;
  } | null>(null);
  const exerciseHistory = ref<ExerciseHistory[]>([]);
  const favoriteQuestions = ref<Set<string>>(new Set());
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getChapters = computed(() => chapters.value);
  const getAllQuestions = computed(() => questions.value);
  const getCurrentExercise = computed(() => currentExercise.value);
  const getExerciseHistory = computed(() => exerciseHistory.value);
  const getFavoriteQuestions = computed(() => Array.from(favoriteQuestions.value));
  
  // Filter questions by various criteria
  const getFilteredQuestions = (filters: {
    chapterId?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    onlyFavorites?: boolean;
  }) => {
    return questions.value.filter(question => {
      if (filters.chapterId && question.chapterId !== filters.chapterId) return false;
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
      if (filters.tags && filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag => question.tags.includes(tag));
        if (!hasAllTags) return false;
      }
      if (filters.onlyFavorites && !favoriteQuestions.value.has(question.id)) return false;
      
      return true;
    });
  };
  
  // Actions
  async function fetchChapters() {
    isLoading.value = true;
    
    try {
      // 从API获取考试集作为章节
      const response = await questionService.getExamSets();
      
      // 将API返回的考试集数据转换为章节格式
      const apiExamSets = response.data.items || [];
      
      chapters.value = apiExamSets.map((examSet: ExamSet) => ({
        id: String(examSet.exam_set_id),
        name: examSet.exam_name,
        // 可以后续扩展子章节，如果API提供这样的数据结构
        children: []
      }));
    } catch (err: any) {
      error.value = err.message || '获取章节失败';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchQuestions(chapterId?: string) {
    isLoading.value = true;
    
    try {
      // 从API获取问题
      const filters = chapterId ? { exam_set_id: Number(chapterId) } : {};
      const response = await questionService.getQuestions(filters);
      
      // 将API返回的问题数据转换为前端使用的格式
      const apiQuestions = response.data.items || [];
      
      questions.value = apiQuestions.map((q: APIQuestion) => {
        return {
          id: String(q.question_id),
          title: `问题 ${q.question_number}`,
          content: q.content, 
          options: q.options ? q.options.map(opt => ({
            key: opt.option_label,
            content: opt.option_content
          })) : [],
          answer: q.correct_answer,
          explanation: q.options?.find(o => o.option_label === q.correct_answer)?.option_content || '解析暂无',
          chapterId: String(q.exam_set_id),
          difficulty: 'medium' as 'easy' | 'medium' | 'hard', // 可以根据API的值映射
          tags: [], // 可以根据需要从API数据中提取
          createdAt: new Date().toISOString()
        };
      });
    } catch (err: any) {
      error.value = err.message || '获取问题失败';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchExerciseHistory() {
    isLoading.value = true;
    
    try {
      // 从API获取练习历史
      const response = await practiceService.getPracticeHistory();
      const apiHistory = response.data.items || [];
      
      // 将API返回的历史数据转换为前端使用的格式
      exerciseHistory.value = apiHistory.map((h: any) => ({
        id: String(h.history_id),
        startedAt: h.start_time,
        completedAt: h.end_time,
        score: h.score,
        totalQuestions: h.total_questions,
        correctAnswers: h.correct_questions,
        answers: [], // 可能需要额外的API调用来获取详细的答题记录
        chapterId: h.category || null
      }));
    } catch (err: any) {
      error.value = err.message || '获取练习历史失败';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function toggleFavorite(questionId: string) {
    try {
      if (favoriteQuestions.value.has(questionId)) {
        // 取消收藏
        await practiceService.unfavoriteQuestion(Number(questionId));
        favoriteQuestions.value.delete(questionId);
      } else {
        // 添加收藏
        await practiceService.favoriteQuestion(Number(questionId));
        favoriteQuestions.value.add(questionId);
      }
    } catch (err: any) {
      error.value = err.message || '更新收藏状态失败';
    }
  }
  
  async function fetchFavoriteQuestions() {
    try {
      const response = await practiceService.getFavoriteQuestions();
      const favQuestions = response.data.items || [];
      
      // 更新收藏集合
      favoriteQuestions.value = new Set(
        favQuestions.map((q: any) => String(q.question_id))
      );
    } catch (err: any) {
      error.value = err.message || '获取收藏题目失败';
    }
  }
  
  async function startExercise(params: {
    chapterId?: string;
    questionIds?: string[];
    timeLimit?: number;
  }) {
    try {
      isLoading.value = true;
      
      let exerciseQuestions: Question[] = [];
      
      if (params.questionIds && params.questionIds.length > 0) {
        // 如果提供了特定的问题ID列表
        exerciseQuestions = params.questionIds
          .map(id => questions.value.find(q => q.id === id))
          .filter((q): q is Question => q !== undefined);
      } else if (params.chapterId) {
        // 基于章节开始练习
        const count = 10; // 默认题目数量
        const response = await questionService.getExamSetQuestions(Number(params.chapterId));
        
        // 转换API返回的问题
        const apiQuestions = response.data || [];
        exerciseQuestions = apiQuestions.map((q: APIQuestion) => ({
          id: String(q.question_id),
          title: `问题 ${q.question_number}`,
          content: q.content,
          options: q.options ? q.options.map(opt => ({
            key: opt.option_label,
            content: opt.option_content
          })) : [],
          answer: q.correct_answer,
          explanation: q.options?.find(o => o.option_label === q.correct_answer)?.option_content || '解析暂无',
          chapterId: String(q.exam_set_id),
          difficulty: 'medium' as 'easy' | 'medium' | 'hard',
          tags: [],
          createdAt: new Date().toISOString()
        }));
      } else {
        // 随机练习
        const response = await questionService.getRandomQuestions();
        const apiQuestions = response.data || [];
        
        exerciseQuestions = apiQuestions.map((q: APIQuestion) => ({
          id: String(q.question_id),
          title: `问题 ${q.question_number}`,
          content: q.content,
          options: q.options ? q.options.map(opt => ({
            key: opt.option_label,
            content: opt.option_content
          })) : [],
          answer: q.correct_answer,
          explanation: q.options?.find(o => o.option_label === q.correct_answer)?.option_content || '解析暂无',
          chapterId: String(q.exam_set_id),
          difficulty: 'medium' as 'easy' | 'medium' | 'hard',
          tags: [],
          createdAt: new Date().toISOString()
        }));
      }
      
      // 创建新的练习会话
      currentExercise.value = {
        questions: exerciseQuestions,
        answers: {},
        startTime: new Date(),
        timeLimit: params.timeLimit || null,
        chapterId: params.chapterId || null
      };
      
      // 在本地存储中保存当前练习状态
      saveExerciseToCache();
      
      return true;
    } catch (err: any) {
      error.value = err.message || '开始练习失败';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  function saveAnswer(questionId: string, answer: string) {
    if (!currentExercise.value) return false;
    
    currentExercise.value.answers[questionId] = answer;
    saveExerciseToCache();
    return true;
  }
  
  async function submitExercise() {
    if (!currentExercise.value) return null;
    
    try {
      isLoading.value = true;
      
      const { questions, answers, startTime, chapterId } = currentExercise.value;
      let correctAnswers = 0;
      
      // 计算正确答案数量
      for (const question of questions) {
        const userAnswer = answers[question.id];
        if (userAnswer === question.answer) {
          correctAnswers++;
        } else if (userAnswer && question.id) {
          // 如果答错了，添加到错题本
          try {
            await mistakeService.addMistake(Number(question.id));
          } catch (e) {
            console.error('添加错题失败', e);
          }
        }
      }
      
      const score = questions.length > 0 
        ? Math.round((correctAnswers / questions.length) * 100)
        : 0;
      
      const completedAt = new Date().toISOString();
      
      // 创建新的历史记录
      const newHistory: ExerciseHistory = {
        id: `h${Date.now()}`,
        startedAt: startTime.toISOString(),
        completedAt,
        score,
        totalQuestions: questions.length,
        correctAnswers,
        answers: Object.entries(answers).map(([qId, ans]) => {
          const question = questions.find(q => q.id === qId);
          return {
            questionId: qId,
            answer: ans,
            isCorrect: question ? ans === question.answer : false,
            timeSpent: 0, // 这里可以计算答题时间，如果有记录
            submittedAt: completedAt
          };
        }),
        chapterId: chapterId
      };
      
      // 将新历史添加到历史列表
      exerciseHistory.value.unshift(newHistory);
      
      // 清除当前练习
      currentExercise.value = null;
      localStorage.removeItem('currentExercise');
      
      return newHistory;
    } catch (err: any) {
      error.value = err.message || '提交练习失败';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  function saveExerciseToCache() {
    if (currentExercise.value) {
      localStorage.setItem('currentExercise', JSON.stringify({
        ...currentExercise.value,
        startTime: currentExercise.value.startTime.toISOString()
      }));
    }
  }
  
  function loadExerciseFromCache() {
    const cached = localStorage.getItem('currentExercise');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        currentExercise.value = {
          ...parsed,
          startTime: new Date(parsed.startTime)
        };
        return true;
      } catch (e) {
        console.error('Failed to parse cached exercise', e);
        localStorage.removeItem('currentExercise');
      }
    }
    return false;
  }
  
  async function init() {
    // 加载缓存的练习（如果有）
    loadExerciseFromCache();
    
    // 获取章节和收藏的题目
    await Promise.all([
      fetchChapters(),
      fetchFavoriteQuestions()
    ]);
  }
  
  return {
    // State
    chapters,
    questions,
    currentExercise,
    exerciseHistory,
    isLoading,
    error,
    
    // Getters
    getChapters,
    getAllQuestions,
    getCurrentExercise,
    getExerciseHistory,
    getFavoriteQuestions,
    getFilteredQuestions,
    
    // Actions
    fetchChapters,
    fetchQuestions,
    fetchExerciseHistory,
    toggleFavorite,
    fetchFavoriteQuestions,
    startExercise,
    saveAnswer,
    submitExercise,
    init
  };
}); 