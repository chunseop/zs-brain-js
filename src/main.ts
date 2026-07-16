import '@/app/theme/app-theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './app/router'
import { useAppSettingsStore } from './app/settings/use-app-settings'
import { i18n } from './locales'
import { setAppLocale } from './locales/locale'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(i18n)

  const settings = useAppSettingsStore()
  await settings.hydrate()
  setAppLocale(settings.resolvedLocale)

  app.use(router)
  app.mount('#app')
}

void bootstrap()
