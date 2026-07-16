<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

defineProps<{
  titleKey: string
  bodyKey: string
}>()

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="app-shell">
    <header class="app-bar">
      <button class="app-bar__back" type="button" :aria-label="t('back')" @click="router.back()">
        ←
      </button>
      <h1 class="app-bar__title">{{ t(titleKey) }}</h1>
      <span class="app-bar__action" aria-hidden="true" />
    </header>
    <main class="app-main">
      <section class="page-card">
        <h2>{{ t(titleKey) }}</h2>
        <p>{{ t(bodyKey) }}</p>
      </section>
    </main>
  </div>
</template>
