import type { Question, ExerciseRecord } from '@/types/exercise';

// 模拟知识点数据
const knowledgePoints = [
  '数据库设计',
  'SQL基础',
  '关系代数',
  '数据库索引',
  '事务管理',
  '数据完整性',
  '范式理论',
  '数据库安全'
];

// 模拟题目类型
const questionTypes = ['单选题', '多选题', '判断题', '填空题', '简答题'];

// 生成随机日期（过去30天内）
const generateRandomDate = (): string => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return pastDate.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
};

// 生成随机题目
const generateMockQuestions = (count: number): Question[] => {
  const questions: Question[] = [];
  
  for (let i = 1; i <= count; i++) {
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const knowledge = knowledgePoints[Math.floor(Math.random() * knowledgePoints.length)];
    const difficulty = Math.floor(Math.random() * 5) + 1; // 1-5的难度
    
    let options = null;
    if (type === '单选题' || type === '多选题') {
      options = [
        { id: 'A', text: `选项A-${i}` },
        { id: 'B', text: `选项B-${i}` },
        { id: 'C', text: `选项C-${i}` },
        { id: 'D', text: `选项D-${i}` }
      ];
    }
    
    const answer = type === '单选题' ? 'A' : 
                   type === '多选题' ? ['A', 'C'] : 
                   type === '判断题' ? '正确' : 
                   type === '填空题' ? '答案文本' : '简答题答案示例';
    
    questions.push({
      id: `q-${i}`,
      content: `这是一道关于${knowledge}的${type}，难度为${difficulty}。问题内容...`,
      options,
      answer,
      type,
      analysis: `这道题目考察了${knowledge}的基本概念和应用，解题思路是...`,
      difficulty,
      knowledge
    });
  }
  
  return questions;
};

// 生成模拟练习记录
const generateMockExerciseRecords = (count: number): ExerciseRecord[] => {
  const records: ExerciseRecord[] = [];
  
  for (let i = 1; i <= count; i++) {
    const questionCount = Math.floor(Math.random() * 20) + 10; // 10-30题
    const questions = generateMockQuestions(questionCount);
    const correctCount = Math.floor(Math.random() * questionCount);
    const incorrectCount = questionCount - correctCount;
    
    records.push({
      id: `er-${i}`,
      userId: 'user-1',
      date: generateRandomDate(),
      duration: Math.floor(Math.random() * 60) + 30, // 30-90分钟
      questions,
      answers: questions.map(q => ({ 
        questionId: q.id, 
        userAnswer: Math.random() > 0.3 ? q.answer : '错误答案', 
        isCorrect: Math.random() > 0.3
      })),
      correctCount,
      incorrectCount,
      score: Math.floor((correctCount / questionCount) * 100)
    });
  }
  
  // 按日期排序
  return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// 模拟API服务
export default {
  // 获取用户的所有练习记录
  async getUserExerciseHistory(): Promise<ExerciseRecord[]> {
    // 模拟网络延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockExerciseRecords(20)); // 生成20条练习记录
      }, 500);
    });
  },
  
  // 获取所有题目
  async getAllQuestions(): Promise<Question[]> {
    // 模拟网络延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockQuestions(100)); // 生成100道题目
      }, 300);
    });
  }
}; 