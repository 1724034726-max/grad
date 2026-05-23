import { createApp } from 'vue'
import pinia from './stores'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './styles/elementPlus.scss'
import './styles/common.scss'

import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import BuffTable from '@/components/buff-table/buff-table.vue'

const bootstrap = () => {
  const app = createApp(App)
  app.use(pinia)
  app.use(router)
  app.use(ElementPlus, { locale: zhCn })
  app.use(VXETable)
  app.component('BuffTable', BuffTable)
  app.mount('#app')
}

bootstrap()
