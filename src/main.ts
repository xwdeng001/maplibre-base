import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import './style.css'

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
const legacyPrefix = `${basePath}/index.html/`
const { pathname, search, hash } = window.location

if (!hash && pathname.startsWith(legacyPrefix)) {
  const restPath = pathname.slice(legacyPrefix.length)
  const normalizedRest = restPath.startsWith('/') ? restPath : `/${restPath}`
  window.location.replace(`${basePath}/index.html#${normalizedRest}${search}`)
}

const app = createApp(App)
app.use(Antd)
app.use(router)
app.mount('#app')
