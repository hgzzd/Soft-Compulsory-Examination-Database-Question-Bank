<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMenu, ElMenuItem, ElSubMenu, ElDropdown, ElDropdownMenu, ElDropdownItem, ElAvatar, ElBadge } from 'element-plus'
import { useUserStore } from '../../stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 根据当前路由路径设置活动菜单
const activeMenu = computed(() => route.path)

// User profile computed property
const userProfile = computed(() => userStore.userProfile)
const isAuthenticated = computed(() => userStore.isAuthenticated)

// Navigation items with icons
const navItems = [
  { name: '题库练习', path: '/exercise', highlight: true },
  { name: '学习资料', path: '/materials' },
  { name: '错题本', path: '/wrong-questions' },
  { name: '历史记录', path: '/history' },
  { name: '数据分析', path: '/analytics' }
]

// Handle navigation
function navigateTo(path: string) {
  router.push(path)
}

// Handle logout
async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}

// 组件挂载时设置活动菜单
onMounted(() => {
  // 初始化设置活动菜单
  const currentPath = route.path
  if (currentPath.startsWith('/exercise')) {
    activeMenu.value = '/exercise'
  } else if (currentPath.startsWith('/wrong-questions')) {
    activeMenu.value = '/wrong-questions'
  } else if (currentPath.startsWith('/materials')) {
    activeMenu.value = '/materials'
  }
})
</script>

<template>
  <header class="app-header">
    <div class="container header-container">
      <div class="logo" @click="navigateTo('/')">
        <h1>数据库工程师<span>练习系统</span></h1>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="main-nav">
        <ElMenu
          :default-active="activeMenu"
          mode="horizontal"
          class="nav-menu"
          background-color="#293548"
          text-color="#fff"
          active-text-color="#409EFF"
        >
          <ElMenuItem
            v-for="item in navItems"
            :key="item.path"
            :index="item.path"
            @click="navigateTo(item.path)"
            :class="{ 'highlight-item': item.highlight }"
          >
            <template #title>
              <span class="nav-item-text">{{ item.name }}</span>
              <ElBadge v-if="item.highlight" class="nav-badge" />
            </template>
          </ElMenuItem>
        </ElMenu>
      </nav>
      
      <!-- User Menu -->
      <div class="user-menu" v-if="isAuthenticated">
        <ElDropdown trigger="click">
          <div class="user-dropdown-link">
            <ElAvatar :size="32" :src="userProfile?.avatar || ''">
              {{ userProfile?.username?.charAt(0).toUpperCase() || 'U' }}
            </ElAvatar>
            <span class="username">{{ userProfile?.username || '用户' }}</span>
          </div>
          
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem @click="navigateTo('/profile')">个人中心</ElDropdownItem>
              <ElDropdownItem @click="navigateTo('/wrong-questions')">我的错题本</ElDropdownItem>
              <ElDropdownItem @click="navigateTo('/favorite-materials')">我的收藏</ElDropdownItem>
              <ElDropdownItem divided @click="handleLogout">退出登录</ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #293548;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 20px;
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo h1 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
}

.logo span {
  color: #87e8de;
  margin-left: 4px;
}

.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  background-color: transparent;
  border-bottom: none;
}

:deep(.el-menu-item) {
  color: white;
  border-bottom: 2px solid transparent;
  font-size: 16px;
  padding: 0 20px;
  margin: 0 4px;
  transition: all 0.3s;
}

:deep(.el-menu-item.is-active),
:deep(.el-menu-item:hover) {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
  border-bottom-color: #409EFF;
}

:deep(.el-menu-item.highlight-item) {
  font-weight: bold;
  font-size: 18px;
}

.nav-item-text {
  display: inline-block;
  position: relative;
}

.nav-badge {
  margin-left: 4px;
}

.user-menu {
  margin-left: 20px;
  flex-shrink: 0;
}

.user-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: var(--spacing-sm);
  color: white;
}

/* 响应式布局 */
@media (max-width: 767.98px) {
  .header-container {
    height: 56px;
  }
  
  .logo h1 {
    font-size: var(--font-size-base);
  }
  
  :deep(.el-menu-item) {
    padding: 0 10px;
    margin: 0 2px;
    font-size: 14px;
  }
  
  :deep(.el-menu-item.highlight-item) {
    font-size: 16px;
  }
  
  .username {
    display: none;
  }
}
</style> 