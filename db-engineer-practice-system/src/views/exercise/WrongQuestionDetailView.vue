<template>
  <div class="wrong-question-detail-container">
    <el-page-header @back="goBack" title="返回错题本">
      <template #content>
        <span class="page-header-title">错题详情</span>
      </template>
    </el-page-header>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <template v-else-if="wrongQuestion">
      <!-- 题目卡片 -->
      <el-card class="question-card">
        <div class="question-header">
          <div class="question-tags">
            <el-tag size="medium">{{ wrongQuestion.question?.knowledge }}</el-tag>
            <el-tag size="medium" type="info">{{ wrongQuestion.question?.type }}</el-tag>
            <el-tag 
              size="medium" 
              :type="wrongQuestion.status === 'new' ? 'danger' : wrongQuestion.status === 'reviewing' ? 'warning' : 'success'"
            >
              {{ wrongQuestion.status === 'new' ? '待学习' : wrongQuestion.status === 'reviewing' ? '复习中' : '已掌握' }}
            </el-tag>
          </div>
          
          <div class="question-meta">
            <el-tooltip content="错误次数" placement="top">
              <div class="meta-item">
                <i class="el-icon-warning-outline"></i>
                <span>{{ wrongQuestion.wrongCount }} 次错误</span>
              </div>
            </el-tooltip>
            
            <el-tooltip content="最近错误时间" placement="top">
              <div class="meta-item">
                <i class="el-icon-time"></i>
                <span>{{ formatDate(wrongQuestion.lastWrongTime) }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
        
        <div class="question-content">
          <h3>题目内容</h3>
          <p>{{ wrongQuestion.question?.content }}</p>
        </div>
        
        <div v-if="wrongQuestion.question?.options" class="question-options">
          <h3>选项</h3>
          <el-row :gutter="20">
            <el-col 
              v-for="option in wrongQuestion.question.options" 
              :key="option.id" 
              :xs="24" 
              :sm="12"
              class="option-item"
            >
              <div 
                class="option" 
                :class="{ 'correct-option': isCorrectOption(option.id) }"
              >
                <span class="option-label">{{ option.id }}</span>
                <span class="option-text">{{ option.text }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="question-answer">
          <h3>正确答案</h3>
          <div class="answer-content">{{ wrongQuestion.question?.answer }}</div>
        </div>
        
        <div class="question-analysis" v-if="wrongQuestion.question?.analysis">
          <h3>解析</h3>
          <div class="analysis-content">{{ wrongQuestion.question?.analysis }}</div>
        </div>
      </el-card>
      
      <!-- 笔记卡片 -->
      <el-card class="note-card">
        <template #header>
          <div class="note-header">
            <h3>我的笔记</h3>
            <el-button 
              type="primary" 
              size="small"
              :icon="noteEditMode ? 'el-icon-check' : 'el-icon-edit'"
              @click="toggleNoteEditMode"
            >
              {{ noteEditMode ? '保存' : '编辑' }}
            </el-button>
          </div>
        </template>
        
        <div v-if="noteEditMode" class="note-edit">
          <el-input
            v-model="noteContent"
            type="textarea"
            :rows="6"
            placeholder="添加你的笔记..."
          ></el-input>
        </div>
        
        <div v-else class="note-content">
          <p v-if="wrongQuestion.note">{{ wrongQuestion.note }}</p>
          <el-empty v-else description="暂无笔记" />
        </div>
      </el-card>
      
      <!-- 学习进度卡片 -->
      <el-card class="progress-card">
        <template #header>
          <h3>学习进度</h3>
        </template>
        
        <el-steps :active="statusStepMap[wrongQuestion.status]" finish-status="success">
          <el-step title="待学习" description="初次添加到错题本"></el-step>
          <el-step title="复习中" description="正在巩固记忆"></el-step>
          <el-step title="已掌握" description="已经熟练掌握"></el-step>
        </el-steps>
        
        <div class="status-actions">
          <el-button 
            type="primary" 
            :disabled="wrongQuestion.status === 'mastered'"
            @click="updateStatus('mastered')"
          >
            标记为已掌握
          </el-button>
          
          <el-button 
            type="warning" 
            :disabled="wrongQuestion.status === 'reviewing'"
            @click="updateStatus('reviewing')"
          >
            标记为复习中
          </el-button>
          
          <el-button 
            type="danger" 
            :disabled="wrongQuestion.status === 'new'"
            @click="updateStatus('new')"
          >
            标记为待学习
          </el-button>
        </div>
      </el-card>
    </template>
    
    <el-empty v-else description="未找到错题" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import wrongQuestionService, { type WrongQuestion } from '@/services/mockWrongQuestionService';

const route = useRoute();
const router = useRouter();

const wrongQuestion = ref<WrongQuestion | null>(null);
const loading = ref(true);
const noteEditMode = ref(false);
const noteContent = ref('');

// 状态步骤映射
const statusStepMap = {
  'new': 0,
  'reviewing': 1,
  'mastered': 2
};

// 判断是否为正确选项
const isCorrectOption = (optionId: string) => {
  const answer = wrongQuestion.value?.question?.answer;
  
  if (typeof answer === 'string') {
    return answer === optionId || answer.split(',').includes(optionId);
  }
  
  return false;
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 加载错题详情
const loadWrongQuestion = async () => {
  loading.value = true;
  try {
    const id = route.params.id as string;
    const data = await wrongQuestionService.getWrongQuestionById(id);
    
    if (data) {
      wrongQuestion.value = data;
      noteContent.value = data.note || '';
    } else {
      ElMessage.error('未找到该错题');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('加载错题详情失败');
  } finally {
    loading.value = false;
  }
};

// 切换笔记编辑模式
const toggleNoteEditMode = async () => {
  if (noteEditMode.value) {
    // 保存笔记
    try {
      if (wrongQuestion.value) {
        await wrongQuestionService.updateWrongQuestionNote(wrongQuestion.value.id, noteContent.value);
        wrongQuestion.value.note = noteContent.value;
        ElMessage.success('笔记保存成功');
      }
    } catch (error) {
      console.error(error);
      ElMessage.error('保存笔记失败');
    }
  } else {
    // 进入编辑模式
    noteContent.value = wrongQuestion.value?.note || '';
  }
  
  noteEditMode.value = !noteEditMode.value;
};

// 更新状态
const updateStatus = async (status: 'new' | 'reviewing' | 'mastered') => {
  try {
    if (wrongQuestion.value) {
      const updated = await wrongQuestionService.updateWrongQuestionStatus(wrongQuestion.value.id, status);
      wrongQuestion.value = updated;
      ElMessage.success('状态更新成功');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('更新状态失败');
  }
};

// 返回上一页
const goBack = () => {
  router.push('/wrong-questions');
};

// 生命周期钩子
onMounted(() => {
  loadWrongQuestion();
});
</script>

<style scoped>
.wrong-question-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header-title {
  font-size: 18px;
  font-weight: bold;
}

.loading-container {
  margin-top: 20px;
}

.question-card,
.note-card,
.progress-card {
  margin-top: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-tags {
  display: flex;
  gap: 10px;
}

.question-meta {
  display: flex;
  gap: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
}

.question-content,
.question-options,
.question-answer,
.question-analysis {
  margin-bottom: 20px;
}

.question-content h3,
.question-options h3,
.question-answer h3,
.question-analysis h3 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 16px;
}

.option-item {
  margin-bottom: 10px;
}

.option {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.correct-option {
  background-color: rgba(103, 194, 58, 0.1);
  border-left: 3px solid #67c23a;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 20px;
}

.option-text {
  flex: 1;
}

.answer-content {
  padding: 10px;
  background-color: rgba(103, 194, 58, 0.1);
  border-radius: 4px;
  font-weight: bold;
  color: #67c23a;
}

.analysis-content {
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  line-height: 1.6;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-header h3 {
  margin: 0;
}

.note-content {
  min-height: 100px;
  line-height: 1.6;
}

.note-edit {
  margin-bottom: 15px;
}

.status-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .question-meta {
    width: 100%;
    justify-content: space-between;
  }
  
  .status-actions {
    flex-direction: column;
  }
}
</style> 