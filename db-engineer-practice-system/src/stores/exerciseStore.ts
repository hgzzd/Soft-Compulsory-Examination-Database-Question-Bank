import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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
      // TODO: API endpoint for chapters
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock chapter data
      chapters.value = [
        {
          id: 'ch1',
          name: '数据库系统概论',
          children: [
            { id: 'ch1-1', name: '数据库系统概述' },
            { id: 'ch1-2', name: '数据模型' },
            { id: 'ch1-3', name: '关系数据库标准语言SQL' }
          ]
        },
        {
          id: 'ch2',
          name: '数据库设计',
          children: [
            { id: 'ch2-1', name: '数据库设计方法' },
            { id: 'ch2-2', name: 'E-R模型及其应用' },
            { id: 'ch2-3', name: '关系数据理论' }
          ]
        },
        {
          id: 'ch3',
          name: '数据库系统实现技术',
          children: [
            { id: 'ch3-1', name: '数据存储' },
            { id: 'ch3-2', name: '索引与查询优化' },
            { id: 'ch3-3', name: '事务处理' }
          ]
        }
      ];
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch chapters';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchQuestions(chapterId?: string) {
    isLoading.value = true;
    
    try {
      // TODO: API endpoint for questions
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock question data
      const mockQuestions: Question[] = [];
      
      // Generate 20 mock questions
      for (let i = 1; i <= 20; i++) {
        mockQuestions.push({
          id: `q${i}`,
          title: `数据库示例问题 ${i}`,
          content: `这是关于数据库系统的第 ${i} 个示例问题，这里可能包含较长的问题描述，还可能包含SQL代码或其他技术内容。`,
          options: [
            { key: 'A', content: '选项A的内容' },
            { key: 'B', content: '选项B的内容' },
            { key: 'C', content: '选项C的内容' },
            { key: 'D', content: '选项D的内容' }
          ],
          answer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
          explanation: `这是问题 ${i} 的详细解答，包含了知识点和解题思路。`,
          chapterId: chapterId || ['ch1-1', 'ch1-2', 'ch2-1', 'ch3-2'][Math.floor(Math.random() * 4)],
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
          tags: ['SQL', '数据模型', '事务', '索引'][Math.floor(Math.random() * 4)].split(','),
          createdAt: new Date().toISOString()
        });
      }
      
      questions.value = mockQuestions;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch questions';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchExerciseHistory() {
    isLoading.value = true;
    
    try {
      // TODO: API endpoint for exercise history
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock history data
      exerciseHistory.value = [
        {
          id: 'h1',
          startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          score: 80,
          totalQuestions: 10,
          correctAnswers: 8,
          answers: [],
          chapterId: 'ch1-1'
        },
        {
          id: 'h2',
          startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
          score: 70,
          totalQuestions: 10,
          correctAnswers: 7,
          answers: [],
          chapterId: 'ch2-1'
        }
      ];
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch exercise history';
    } finally {
      isLoading.value = false;
    }
  }
  
  function startExercise(params: {
    chapterId?: string;
    questionIds?: string[];
    timeLimit?: number;
  }) {
    // Filter questions based on parameters
    let selectedQuestions: Question[] = [];
    
    if (params.questionIds && params.questionIds.length > 0) {
      selectedQuestions = questions.value.filter(q => params.questionIds?.includes(q.id));
    } else if (params.chapterId) {
      selectedQuestions = questions.value.filter(q => q.chapterId === params.chapterId);
    } else {
      // Random selection of 10 questions
      const shuffled = [...questions.value].sort(() => 0.5 - Math.random());
      selectedQuestions = shuffled.slice(0, 10);
    }
    
    // Initialize current exercise
    currentExercise.value = {
      questions: selectedQuestions,
      answers: {},
      startTime: new Date(),
      timeLimit: params.timeLimit || null,
      chapterId: params.chapterId || null
    };
    
    // Save to local storage for cache mechanism
    saveExerciseToCache();
    
    return selectedQuestions.length;
  }
  
  function saveAnswer(questionId: string, answer: string) {
    if (!currentExercise.value) return false;
    
    currentExercise.value.answers[questionId] = answer;
    
    // Update cache
    saveExerciseToCache();
    
    return true;
  }
  
  function submitExercise() {
    if (!currentExercise.value) return null;
    
    const { questions: exerciseQuestions, answers, startTime, chapterId } = currentExercise.value;
    
    // Calculate results
    const userAnswers: UserAnswer[] = [];
    let correctCount = 0;
    
    exerciseQuestions.forEach(question => {
      const userAnswer = answers[question.id] || '';
      const isCorrect = userAnswer === question.answer;
      
      if (isCorrect) correctCount++;
      
      userAnswers.push({
        questionId: question.id,
        answer: userAnswer,
        isCorrect,
        timeSpent: 0, // Would calculate from individual question timestamps in a real app
        submittedAt: new Date().toISOString()
      });
    });
    
    const completedAt = new Date().toISOString();
    const score = Math.round((correctCount / exerciseQuestions.length) * 100);
    
    // Create history entry
    const historyEntry: ExerciseHistory = {
      id: `h${Date.now()}`,
      startedAt: startTime.toISOString(),
      completedAt,
      score,
      totalQuestions: exerciseQuestions.length,
      correctAnswers: correctCount,
      answers: userAnswers,
      chapterId
    };
    
    // Add to history
    exerciseHistory.value.push(historyEntry);
    
    // Reset current exercise
    currentExercise.value = null;
    
    // Clear cache
    localStorage.removeItem('current_exercise');
    
    return historyEntry;
  }
  
  function toggleFavorite(questionId: string) {
    if (favoriteQuestions.value.has(questionId)) {
      favoriteQuestions.value.delete(questionId);
    } else {
      favoriteQuestions.value.add(questionId);
    }
    
    // Persist favorites
    localStorage.setItem('favorite_questions', JSON.stringify(Array.from(favoriteQuestions.value)));
    
    return favoriteQuestions.value.has(questionId);
  }
  
  // Cache mechanism
  function saveExerciseToCache() {
    if (!currentExercise.value) return;
    
    localStorage.setItem('current_exercise', JSON.stringify({
      ...currentExercise.value,
      startTime: currentExercise.value.startTime.toISOString()
    }));
  }
  
  function loadExerciseFromCache() {
    const cachedExercise = localStorage.getItem('current_exercise');
    
    if (cachedExercise) {
      try {
        const parsed = JSON.parse(cachedExercise);
        
        currentExercise.value = {
          ...parsed,
          startTime: new Date(parsed.startTime)
        };
        
        return true;
      } catch (e) {
        console.error('Failed to parse cached exercise', e);
        localStorage.removeItem('current_exercise');
      }
    }
    
    return false;
  }
  
  // Initialize store
  function init() {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorite_questions');
    
    if (savedFavorites) {
      try {
        favoriteQuestions.value = new Set(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
    
    // Try to load current exercise from cache
    loadExerciseFromCache();
  }
  
  // Call init when store is created
  init();

  return {
    // State
    chapters,
    questions,
    currentExercise,
    exerciseHistory,
    favoriteQuestions,
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
    startExercise,
    saveAnswer,
    submitExercise,
    toggleFavorite,
    loadExerciseFromCache
  };
}); 