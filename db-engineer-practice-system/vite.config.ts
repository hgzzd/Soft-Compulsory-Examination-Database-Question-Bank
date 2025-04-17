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
    port: 3000,
    open: true,
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
