import { createApp } from 'vue'
import {
  // create naive ui
  create,
  // component
  NButton, // Example component, you can add more as needed or use the auto-import plugin
  NConfigProvider,
  NMessageProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NSelect,
  NSpin,
  NCard,
  NSpace,
  NEmpty,
  NResult,
  NH1,
  NText,
  NBlockquote,
  NIcon,
  NStatistic,
  // You'll add more components here as you use them
} from 'naive-ui'

// General Fonts
import 'vfonts/Lato.css'
// Monospace Fonts
import 'vfonts/FiraCode.css'

import App from './App.vue'
import router from './router' // We'll create this next
import { createPinia } from 'pinia' // We'll create the store next

// Create a Naive UI instance with only the components you use
// This is good for tree-shaking if you don't want to install the unplugin-vue-components
const naive = create({
  components: [
    NButton,
    NConfigProvider,
    NMessageProvider,
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NLayoutFooter,
    NSelect,
    NSpin,
    NCard,
    NSpace,
    NEmpty,
    NResult,
    NH1,
    NText,
    NBlockquote,
    NIcon,
    NStatistic,
  ]
})

const app = createApp(App)

app.use(createPinia()) // Use Pinia
app.use(router)       // Use Vue Router
app.use(naive)        // Use Naive UI

app.mount('#app')