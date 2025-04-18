import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 使用相对路径，会被vite代理到后端服务
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    // 如果有token则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加调试日志
    console.log(`[API请求] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 添加调试日志
    console.log(`[API响应] ${response.status} ${response.config.url}`, {
      data: response.data
    });
    
    // 如果响应成功，直接返回数据
    return response.data;
  },
  error => {
    // 添加详细错误日志
    console.error('[API错误]', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (!error.response) {
      // 网络错误
      ElMessage.error('网络错误，请检查您的网络连接');
      return Promise.reject(new Error('网络错误'));
    }

    const { status, data } = error.response;

    // 根据状态码处理不同错误
    switch (status) {
      case 400:
        ElMessage.error(data.message || '请求参数错误');
        break;
      case 401:
        ElMessage.error('登录已过期，请重新登录');
        // 清除token并跳转到登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        ElMessage.error('没有权限访问此资源');
        break;
      case 404:
        ElMessage.error('请求的资源不存在');
        break;
      case 500:
        ElMessage.error('服务器内部错误');
        break;
      default:
        ElMessage.error(data.message || '未知错误');
    }

    return Promise.reject(error);
  }
);

export default api; 