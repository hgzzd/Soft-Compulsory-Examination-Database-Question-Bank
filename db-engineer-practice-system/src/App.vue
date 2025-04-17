<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import AppHeader from './components/common/AppHeader.vue'
import AppFooter from './components/common/AppFooter.vue'

const route = useRoute()
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <div class="app-container">
      <AppHeader v-if="!isAuthPage" />
      
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      
      <AppFooter v-if="!isAuthPage" />
    </div>
  </ElConfigProvider>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: var(--spacing-md);
}

/* Additional responsive styles */
@media (max-width: 767.98px) {
  .main-content {
    padding: var(--spacing-sm);
  }
}
</style>
