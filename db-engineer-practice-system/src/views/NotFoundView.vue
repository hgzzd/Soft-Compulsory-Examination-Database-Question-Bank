<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <ElButton type="primary" @click="goHome">返回首页</ElButton>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
}

.not-found-content {
  max-width: 500px;
  padding: var(--spacing-xl);
}

h1 {
  font-size: 5rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

h2 {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
}

p {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
}
</style> 