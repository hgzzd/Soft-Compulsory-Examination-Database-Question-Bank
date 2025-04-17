<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElTabs, ElTabPane, ElForm, ElFormItem, ElInput, ElButton, ElUpload, ElCard, ElRow, ElCol, ElAvatar, ElSkeleton, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../stores/userStore'
import { useExerciseStore } from '../../stores/exerciseStore'

const userStore = useUserStore()
const exerciseStore = useExerciseStore()

// User profile data
const userProfile = computed(() => userStore.userProfile)
const isLoading = computed(() => userStore.isLoading)

// Form data for profile editing
const profileForm = reactive({
  username: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Validation rules
const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度至少为6个字符'))
  } else if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    if (profileForm.confirmPassword !== '') {
      formRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== profileForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateEmail = (rule: any, value: string, callback: Function) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  if (value === '') {
    callback(new Error('请输入邮箱地址'))
  } else if (!emailPattern.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPass, trigger: 'blur' }
  ]
}

// Form references
const formRef = ref()
const uploadRef = ref()

// Loading states
const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)
const isUploadingAvatar = ref(false)

// Error messages
const profileError = ref('')
const passwordError = ref('')
const avatarError = ref('')

// Avatar upload
const avatarUrl = ref('')
const avatarFile = ref<File | null>(null)

// Handle avatar upload
const beforeAvatarUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLessThan2M = file.size / 1024 / 1024 < 2
  
  if (!isJpgOrPng) {
    ElMessage.error('头像图片只能是JPG或PNG格式!')
    return false
  }
  
  if (!isLessThan2M) {
    ElMessage.error('头像图片大小不能超过2MB!')
    return false
  }
  
  // Store file reference for later upload
  avatarFile.value = file
  
  // Create a local preview URL
  avatarUrl.value = URL.createObjectURL(file)
  
  // Prevent automatic upload
  return false
}

// Upload avatar
const uploadAvatar = async () => {
  if (!avatarFile.value) {
    ElMessage.warning('请先选择头像图片')
    return
  }
  
  isUploadingAvatar.value = true
  avatarError.value = ''
  
  try {
    const success = await userStore.updateAvatar(avatarFile.value)
    
    if (success) {
      ElMessage.success('头像上传成功')
      // Reset state
      avatarFile.value = null
      // Clear file list in upload component
      uploadRef.value.clearFiles()
    } else {
      avatarError.value = userStore.error || '头像上传失败，请稍后再试'
    }
  } catch (error: any) {
    avatarError.value = error.message || '头像上传失败，请稍后再试'
  } finally {
    isUploadingAvatar.value = false
  }
}

// Update profile information
const updateProfile = async () => {
  await formRef.value.validateField('email', async (valid: boolean) => {
    if (!valid) return false
    
    isUpdatingProfile.value = true
    profileError.value = ''
    
    try {
      const success = await userStore.updateProfile({
        email: profileForm.email
      })
      
      if (success) {
        ElMessage.success('个人信息更新成功')
      } else {
        profileError.value = userStore.error || '个人信息更新失败，请稍后再试'
      }
    } catch (error: any) {
      profileError.value = error.message || '个人信息更新失败，请稍后再试'
    } finally {
      isUpdatingProfile.value = false
    }
  })
}

// Update password
const updatePassword = async () => {
  await formRef.value.validateField(['currentPassword', 'newPassword', 'confirmPassword'], async (valid: boolean) => {
    if (!valid) return false
    
    // Confirm password change
    try {
      await ElMessageBox.confirm(
        '确定要修改密码吗？修改密码后需要重新登录。',
        '确认修改密码',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      isUpdatingPassword.value = true
      passwordError.value = ''
      
      // DEV NOTE: In a real implementation, we would call an API to verify the current password
      // and update to the new password. For this mockup, we'll simulate success.
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success('密码修改成功，请重新登录')
      
      // Force logout
      await userStore.logout()
      
      // Redirect to login page
      window.location.href = '/login'
    } catch (error: any) {
      if (error !== 'cancel') {
        passwordError.value = error.message || '密码修改失败，请稍后再试'
      }
    } finally {
      isUpdatingPassword.value = false
    }
  })
}

// Initialize form data
onMounted(async () => {
  // Fetch user profile if not already loaded
  if (!userProfile.value) {
    await userStore.fetchUserProfile()
  }
  
  // Fetch exercise history for stats
  await exerciseStore.fetchExerciseHistory()
  
  // Initialize form with current user data
  if (userProfile.value) {
    profileForm.username = userProfile.value.username
    profileForm.email = userProfile.value.email
    
    if (userProfile.value.avatar) {
      avatarUrl.value = userProfile.value.avatar
    }
  }
})
</script>

<template>
  <div class="profile-container">
    <ElSkeleton :loading="isLoading" animated>
      <template #template>
        <div class="skeleton-wrapper">
          <ElSkeleton.Item variant="circle" style="width: 80px; height: 80px" />
          <ElSkeleton.Item variant="h3" style="width: 200px; margin-top: 16px" />
          <ElSkeleton.Item variant="text" style="width: 300px; margin-top: 16px" />
          <ElSkeleton.Item variant="text" style="width: 400px; margin-top: 16px" />
        </div>
      </template>
      
      <template #default>
        <div class="profile-header">
          <ElRow :gutter="20">
            <ElCol :xs="24" :sm="8" :md="6" :lg="5" :xl="4">
              <ElCard class="profile-avatar-card">
                <div class="avatar-wrapper">
                  <ElAvatar :size="80" :src="userProfile?.avatar || avatarUrl">
                    {{ userProfile?.username?.charAt(0).toUpperCase() || 'U' }}
                  </ElAvatar>
                </div>
                
                <ElUpload
                  ref="uploadRef"
                  class="avatar-uploader"
                  action=""
                  :show-file-list="false"
                  :auto-upload="false"
                  :before-upload="beforeAvatarUpload"
                >
                  <ElButton size="small" type="primary" plain>选择头像</ElButton>
                </ElUpload>
                
                <ElButton 
                  v-if="avatarFile"
                  size="small" 
                  type="success" 
                  :loading="isUploadingAvatar"
                  @click="uploadAvatar"
                  class="upload-button"
                >
                  上传头像
                </ElButton>
                
                <div class="avatar-error" v-if="avatarError">{{ avatarError }}</div>
              </ElCard>
            </ElCol>
            
            <ElCol :xs="24" :sm="16" :md="18" :lg="19" :xl="20">
              <ElCard class="profile-info-card">
                <h2 class="profile-name">{{ userProfile?.username }}</h2>
                <p class="profile-email">{{ userProfile?.email }}</p>
                
                <div class="profile-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ userProfile?.stats.totalQuestions }}</div>
                    <div class="stat-label">题目数量</div>
                  </div>
                  
                  <div class="stat-item">
                    <div class="stat-value">{{ userProfile?.stats.correctAnswers }}</div>
                    <div class="stat-label">正确答题</div>
                  </div>
                  
                  <div class="stat-item">
                    <div class="stat-value">{{ Math.round(userProfile?.stats.accuracyRate * 100) }}%</div>
                    <div class="stat-label">正确率</div>
                  </div>
                </div>
              </ElCard>
            </ElCol>
          </ElRow>
        </div>
        
        <div class="profile-content">
          <ElTabs>
            <ElTabPane label="个人信息设置">
              <ElForm
                ref="formRef"
                :model="profileForm"
                :rules="rules"
                label-position="top"
              >
                <ElFormItem label="用户名">
                  <ElInput v-model="profileForm.username" disabled />
                </ElFormItem>
                
                <ElFormItem label="邮箱" prop="email">
                  <ElInput v-model="profileForm.email" />
                </ElFormItem>
                
                <div class="error-message" v-if="profileError">{{ profileError }}</div>
                
                <ElFormItem>
                  <ElButton 
                    type="primary" 
                    :loading="isUpdatingProfile" 
                    @click="updateProfile"
                  >
                    更新个人信息
                  </ElButton>
                </ElFormItem>
                
                <ElDivider>修改密码</ElDivider>
                
                <ElFormItem label="当前密码" prop="currentPassword">
                  <ElInput 
                    v-model="profileForm.currentPassword"
                    type="password"
                    show-password
                  />
                </ElFormItem>
                
                <ElFormItem label="新密码" prop="newPassword">
                  <ElInput 
                    v-model="profileForm.newPassword"
                    type="password"
                    show-password
                    placeholder="请输入至少6位且包含字母和数字的密码"
                  />
                </ElFormItem>
                
                <ElFormItem label="确认新密码" prop="confirmPassword">
                  <ElInput 
                    v-model="profileForm.confirmPassword"
                    type="password"
                    show-password
                  />
                </ElFormItem>
                
                <div class="error-message" v-if="passwordError">{{ passwordError }}</div>
                
                <ElFormItem>
                  <ElButton 
                    type="warning" 
                    :loading="isUpdatingPassword" 
                    @click="updatePassword"
                  >
                    修改密码
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElTabPane>
            
            <ElTabPane label="学习统计">
              <ElCard class="stats-card">
                <template #header>
                  <div class="stats-header">
                    <h3>学习概览</h3>
                  </div>
                </template>
                
                <ElRow :gutter="20">
                  <ElCol :xs="24" :sm="12" :md="8" v-for="(history, index) in exerciseStore.exerciseHistory" :key="index">
                    <div class="stats-item">
                      <div class="stats-title">{{ new Date(history.startedAt).toLocaleDateString() }} 练习</div>
                      <div class="stats-details">
                        <div>分数: <span class="stats-highlight">{{ history.score }}</span></div>
                        <div>正确率: <span class="stats-highlight">{{ Math.round((history.correctAnswers / history.totalQuestions) * 100) }}%</span></div>
                        <div>题目数量: <span class="stats-highlight">{{ history.totalQuestions }}</span></div>
                      </div>
                    </div>
                  </ElCol>
                </ElRow>
                
                <div class="stats-empty" v-if="exerciseStore.exerciseHistory.length === 0">
                  暂无学习记录，开始练习生成统计数据吧！
                </div>
                
                <div class="stats-actions">
                  <ElButton type="primary" @click="$router.push('/analytics')">
                    查看详细分析
                  </ElButton>
                </div>
              </ElCard>
            </ElTabPane>
          </ElTabs>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
}

.profile-header {
  margin-bottom: var(--spacing-lg);
}

.profile-avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-md);
}

.avatar-wrapper {
  margin-bottom: var(--spacing-md);
}

.avatar-uploader {
  margin-top: var(--spacing-md);
}

.upload-button {
  margin-top: var(--spacing-sm);
}

.profile-info-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-xs);
  color: var(--color-primary);
}

.profile-email {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
}

.profile-stats {
  display: flex;
  margin-top: auto;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: var(--spacing-sm);
  border-right: 1px solid var(--color-border);
}

.stat-item:last-child {
  border-right: none;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--color-secondary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.profile-content {
  margin-top: var(--spacing-lg);
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.avatar-error {
  color: var(--color-error);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-sm);
  text-align: center;
}

.stats-card {
  margin-bottom: var(--spacing-lg);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-item {
  background-color: #f5f7fa;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.stats-title {
  font-weight: bold;
  margin-bottom: var(--spacing-sm);
}

.stats-details {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.stats-highlight {
  color: var(--color-primary);
  font-weight: bold;
}

.stats-empty {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-light);
}

.stats-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

@media (max-width: 767.98px) {
  .profile-header {
    margin-bottom: var(--spacing-md);
  }
  
  .profile-avatar-card {
    margin-bottom: var(--spacing-md);
  }
  
  .profile-stats {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .stat-item {
    flex: 1;
    min-width: 80px;
  }
}
</style> 