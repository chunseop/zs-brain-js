import { defineStore } from 'pinia'

import type { AppLocale, ThemeMode } from '@/core/storage/keys'
import {
  readLocaleOverride,
  readSeniorMode,
  readThemeMode,
  writeLocaleOverride,
  writeSeniorMode,
  writeThemeMode,
} from '@/core/storage/preferences'

function resolveLocale(override: AppLocale | null): AppLocale {
  if (override) return override
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('zh')) return 'zh'
  if (lang.startsWith('ko')) return 'ko'
  if (lang.startsWith('en')) return 'en'
  return 'zh'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') return mode
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useAppSettingsStore = defineStore('appSettings', {
  state: () => ({
    themeMode: 'system' as ThemeMode,
    localeOverride: null as AppLocale | null,
    seniorModeEnabled: true,
    hydrated: false,
  }),

  getters: {
    resolvedLocale(state): AppLocale {
      return resolveLocale(state.localeOverride)
    },
    resolvedTheme(state): 'light' | 'dark' {
      return resolveTheme(state.themeMode)
    },
  },

  actions: {
    async hydrate() {
      const [themeMode, localeOverride, seniorModeEnabled] = await Promise.all([
        readThemeMode(),
        readLocaleOverride(),
        readSeniorMode(),
      ])
      this.themeMode = themeMode
      this.localeOverride = localeOverride
      this.seniorModeEnabled = seniorModeEnabled
      this.hydrated = true
    },

    async setThemeMode(mode: ThemeMode) {
      this.themeMode = mode
      await writeThemeMode(mode)
    },

    async setLocaleOverride(locale: AppLocale | null) {
      this.localeOverride = locale
      await writeLocaleOverride(locale)
    },

    async setSeniorModeEnabled(enabled: boolean) {
      this.seniorModeEnabled = enabled
      await writeSeniorMode(enabled)
    },
  },
})
