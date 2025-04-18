import type { Question } from '@/types/exercise';
import mockExerciseService from './mockExerciseService';

// 错题类型定义
export interface WrongQuestion {
  id: string;
  questionId: string;
  userId: string;
  wrongCount: number;
  lastWrongTime: string;
  note: string | null;
  status: 'new' | 'reviewing' | 'mastered';
  question?: Question;
  createdAt: string;
  updatedAt: string;
}

// 模拟本地存储的错题数据
let localWrongQuestions: WrongQuestion[] = [];

// 初始化一些模拟数据
const initMockData = async () => {
  if (localWrongQuestions.length === 0) {
    const allQuestions = await mockExerciseService.getAllQuestions();
    // 随机选择20%的题目作为错题
    const wrongQuestionCount = Math.floor(allQuestions.length * 0.2);
    const selectedQuestions = allQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, wrongQuestionCount);
    
    localWrongQuestions = selectedQuestions.map((question, index) => {
      const wrongCount = Math.floor(Math.random() * 3) + 1; // 1-3次错误
      const daysAgo = Math.floor(Math.random() * 30);
      const lastWrongTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      const statuses: Array<'new' | 'reviewing' | 'mastered'> = ['new', 'reviewing', 'mastered'];
      const status = statuses[Math.floor(Math.random() * (wrongCount > 2 ? 3 : 2))];
      
      return {
        id: `wq-${index + 1}`,
        questionId: question.id,
        userId: 'user-1',
        wrongCount,
        lastWrongTime,
        note: Math.random() > 0.5 ? `这是关于${question.knowledge}的笔记，需要重点复习。` : null,
        status,
        question,
        createdAt: new Date(Date.now() - (daysAgo + 5) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: lastWrongTime
      };
    });
  }
};

// 模拟API服务
export default {
  // 获取用户的所有错题
  async getUserWrongQuestions(): Promise<WrongQuestion[]> {
    await initMockData();
    
    // 模拟网络延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...localWrongQuestions]);
      }, 500);
    });
  },
  
  // 获取错题详情
  async getWrongQuestionById(id: string): Promise<WrongQuestion | null> {
    await initMockData();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const wrongQuestion = localWrongQuestions.find(wq => wq.id === id);
        resolve(wrongQuestion || null);
      }, 300);
    });
  },
  
  // 添加错题
  async addWrongQuestion(questionId: string): Promise<WrongQuestion> {
    await initMockData();
    
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        // 检查是否已经是错题
        const existingIndex = localWrongQuestions.findIndex(wq => wq.questionId === questionId);
        
        if (existingIndex >= 0) {
          // 更新错误次数和时间
          const updatedWrongQuestion = {
            ...localWrongQuestions[existingIndex],
            wrongCount: localWrongQuestions[existingIndex].wrongCount + 1,
            lastWrongTime: new Date().toISOString(),
            status: 'reviewing' as const,
            updatedAt: new Date().toISOString()
          };
          
          localWrongQuestions[existingIndex] = updatedWrongQuestion;
          resolve(updatedWrongQuestion);
        } else {
          // 创建新错题
          const allQuestions = await mockExerciseService.getAllQuestions();
          const question = allQuestions.find(q => q.id === questionId);
          
          if (!question) {
            throw new Error(`Question with ID ${questionId} not found`);
          }
          
          const newWrongQuestion: WrongQuestion = {
            id: `wq-${Date.now()}`,
            questionId,
            userId: 'user-1',
            wrongCount: 1,
            lastWrongTime: new Date().toISOString(),
            note: null,
            status: 'new',
            question,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          localWrongQuestions.push(newWrongQuestion);
          resolve(newWrongQuestion);
        }
      }, 400);
    });
  },
  
  // 更新错题状态
  async updateWrongQuestionStatus(id: string, status: 'new' | 'reviewing' | 'mastered'): Promise<WrongQuestion> {
    await initMockData();
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = localWrongQuestions.findIndex(wq => wq.id === id);
        
        if (index === -1) {
          reject(new Error(`Wrong question with ID ${id} not found`));
          return;
        }
        
        const updatedWrongQuestion = {
          ...localWrongQuestions[index],
          status,
          updatedAt: new Date().toISOString()
        };
        
        localWrongQuestions[index] = updatedWrongQuestion;
        resolve(updatedWrongQuestion);
      }, 300);
    });
  },
  
  // 更新错题笔记
  async updateWrongQuestionNote(id: string, note: string): Promise<WrongQuestion> {
    await initMockData();
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = localWrongQuestions.findIndex(wq => wq.id === id);
        
        if (index === -1) {
          reject(new Error(`Wrong question with ID ${id} not found`));
          return;
        }
        
        const updatedWrongQuestion = {
          ...localWrongQuestions[index],
          note,
          updatedAt: new Date().toISOString()
        };
        
        localWrongQuestions[index] = updatedWrongQuestion;
        resolve(updatedWrongQuestion);
      }, 300);
    });
  },
  
  // 删除错题
  async deleteWrongQuestion(id: string): Promise<boolean> {
    await initMockData();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = localWrongQuestions.length;
        localWrongQuestions = localWrongQuestions.filter(wq => wq.id !== id);
        
        resolve(localWrongQuestions.length < initialLength);
      }, 300);
    });
  }
}; 