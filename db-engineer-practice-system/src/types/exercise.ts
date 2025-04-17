export interface Question {
  id: string;
  content: string;
  options?: Array<{
    id: string;
    text: string;
  }>;
  answer: string | string[];
  type: string;
  analysis?: string;
  difficulty: number;
  knowledge: string;
}

export interface ExerciseRecord {
  id: string;
  userId: string;
  date: string;
  duration: number; // 单位：分钟
  questions: Question[];
  answers: Array<{
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
  }>;
  correctCount: number;
  incorrectCount: number;
  score: number;
}

export interface ExerciseStatistics {
  totalExercises: number;
  totalQuestions: number;
  correctRate: number;
  totalTime: number;
  averageScore: number;
  knowledgeDistribution: Record<string, number>;
  questionTypeDistribution: Record<string, number>;
  dailyProgress: Array<{
    date: string;
    count: number;
    correctRate: number;
    duration: number;
  }>;
} 