<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

defineProps<{
  title: string
  seniorMode: boolean
}>()

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()
const { t } = useI18n()

function handleBack() {
  emit('back')
  router.back()
}
</script>

<template>
  <div class="app-shell split-shell" :class="{ 'split-shell--senior': seniorMode }">
    <header class="app-bar">
      <button class="app-bar__back" type="button" :aria-label="t('back')" @click="handleBack">
        ←
      </button>
      <h1 class="app-bar__title">{{ title }}</h1>
      <span class="app-bar__action" aria-hidden="true" />
    </header>
    <div class="split-shell__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.split-shell {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  background: var(--color-surface);
}

@supports not (height: 100dvh) {
  .split-shell {
    height: 100vh;
    max-height: 100vh;
  }
}

.split-shell--senior {
  font-size: 1.18em;
}

.split-shell__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
</style>
