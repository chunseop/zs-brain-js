<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
  seniorMode: boolean
  sessionTotal: number
  sessionCorrect: number
  accuracyPercent: number
}>()

const emit = defineEmits<{
  playAgain: []
  end: []
}>()

const { t, locale } = useI18n()

const titleWeight = computed(() => (props.seniorMode ? 800 : 700))
const bodyWeight = computed(() => (props.seniorMode ? 800 : 500))
const bodySize = computed(() => (props.seniorMode ? '1.125rem' : '1rem'))
const colon = computed(() => (locale.value === 'en' ? ':' : '：'))

const stats = computed(() => [
  { label: t('numberCompareStatTotal'), value: String(props.sessionTotal) },
  { label: t('numberCompareStatCorrect'), value: String(props.sessionCorrect) },
  { label: t('numberCompareStatAccuracy'), value: `${props.accuracyPercent}%` },
])
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="summary-overlay" role="dialog" aria-modal="true">
      <div class="summary-card" :class="{ 'summary-card--senior': seniorMode }">
        <h2 class="summary-card__title" :style="{ fontWeight: titleWeight }">
          {{ t('numberCompareTimeUpTitle') }}
        </h2>
        <ul class="summary-stats" :style="{ fontSize: bodySize, fontWeight: bodyWeight }">
          <li v-for="item in stats" :key="item.label" class="summary-stat">
            <span class="summary-stat__label">{{ item.label }}</span>
            <span class="summary-stat__sep" aria-hidden="true">{{ colon }}</span>
            <span class="summary-stat__value">{{ item.value }}</span>
          </li>
        </ul>
        <div class="summary-card__actions">
          <button type="button" class="summary-card__secondary" @click="emit('playAgain')">
            {{ t('numberComparePlayAgain') }}
          </button>
          <button type="button" class="summary-card__primary" @click="emit('end')">
            {{ t('numberCompareEnd') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.summary-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 45%);
}

.summary-card {
  width: min(24rem, 100%);
  padding: 1.25rem;
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-on-surface);
  box-shadow: 0 12px 32px rgb(15 23 42 / 20%);
}

.summary-card__title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

.summary-card--senior .summary-card__title {
  font-size: 1.4rem;
}

.summary-stats {
  list-style: none;
  margin: 0;
  padding: 0;
}

.summary-stat {
  display: grid;
  grid-template-columns: 5.5rem auto 1fr;
  align-items: baseline;
  gap: 0;
  margin: 0.35rem 0;
  line-height: 1.5;
  color: var(--color-on-surface);
}

.summary-card--senior .summary-stat {
  grid-template-columns: 6.5rem auto 1fr;
}

.summary-stat__label {
  text-align: right;
}

.summary-stat__sep {
  padding: 0 0.2rem;
}

.summary-stat__value {
  font-variant-numeric: tabular-nums;
}

.summary-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.summary-card__secondary,
.summary-card__primary {
  min-height: 2.4rem;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.summary-card__secondary {
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
}

.summary-card__primary {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.summary-card--senior .summary-card__secondary,
.summary-card--senior .summary-card__primary {
  min-height: 2.75rem;
  font-size: 1.05rem;
}
</style>
