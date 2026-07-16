<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

defineProps<{
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
  <div class="split-shell" :class="{ 'split-shell--senior': seniorMode }">
    <slot />
    <button
      class="split-shell__back"
      type="button"
      :aria-label="t('back')"
      @click="handleBack"
    >
      ←
    </button>
  </div>
</template>

<style scoped>
.split-shell {
  position: relative;
  min-height: 100vh;
  background: var(--color-surface);
}

.split-shell--senior {
  font-size: 1.18em;
}

.split-shell__back {
  position: fixed;
  top: max(0.5rem, env(safe-area-inset-top));
  left: max(0.5rem, env(safe-area-inset-left));
  z-index: 20;
  display: grid;
  place-items: center;
  width: 2.875rem;
  height: 2.875rem;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-sm);
  color: var(--color-on-surface);
  font-size: 1.25rem;
  cursor: pointer;
}

.split-shell--senior .split-shell__back {
  width: 3.25rem;
  height: 3.25rem;
  font-size: 1.4rem;
}
</style>
