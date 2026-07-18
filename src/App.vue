<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'

import { useAppSettingsStore } from '@/app/settings/use-app-settings'
import { setAppLocale } from '@/locales/locale'

const settings = useAppSettingsStore()

const resolvedTheme = computed(() => settings.resolvedTheme)

function applyDocumentTheme() {
  document.documentElement.dataset.theme = resolvedTheme.value
  document.documentElement.dataset.seniorMode = settings.seniorModeEnabled ? 'true' : 'false'
}

watch(
  () => [settings.themeMode, settings.seniorModeEnabled, settings.resolvedTheme] as const,
  applyDocumentTheme,
  { immediate: true },
)

watch(
  () => settings.resolvedLocale,
  (next) => {
    setAppLocale(next)
  },
  { immediate: true },
)

onMounted(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', applyDocumentTheme)
})
</script>

<template>
  <RouterView />
</template>
