<template>
  <div class="wrong-questions-container">
    <h1 class="page-title">我的错题本</h1>
    
    <!-- 错题统计卡片 -->
    <el-card class="stats-card">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ wrongQuestions.length }}</div>
          <div class="stat-label">错题总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ newCount }}</div>
          <div class="stat-label">待学习</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ reviewingCount }}</div>
          <div class="stat-label">复习中</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ masteredCount }}</div>
          <div class="stat-label">已掌握</div>
        </div>
      </div>
    </el-card>
    
    <!-- 筛选器 -->
    <div class="filter-container">
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable>
        <el-option label="待学习" value="new" />
        <el-option label="复习中" value="reviewing" />
        <el-option label="已掌握" value="mastered" />
      </el-select>
      
      <el-select v-model="knowledgeFilter" placeholder="知识点筛选" clearable>
        <el-option 
          v-for="point in knowledgePoints" 
          :key="point" 
          :label="point" 
          :value="point" 
        />
      </el-select>
      
      <el-select v-model="sortBy" placeholder="排序方式">
        <el-option label="最近错误时间" value="lastWrongTime" />
        <el-option label="错误次数（多到少）" value="wrongCountDesc" />
        <el-option label="错误次数（少到多）" value="wrongCountAsc" />
      </el-select>
    </div>
    
    <!-- 错题列表 -->
    <div v-if="filteredWrongQuestions.length > 0" class="question-list">
      <el-card 
        v-for="wrongQuestion in filteredWrongQuestions" 
        :key="wrongQuestion.id" 
        class="question-card"
        :class="{ 'status-new': wrongQuestion.status === 'new', 'status-reviewing': wrongQuestion.status === 'reviewing', 'status-mastered': wrongQuestion.status === 'mastered' }"
      >
        <div class="question-header">
          <div class="question-info">
            <el-tag size="small">{{ wrongQuestion.question?.knowledge }}</el-tag>
            <el-tag size="small" type="info">{{ wrongQuestion.question?.type }}</el-tag>
            <el-tag 
              size="small" 
              :type="wrongQuestion.status === 'new' ? 'danger' : wrongQuestion.status === 'reviewing' ? 'warning' : 'success'"
            >
              {{ wrongQuestion.status === 'new' ? '待学习' : wrongQuestion.status === 'reviewing' ? '复习中' : '已掌握' }}
            </el-tag>
          </div>
          <div class="question-meta">
            <span>错误 {{ wrongQuestion.wrongCount }} 次</span>
            <span>最近错误: {{ formatDate(wrongQuestion.lastWrongTime) }}</span>
          </div>
        </div>
        
        <div class="question-content">{{ wrongQuestion.question?.content }}</div>
        
        <div class="question-options" v-if="wrongQuestion.question?.options">
          <div v-for="option in wrongQuestion.question.options" :key="option.id" class="option">
            <span class="option-label">{{ option.id }}:</span>
            <span class="option-text">{{ option.text }}</span>
          </div>
        </div>
        
        <div class="question-answer">
          <strong>正确答案:</strong> {{ wrongQuestion.question?.answer }}
        </div>
        
        <div class="question-note" v-if="wrongQuestion.note">
          <strong>笔记:</strong> {{ wrongQuestion.note }}
        </div>
        
        <div class="question-actions">
          <router-link :to="`/wrong-questions/${wrongQuestion.id}`">
            <el-button type="primary" size="small">详情</el-button>
          </router-link>
          
          <el-dropdown @command="(command) => handleStatusChange(wrongQuestion.id, command)" trigger="click">
            <el-button size="small" type="success">
              更新状态 <i class="el-icon-arrow-down"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :disabled="wrongQuestion.status === 'new'" command="new">标记为待学习</el-dropdown-item>
                <el-dropdown-item :disabled="wrongQuestion.status === 'reviewing'" command="reviewing">标记为复习中</el-dropdown-item>
                <el-dropdown-item :disabled="wrongQuestion.status === 'mastered'" command="mastered">标记为已掌握</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <el-button type="danger" size="small" @click="handleDelete(wrongQuestion.id)">
            删除
          </el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 空状态 -->
    <el-empty v-else description="没有找到错题记录" />
    
    <!-- 添加笔记对话框 -->
    <el-dialog v-model="noteDialogVisible" title="添加笔记" width="50%">
      <el-form>
        <el-form-item>
          <el-input
            v-model="currentNote"
            type="textarea"
            rows="4"
            placeholder="输入你的笔记..."
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="noteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNote">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 确认删除对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="30%">
      <p>确定要从错题本中删除此题目吗？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import wrongQuestionService, { type WrongQuestion } from '@/services/mockWrongQuestionService';

// 状态变量
const wrongQuestions = ref<WrongQuestion[]>([]);
const loading = ref(true);
const statusFilter = ref('');
const knowledgeFilter = ref('');
const sortBy = ref('lastWrongTime');
const noteDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const currentWrongQuestionId = ref('');
const currentNote = ref('');

// 计算属性
const knowledgePoints = computed(() => {
  const points = new Set<string>();
  wrongQuestions.value.forEach(wq => {
    if (wq.question?.knowledge) {
      points.add(wq.question.knowledge);
    }
  });
  return Array.from(points);
});

const newCount = computed(() => 
  wrongQuestions.value.filter(wq => wq.status === 'new').length
);

const reviewingCount = computed(() => 
  wrongQuestions.value.filter(wq => wq.status === 'reviewing').length
);

const masteredCount = computed(() => 
  wrongQuestions.value.filter(wq => wq.status === 'mastered').length
);

const filteredWrongQuestions = computed(() => {
  let filtered = [...wrongQuestions.value];
  
  // 应用状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(wq => wq.status === statusFilter.value);
  }
  
  // 应用知识点筛选
  if (knowledgeFilter.value) {
    filtered = filtered.filter(wq => wq.question?.knowledge === knowledgeFilter.value);
  }
  
  // 应用排序
  if (sortBy.value === 'lastWrongTime') {
    filtered.sort((a, b) => new Date(b.lastWrongTime).getTime() - new Date(a.lastWrongTime).getTime());
  } else if (sortBy.value === 'wrongCountDesc') {
    filtered.sort((a, b) => b.wrongCount - a.wrongCount);
  } else if (sortBy.value === 'wrongCountAsc') {
    filtered.sort((a, b) => a.wrongCount - b.wrongCount);
  }
  
  return filtered;
});

// 方法
const fetchWrongQuestions = async () => {
  loading.value = true;
  try {
    wrongQuestions.value = await wrongQuestionService.getUserWrongQuestions();
  } catch (error) {
    ElMessage.error('获取错题失败，请稍后重试');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const handleStatusChange = async (id: string, status: 'new' | 'reviewing' | 'mastered') => {
  try {
    await wrongQuestionService.updateWrongQuestionStatus(id, status);
    await fetchWrongQuestions(); // 刷新列表
    ElMessage.success('状态更新成功');
  } catch (error) {
    ElMessage.error('状态更新失败，请稍后重试');
    console.error(error);
  }
};

const handleAddNote = (id: string) => {
  const wrongQuestion = wrongQuestions.value.find(wq => wq.id === id);
  if (wrongQuestion) {
    currentWrongQuestionId.value = id;
    currentNote.value = wrongQuestion.note || '';
    noteDialogVisible.value = true;
  }
};

const saveNote = async () => {
  try {
    await wrongQuestionService.updateWrongQuestionNote(currentWrongQuestionId.value, currentNote.value);
    noteDialogVisible.value = false;
    await fetchWrongQuestions(); // 刷新列表
    ElMessage.success('笔记保存成功');
  } catch (error) {
    ElMessage.error('笔记保存失败，请稍后重试');
    console.error(error);
  }
};

const handleDelete = (id: string) => {
  currentWrongQuestionId.value = id;
  deleteDialogVisible.value = true;
};

const confirmDelete = async () => {
  try {
    await wrongQuestionService.deleteWrongQuestion(currentWrongQuestionId.value);
    deleteDialogVisible.value = false;
    await fetchWrongQuestions(); // 刷新列表
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error('删除失败，请稍后重试');
    console.error(error);
  }
};

// 生命周期钩子
onMounted(() => {
  fetchWrongQuestions();
});
</script>

<style scoped>
.wrong-questions-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #2c3e50;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
  padding: 15px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #42b983;
}

.stat-label {
  margin-top: 5px;
  color: #666;
}

.filter-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.question-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.question-card {
  transition: transform 0.3s;
}

.question-card:hover {
  transform: translateY(-5px);
}

.status-new {
  border-left: 4px solid #f56c6c;
}

.status-reviewing {
  border-left: 4px solid #e6a23c;
}

.status-mastered {
  border-left: 4px solid #67c23a;
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.question-info {
  display: flex;
  gap: 8px;
}

.question-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 14px;
}

.question-content {
  margin-bottom: 15px;
  font-size: 16px;
  line-height: 1.6;
}

.question-options {
  margin-bottom: 15px;
}

.option {
  margin-bottom: 5px;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
}

.question-answer {
  margin-bottom: 15px;
  color: #67c23a;
}

.question-note {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  font-style: italic;
}

.question-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-container {
    flex-direction: column;
  }
}
</style> 