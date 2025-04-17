import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import Element Plus styles
import 'element-plus/dist/index.css'
// Import custom styles
import './styles/main.css'

// Import ECharts
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'

// Import ECharts components
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components'

// Register ECharts components
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
])

// Create Vue app
const app = createApp(App)

// Register global components
app.component('v-chart', ECharts)

// Use Pinia and Router
app.use(createPinia())
app.use(router)

// Mount app
app.mount('#app')
