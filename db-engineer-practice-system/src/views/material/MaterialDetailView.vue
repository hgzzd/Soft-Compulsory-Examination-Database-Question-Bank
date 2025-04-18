<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElCard, ElButton, ElDivider, ElInput, ElTabs, ElTabPane, ElMessage, ElTag, ElSkeleton, ElAvatar, ElEmpty } from 'element-plus'
import { Star, StarFilled, View, ThumbUp, ThumbsUp, Download, Edit, Delete, Calendar, ChatLineRound } from '@element-plus/icons-vue'
import { studyMaterialService, type StudyMaterial, type MaterialComment, type MaterialNote } from '@/services/studyMaterialService'

const route = useRoute()
const router = useRouter()
const materialId = computed(() => route.params.id as string)

// 状态
const isLoading = ref(true)
const isLoadingComments = ref(false)
const isLoadingNotes = ref(false)
const material = ref<StudyMaterial | null>(null)
const comments = ref<MaterialComment[]>([])
const notes = ref<MaterialNote[]>([])
const activeTab = ref('content')
const newComment = ref('')
const newNote = ref('')
const isSubmittingComment = ref(false)
const isSubmittingNote = ref(false)
const editingNoteId = ref<string | null>(null)
const editNoteContent = ref('')
const readProgress = ref(0)

// 获取材料详情
const loadMaterialDetail = async () => {
  isLoading.value = true
  try {
    const result = await studyMaterialService.getMaterialById(materialId.value)
    material.value = result
    
    // 记录浏览
    await studyMaterialService.recordMaterialView(materialId.value)
    
    // 加载阅读进度
    loadReadProgress()
  } catch (error) {
    ElMessage.error('获取材料详情失败')
    console.error('Failed to load material details:', error)
  } finally {
    isLoading.value = false
  }
}

// 加载评论
const loadComments = async () => {
  isLoadingComments.value = true
  try {
    const result = await studyMaterialService.getMaterialComments(materialId.value)
    comments.value = result
  } catch (error) {
    ElMessage.error('获取评论失败')
    console.error('Failed to load comments:', error)
  } finally {
    isLoadingComments.value = false
  }
}

// 加载笔记
const loadNotes = async () => {
  isLoadingNotes.value = true
  try {
    const result = await studyMaterialService.getMaterialNotes(materialId.value)
    notes.value = result
  } catch (error) {
    ElMessage.error('获取笔记失败')
    console.error('Failed to load notes:', error)
  } finally {
    isLoadingNotes.value = false
  }
}

// 加载阅读进度
const loadReadProgress = async () => {
  try {
    const progress = await studyMaterialService.getMaterialReadProgress(materialId.value)
    readProgress.value = progress
  } catch (error) {
    console.error('Failed to load read progress:', error)
  }
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  
  isSubmittingComment.value = true
  try {
    const result = await studyMaterialService.addMaterialComment(
      materialId.value,
      newComment.value
    )
    
    // 添加到评论列表
    comments.value.unshift(result)
    newComment.value = ''
    ElMessage.success('评论发布成功')
  } catch (error) {
    ElMessage.error('评论发布失败')
    console.error('Failed to submit comment:', error)
  } finally {
    isSubmittingComment.value = false
  }
}

// 提交笔记
const submitNote = async () => {
  if (!newNote.value.trim()) {
    ElMessage.warning('笔记内容不能为空')
    return
  }
  
  isSubmittingNote.value = true
  try {
    const result = await studyMaterialService.addMaterialNote(
      materialId.value,
      newNote.value
    )
    
    // 添加到笔记列表
    notes.value.unshift(result)
    newNote.value = ''
    ElMessage.success('笔记保存成功')
  } catch (error) {
    ElMessage.error('笔记保存失败')
    console.error('Failed to submit note:', error)
  } finally {
    isSubmittingNote.value = false
  }
}

// 编辑笔记
const startEditNote = (note: MaterialNote) => {
  editingNoteId.value = note.id
  editNoteContent.value = note.content
  nextTick(() => {
    const textarea = document.getElementById('edit-note-textarea')
    if (textarea) {
      (textarea as HTMLTextAreaElement).focus()
    }
  })
}

// 保存编辑的笔记
const saveEditedNote = async () => {
  if (!editNoteContent.value.trim()) {
    ElMessage.warning('笔记内容不能为空')
    return
  }
  
  try {
    await studyMaterialService.updateMaterialNote(
      materialId.value,
      editingNoteId.value!,
      editNoteContent.value
    )
    
    // 更新笔记列表
    const index = notes.value.findIndex(note => note.id === editingNoteId.value)
    if (index !== -1) {
      notes.value[index].content = editNoteContent.value
      notes.value[index].updatedAt = new Date().toISOString()
    }
    
    editingNoteId.value = null
    editNoteContent.value = ''
    ElMessage.success('笔记更新成功')
  } catch (error) {
    ElMessage.error('笔记更新失败')
    console.error('Failed to update note:', error)
  }
}

// 取消编辑笔记
const cancelEditNote = () => {
  editingNoteId.value = null
  editNoteContent.value = ''
}

// 删除笔记
const deleteNote = async (noteId: string) => {
  try {
    await studyMaterialService.deleteMaterialNote(materialId.value, noteId)
    
    // 从笔记列表中移除
    notes.value = notes.value.filter(note => note.id !== noteId)
    ElMessage.success('笔记删除成功')
  } catch (error) {
    ElMessage.error('笔记删除失败')
    console.error('Failed to delete note:', error)
  }
}

// 点赞
const toggleLike = async () => {
  if (!material.value) return
  
  try {
    const newStatus = !material.value.isLiked
    await studyMaterialService.likeMaterial(materialId.value, newStatus)
    
    // 更新本地状态
    material.value.isLiked = newStatus
    material.value.likes += newStatus ? 1 : -1
    
    ElMessage.success(newStatus ? '点赞成功' : '取消点赞成功')
  } catch (error) {
    ElMessage.error('操作失败，请稍后再试')
    console.error('Failed to toggle like:', error)
  }
}

// 收藏
const toggleFavorite = async () => {
  if (!material.value) return
  
  try {
    const newStatus = !material.value.isFavorited
    await studyMaterialService.toggleFavorite(materialId.value, newStatus)
    
    // 更新本地状态
    material.value.isFavorited = newStatus
    
    ElMessage.success(newStatus ? '已加入收藏' : '已取消收藏')
  } catch (error) {
    ElMessage.error('操作失败，请稍后再试')
    console.error('Failed to toggle favorite:', error)
  }
}

// 更新阅读进度
const updateReadProgress = async (progress: number) => {
  try {
    await studyMaterialService.updateReadProgress(materialId.value, progress)
    readProgress.value = progress
  } catch (error) {
    console.error('Failed to update read progress:', error)
  }
}

// 标记为已读
const markAsRead = async () => {
  try {
    await studyMaterialService.updateReadProgress(materialId.value, 100)
    readProgress.value = 100
    ElMessage.success('已标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
    console.error('Failed to mark as read:', error)
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取难度对应的标签类型
const getDifficultyTag = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'success'
    case 'intermediate': return 'warning'
    case 'advanced': return 'danger'
    default: return 'info'
  }
}

// 获取难度对应的中文文本
const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return '初级'
    case 'intermediate': return '中级'
    case 'advanced': return '高级'
    default: return '未知'
  }
}

// 监听标签页切换
const handleTabChange = (tab: string) => {
  if (tab === 'comments' && comments.value.length === 0) {
    loadComments()
  } else if (tab === 'notes' && notes.value.length === 0) {
    loadNotes()
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadMaterialDetail()
})
</script>

<template>
  <div class="material-detail-container">
    <ElButton class="back-button" @click="router.back()" type="primary" text>
      返回列表
    </ElButton>
    
    <ElSkeleton :loading="isLoading" animated>
      <template #template>
        <div class="skeleton-header">
          <ElSkeleton.Item variant="h1" style="width: 60%" />
          <div class="skeleton-meta">
            <ElSkeleton.Item variant="text" style="width: 100px" />
            <ElSkeleton.Item variant="text" style="width: 100px" />
            <ElSkeleton.Item variant="text" style="width: 100px" />
          </div>
        </div>
        <ElSkeleton.Item variant="text" style="width: 100%; margin: 30px 0" />
        <ElSkeleton.Item variant="p" style="width: 100%" :rows="10" />
      </template>
      
      <template #default>
        <div v-if="material" class="material-content">
          <!-- 材料头部 -->
          <div class="material-header">
            <h1 class="material-title">{{ material.title }}</h1>
            
            <div class="material-meta">
              <span class="meta-item">
                <el-icon><View /></el-icon>
                {{ material.views }} 次浏览
              </span>
              <span class="meta-item">
                <el-icon><ThumbUp /></el-icon>
                {{ material.likes }} 次点赞
              </span>
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(material.createdAt) }}
              </span>
            </div>
            
            <div class="material-tags">
              <ElTag 
                v-for="tag in material.tags" 
                :key="tag"
                style="margin-right: 8px"
              >
                {{ tag }}
              </ElTag>
              
              <ElTag 
                :type="getDifficultyTag(material.difficulty)" 
                style="margin-right: 8px"
              >
                {{ getDifficultyText(material.difficulty) }}
              </ElTag>
              
              <ElTag type="info">
                {{ material.category }}
              </ElTag>
            </div>
            
            <!-- 操作按钮 -->
            <div class="material-actions">
              <ElButton 
                :type="material.isLiked ? 'primary' : 'default'" 
                @click="toggleLike"
                :icon="ThumbUp"
              >
                {{ material.isLiked ? '已点赞' : '点赞' }}
              </ElButton>
              
              <ElButton 
                :type="material.isFavorited ? 'warning' : 'default'" 
                @click="toggleFavorite"
                :icon="material.isFavorited ? StarFilled : Star"
              >
                {{ material.isFavorited ? '已收藏' : '收藏' }}
              </ElButton>
              
              <ElButton 
                type="success" 
                @click="markAsRead"
                :disabled="readProgress === 100"
              >
                {{ readProgress === 100 ? '已读完' : '标记为已读' }}
              </ElButton>
            </div>
            
            <!-- 阅读进度 -->
            <div class="read-progress-container">
              <div class="read-progress-label">阅读进度：{{ readProgress }}%</div>
              <div class="read-progress-bar">
                <div 
                  class="read-progress-fill" 
                  :style="{ width: `${readProgress}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <ElDivider />
          
          <!-- 内容标签页 -->
          <ElTabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 内容标签页 -->
            <ElTabPane label="内容" name="content">
              <div class="material-body" v-html="material.content"></div>
            </ElTabPane>
            
            <!-- 评论标签页 -->
            <ElTabPane label="评论" name="comments">
              <div class="comments-section">
                <div class="new-comment">
                  <h3>发表评论</h3>
                  <ElInput
                    v-model="newComment"
                    type="textarea"
                    :rows="4"
                    placeholder="分享你的想法..."
                    resize="none"
                  />
                  <ElButton 
                    type="primary" 
                    @click="submitComment" 
                    :loading="isSubmittingComment"
                    style="margin-top: 10px"
                  >
                    发布评论
                  </ElButton>
                </div>
                
                <ElDivider>全部评论 ({{ comments.length }})</ElDivider>
                
                <ElSkeleton :loading="isLoadingComments" animated :rows="3" :count="3">
                  <template #default>
                    <div v-if="comments.length === 0" class="empty-comments">
                      <ElEmpty description="暂无评论，快来发表第一条评论吧" />
                    </div>
                    
                    <div v-else class="comments-list">
                      <div 
                        v-for="comment in comments" 
                        :key="comment.id" 
                        class="comment-item"
                      >
                        <div class="comment-header">
                          <div class="comment-author">
                            <ElAvatar size="small" :src="comment.userAvatar">
                              {{ comment.userName.charAt(0) }}
                            </ElAvatar>
                            <span class="author-name">{{ comment.userName }}</span>
                          </div>
                          <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                        </div>
                        
                        <div class="comment-content">
                          {{ comment.content }}
                        </div>
                      </div>
                    </div>
                  </template>
                </ElSkeleton>
              </div>
            </ElTabPane>
            
            <!-- 笔记标签页 -->
            <ElTabPane label="笔记" name="notes">
              <div class="notes-section">
                <div class="new-note">
                  <h3>添加笔记</h3>
                  <ElInput
                    v-model="newNote"
                    type="textarea"
                    :rows="4"
                    placeholder="记录你的学习笔记..."
                    resize="none"
                  />
                  <ElButton 
                    type="primary" 
                    @click="submitNote" 
                    :loading="isSubmittingNote"
                    style="margin-top: 10px"
                  >
                    保存笔记
                  </ElButton>
                </div>
                
                <ElDivider>我的笔记 ({{ notes.length }})</ElDivider>
                
                <ElSkeleton :loading="isLoadingNotes" animated :rows="3" :count="2">
                  <template #default>
                    <div v-if="notes.length === 0" class="empty-notes">
                      <ElEmpty description="暂无笔记，添加一条笔记吧" />
                    </div>
                    
                    <div v-else class="notes-list">
                      <ElCard 
                        v-for="note in notes" 
                        :key="note.id" 
                        class="note-item"
                        shadow="hover"
                      >
                        <template #header>
                          <div class="note-header">
                            <span class="note-date">{{ formatDate(note.createdAt) }}</span>
                            <div class="note-actions">
                              <ElButton 
                                v-if="editingNoteId !== note.id"
                                type="primary" 
                                text 
                                :icon="Edit" 
                                @click="startEditNote(note)"
                              />
                              <ElButton 
                                v-if="editingNoteId !== note.id"
                                type="danger" 
                                text 
                                :icon="Delete" 
                                @click="deleteNote(note.id)"
                              />
                            </div>
                          </div>
                        </template>
                        
                        <div v-if="editingNoteId === note.id" class="edit-note-form">
                          <ElInput
                            id="edit-note-textarea"
                            v-model="editNoteContent"
                            type="textarea"
                            :rows="4"
                            resize="none"
                          />
                          <div class="edit-note-actions">
                            <ElButton @click="cancelEditNote">取消</ElButton>
                            <ElButton type="primary" @click="saveEditedNote">保存</ElButton>
                          </div>
                        </div>
                        
                        <div v-else class="note-content">
                          {{ note.content }}
                        </div>
                      </ElCard>
                    </div>
                  </template>
                </ElSkeleton>
              </div>
            </ElTabPane>
          </ElTabs>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<style scoped>
.material-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  margin-bottom: 20px;
}

.skeleton-header {
  margin-bottom: 30px;
}

.skeleton-meta {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.material-header {
  margin-bottom: 30px;
}

.material-title {
  margin: 0 0 15px 0;
  font-size: 28px;
  color: var(--el-text-color-primary);
}

.material-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
  color: var(--el-text-color-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.material-tags {
  margin-bottom: 20px;
}

.material-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.read-progress-container {
  margin-top: 15px;
}

.read-progress-label {
  margin-bottom: 5px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.read-progress-bar {
  height: 8px;
  background-color: var(--el-fill-color-darker);
  border-radius: 4px;
  overflow: hidden;
}

.read-progress-fill {
  height: 100%;
  background-color: var(--el-color-primary);
  transition: width 0.3s ease;
}

.material-body {
  line-height: 1.8;
  color: var(--el-text-color-primary);
}

.comments-section,
.notes-section {
  margin-top: 20px;
}

.new-comment,
.new-note {
  margin-bottom: 30px;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-name {
  font-weight: 500;
}

.comment-date {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.comment-content {
  line-height: 1.5;
}

.note-item {
  margin-bottom: 15px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-date {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.note-actions {
  display: flex;
  gap: 5px;
}

.note-content {
  line-height: 1.6;
  white-space: pre-wrap;
}

.edit-note-form {
  margin-bottom: 10px;
}

.edit-note-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.empty-comments,
.empty-notes {
  padding: 30px 0;
}

@media (max-width: 768px) {
  .material-actions {
    flex-wrap: wrap;
  }
  
  .material-title {
    font-size: 22px;
  }
}
</style> 