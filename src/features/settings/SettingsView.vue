<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import type { AppLocale, ThemeMode } from '@/core/storage/keys'
import { useCurrentUsername } from '@/core/auth/use-current-username'
import { useAppSettingsStore } from '@/app/settings/use-app-settings'
import { setAppLocale } from '@/locales/locale'

const router = useRouter()
const { t } = useI18n()
const settings = useAppSettingsStore()
const username = useCurrentUsername()

const themeValue = computed({
  get: () => settings.themeMode,
  set: (value: ThemeMode) => {
    void settings.setThemeMode(value)
  },
})

const languageValue = computed({
  get: () => settings.localeOverride ?? 'system',
  set: (value: string) => {
    if (value === 'system') {
      void settings.setLocaleOverride(null)
      setAppLocale(settings.resolvedLocale)
      return
    }
    const next = value as AppLocale
    void settings.setLocaleOverride(next)
    setAppLocale(next)
  },
})

const seniorModeValue = computed({
  get: () => settings.seniorModeEnabled,
  set: (value: boolean) => {
    void settings.setSeniorModeEnabled(value)
  },
})
</script>

<template>
  <div class="app-shell">
    <header class="app-bar">
      <button class="app-bar__back" type="button" :aria-label="t('back')" @click="router.back()">
        ←
      </button>
      <h1 class="app-bar__title">{{ t('settingsTitle') }}</h1>
      <span class="app-bar__action" aria-hidden="true" />
    </header>

    <main class="app-main">
      <section class="settings-section">
        <h3>{{ t('settingsAccountSection') }}</h3>
        <div class="field-row">
          <label>{{ t('settingsUsernameLabel') }}</label>
          <span>{{ username ?? t('settingsNotLoggedIn') }}</span>
        </div>
      </section>

      <section class="settings-section">
        <h3>{{ t('settingsAppearanceSection') }}</h3>
        <div class="field-row">
          <label for="theme-select">{{ t('settingsThemeLabel') }}</label>
          <select id="theme-select" v-model="themeValue">
            <option value="system">{{ t('settingsThemeSystem') }}</option>
            <option value="light">{{ t('settingsThemeLight') }}</option>
            <option value="dark">{{ t('settingsThemeDark') }}</option>
          </select>
        </div>
        <div class="field-row">
          <label for="language-select">{{ t('settingsLanguageLabel') }}</label>
          <select id="language-select" v-model="languageValue">
            <option value="system">{{ t('settingsLanguageSystem') }}</option>
            <option value="zh">{{ t('settingsLanguageChinese') }}</option>
            <option value="en">{{ t('settingsLanguageEnglish') }}</option>
            <option value="ko">{{ t('settingsLanguageKorean') }}</option>
          </select>
        </div>
      </section>

      <section class="settings-section">
        <h3>{{ t('settingsComfortSection') }}</h3>
        <div class="field-row">
          <label for="senior-mode">
            {{ t('settingsSeniorModeLabel') }}
            <small>{{ t('settingsSeniorModeSubtitle') }}</small>
          </label>
          <input
            id="senior-mode"
            v-model="seniorModeValue"
            class="toggle"
            type="checkbox"
          />
        </div>
      </section>
    </main>
  </div>
</template>
