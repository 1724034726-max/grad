import { createApp } from 'vue'
import pinia from './stores'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/elementPlus.scss'
import './styles/common.scss'

const bootstrap = () => {
  const app = createApp(App)
  app.use(pinia)
  app.use(router)
  app.use(ElementPlus)
  app.mount('#app')
}

bootstrap()
