import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import userService from '../services/userService';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/exercise'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exercise',
    name: 'ExerciseList',
    component: () => import('@/views/exercise/ExerciseListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exercise/:id',
    name: 'ExerciseDetail',
    component: () => import('@/views/exercise/ExerciseDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/exercise/HistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wrong-questions',
    name: 'WrongQuestions',
    component: () => import('@/views/exercise/WrongQuestionsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wrong-questions/:id',
    name: 'WrongQuestionDetail',
    component: () => import('@/views/exercise/WrongQuestionDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/views/analytics/AnalyticsView.vue'),
    meta: { requiresAuth: true }
  },
  // 学习材料相关路由
  {
    path: '/materials',
    name: 'MaterialList',
    component: () => import('@/views/material/MaterialListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/materials/:id',
    name: 'MaterialDetail',
    component: () => import('@/views/material/MaterialDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorite-materials',
    name: 'FavoriteMaterials',
    component: () => import('@/views/material/FavoriteMaterialsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 已验证的标志，避免重复验证
let isValidated = false;

// Navigation guard for auth
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = localStorage.getItem('token');
  
  // 如果路由不需要认证，直接通过
  if (!requiresAuth) {
    // 如果已经登录，且尝试访问登录/注册页面，重定向到主页
    if (token && (to.path === '/login' || to.path === '/register')) {
      next('/exercise');
    } else {
      next();
    }
    return;
  }
  
  // 如果需要认证但没有token，重定向到登录页
  if (!token) {
    next('/login');
    return;
  }
  
  // 如果之前已经验证过token有效，直接通过
  if (isValidated) {
    next();
    return;
  }
  
  try {
    // 验证token是否有效
    const isValid = await userService.validateToken();
    
    if (isValid) {
      isValidated = true;
      next();
    } else {
      // token无效，清除并重定向到登录页
      localStorage.removeItem('token');
      next('/login');
    }
  } catch (error) {
    console.error('Token validation failed:', error);
    localStorage.removeItem('token');
    next('/login');
  }
});

export default router; 