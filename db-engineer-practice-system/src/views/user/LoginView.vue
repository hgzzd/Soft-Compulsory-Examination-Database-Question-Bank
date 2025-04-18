<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElDivider, ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// Form data
const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

// Validation rules
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 1, max: 20, message: '用户名长度在1到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])/, 
      message: '密码必须包含字母和数字', 
      trigger: 'blur' 
    }
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
const loginError = ref('')

// Login function
const handleLogin = async () => {
  // 清除之前的错误
  loginError.value = '';
  
  // Validate form
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return false
    }
    
    // Check captcha
    if (loginForm.captcha.toLowerCase() !== captcha.value.toLowerCase()) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      loginForm.captcha = ''
      return false
    }
    
    // Process login
    isLoading.value = true
    
    try {
      console.log('开始登录请求，账号:', loginForm.username);
      const success = await userStore.login(loginForm.username, loginForm.password)
      
      if (success) {
        console.log('登录成功，准备导航到练习页面');
        ElMessage.success('登录成功')
        // 使用 await 等待导航完成
        try {
          await router.push('/exercise')
        } catch (navError) {
          console.error('导航错误:', navError);
          // 如果导航失败，尝试刷新页面
          window.location.href = '/exercise';
        }
      } else {
        console.error('登录失败:', userStore.error);
        loginError.value = userStore.error || '登录失败，请检查您的用户名和密码'
        refreshCaptcha()
        loginForm.captcha = ''
      }
    } catch (error: any) {
      console.error('登录异常:', error);
      // 尝试显示更详细的错误信息
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
        loginError.value = `登录失败 (${error.response.status}): ${error.response.data?.message || error.message}`;
      } else if (error.request) {
        console.error('未收到响应，请求详情:', error.request);
        loginError.value = '服务器未响应，请检查网络连接或联系管理员';
      } else {
        loginError.value = error.message || '登录失败，请稍后再试';
      }
      
      refreshCaptcha()
      loginForm.captcha = ''
    } finally {
      isLoading.value = false
    }
  })
}

// Navigation to register page
const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">登录</h1>
        <p class="login-subtitle">数据库工程师在线练习系统</p>
      </div>
      
      <ElForm
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <ElFormItem label="用户名" prop="username">
          <ElInput 
            v-model="loginForm.username"
            placeholder="请输入1-20位字符的用户名"
          />
        </ElFormItem>
        
        <ElFormItem label="密码" prop="password">
          <ElInput 
            v-model="loginForm.password"
            type="password"
            placeholder="请输入至少6位且包含字母和数字的密码"
            show-password
          />
        </ElFormItem>
        
        <ElFormItem label="验证码" prop="captcha">
          <div class="captcha-container">
            <ElInput 
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
            />
            <div class="captcha-display" @click="refreshCaptcha">
              {{ captcha }}
            </div>
          </div>
        </ElFormItem>
        
        <div class="error-message" v-if="loginError">{{ loginError }}</div>
        
        <ElFormItem>
          <ElButton 
            type="primary" 
            :loading="isLoading" 
            @click="handleLogin"
            class="login-button"
          >
            登录
          </ElButton>
        </ElFormItem>
      </ElForm>
      
      <div class="login-actions">
        <ElButton text @click="goToRegister">还没有账号？点击注册</ElButton>
      </div>
      
      <ElDivider>或</ElDivider>
      
      <div class="third-party-login">
        <button class="third-party-button wechat" title="微信登录">
          <span>微信登录</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: var(--spacing-md);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.login-title {
  color: var(--color-primary);
  font-size: var(--font-size-xxl);
  margin-bottom: var(--spacing-xs);
}

.login-subtitle {
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

.login-button {
  width: 100%;
}

.login-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.third-party-login {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.third-party-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.third-party-button:hover {
  background-color: #f5f7fa;
}

.wechat {
  color: #07c160;
}

@media (max-width: 767.98px) {
  .login-card {
    padding: var(--spacing-lg);
  }
}
</style> 