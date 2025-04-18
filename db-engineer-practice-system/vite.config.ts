import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // 注释掉或删除rewrite规则，保留/api前缀
        // rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('代理错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', req.method, req.url, '->',
              options.target + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('代理响应:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    // Output dir for production build
    outDir: 'dist',
    // Control chunk size
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Custom chunk files based on their categories
        manualChunks: {
          // Vue core libraries
          'vue-core': ['vue', 'vue-router', 'pinia'],
          // Element Plus
          'element-plus': ['element-plus'],
          // ECharts
          'echarts': ['echarts'],
        }
      }
    }
  }
})
