<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// Form data
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  captcha: ''
})

// Validation rules
const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    if (registerForm.confirmPassword !== '') {
      formRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
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
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 1, max: 20, message: '用户名长度在1到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPass, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码必须为4位字符', trigger: 'blur' }
  ]
}

// Captcha generation
const captcha = ref('')
const refreshCaptcha = () => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  captcha.value = ''
  for (let i = 0; i < 4; i++) {
    captcha.value += chars.charAt(Math.floor(Math.random() * chars.length))
  }
}

// Generate initial captcha
refreshCaptcha()

// Form reference
const formRef = ref()

// Loading state
const isLoading = ref(false)
const registerError = ref('')

// Register function
const handleRegister = async () => {
  // 清除之前的错误信息
  registerError.value = '';
  
  // Validate form
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return false
    }
    
    // Check captcha
    if (registerForm.captcha.toLowerCase() !== captcha.value.toLowerCase()) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      registerForm.captcha = ''
      return false
    }
    
    // Process registration
    isLoading.value = true
    
    try {
      const success = await userStore.register(
        registerForm.username, 
        registerForm.password,
        registerForm.email
      )
      
      if (success) {
        ElMessage.success('注册成功，请登录')
        // 清空表单，避免数据残留
        registerForm.username = ''
        registerForm.password = ''
        registerForm.confirmPassword = ''
        registerForm.email = ''
        registerForm.captcha = ''
        
        // 导航到登录页
        await router.push('/login')
      } else {
        // 处理注册失败的情况
        registerError.value = userStore.error || '注册失败，请稍后再试'
        refreshCaptcha()
        registerForm.captcha = ''
      }
    } catch (error: any) {
      registerError.value = error.message || '注册失败，请稍后再试'
      console.error('注册过程中发生错误:', error)
      refreshCaptcha()
      registerForm.captcha = ''
    } finally {
      isLoading.value = false
    }
  })
}

// Navigation to login page
const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">注册</h1>
        <p class="register-subtitle">创建您的数据库工程师练习系统账号</p>
      </div>
      
      <ElForm
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleRegister"
      >
        <ElFormItem label="用户名" prop="username">
          <ElInput 
            v-model="registerForm.username"
            placeholder="请输入1-20位字符的用户名"
          />
        </ElFormItem>
        
        <ElFormItem label="密码" prop="password">
          <ElInput 
            v-model="registerForm.password"
            type="password"
            placeholder="请输入至少6位且包含字母和数字的密码"
            show-password
          />
        </ElFormItem>
        
        <ElFormItem label="确认密码" prop="confirmPassword">
          <ElInput 
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </ElFormItem>
        
        <ElFormItem label="邮箱" prop="email">
          <ElInput 
            v-model="registerForm.email"
            placeholder="请输入有效的邮箱地址"
          />
        </ElFormItem>
        
        <ElFormItem label="验证码" prop="captcha">
          <div class="captcha-container">
            <ElInput 
              v-model="registerForm.captcha"
              placeholder="请输入验证码"
            />
            <div class="captcha-display" @click="refreshCaptcha">
              {{ captcha }}
            </div>
          </div>
        </ElFormItem>
        
        <div class="error-message" v-if="registerError">{{ registerError }}</div>
        
        <ElFormItem>
          <ElButton 
            type="primary" 
            :loading="isLoading" 
            @click="handleRegister"
            class="register-button"
          >
            注册
          </ElButton>
        </ElFormItem>
      </ElForm>
      
      <div class="register-actions">
        <ElButton text @click="goToLogin">已有账号？点击登录</ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: var(--spacing-md);
}

.register-card {
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
}

.register-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.register-title {
  color: var(--color-primary);
  font-size: var(--font-size-xxl);
  margin-bottom: var(--spacing-xs);
}

.register-subtitle {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

.captcha-container {
  display: flex;
  gap: var(--spacing-sm);
}

.captcha-display {
  min-width: 100px;
  height: 40px;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  font-size: var(--font-size-lg);
  letter-spacing: 3px;
  cursor: pointer;
  user-select: none;
  color: var(--color-primary);
  border-radius: var(--border-radius-md);
}

.register-button {
  width: 100%;
}

.register-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

@media (max-width: 767.98px) {
  .register-card {
    padding: var(--spacing-lg);
  }
}
</style> 