<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useAppSettingsStore } from '@/app/settings/use-app-settings'
import {
  NumberCompareGenerator,
  isCorrectTap,
  type NumberCompareProblem,
} from '@/features/games/math/number-compare/domain/number-compare-problem'
import SplitChoiceGameShell from '@/features/games/shared/SplitChoiceGameShell.vue'
import SplitChoiceFloatingHint from '@/features/games/shared/SplitChoiceFloatingHint.vue'
import SplitChoiceSessionSummary from '@/features/games/shared/SplitChoiceSessionSummary.vue'
import SplitChoiceTimerChip from '@/features/games/shared/SplitChoiceTimerChip.vue'

const SESSION_SECONDS = 50
const STREAK_TO_LEVEL_UP = 5
const WRONG_FEEDBACK_MS = 520

type Phase = 'setup' | 'playing' | 'summary'

const router = useRouter()
const { t } = useI18n()
const settings = useAppSettingsStore()

const generator = new NumberCompareGenerator()
const phase = ref<Phase>('setup')
const problem = ref<NumberCompareProblem | null>(null)
const level = ref(1)
const streak = ref(0)
const secondsRemaining = ref(SESSION_SECONDS)
const sessionTotal = ref(0)
const sessionCorrect = ref(0)
const showRuleHint = ref(false)
const wrongFlash = ref(false)
const wrongTappedLeft = ref<boolean | null>(null)

let countdownTimer: ReturnType<typeof setInterval> | undefined
let wrongTimer: ReturnType<typeof setTimeout> | undefined

const seniorMode = computed(() => settings.seniorModeEnabled)

const accuracyPercent = computed(() => {
  if (sessionTotal.value === 0) return 0
  return Math.round((sessionCorrect.value * 100) / sessionTotal.value)
})

const timeLeftLabel = computed(() =>
  t('numberCompareTimeLeftChip', { seconds: secondsRemaining.value }),
)

function clearTimers() {
  if (countdownTimer) clearInterval(countdownTimer)
  if (wrongTimer) clearTimeout(wrongTimer)
  countdownTimer = undefined
  wrongTimer = undefined
}

function nextProblem() {
  problem.value = generator.next(level.value)
}

function startSession() {
  clearTimers()
  level.value = 1
  streak.value = 0
  sessionTotal.value = 0
  sessionCorrect.value = 0
  secondsRemaining.value = SESSION_SECONDS
  wrongFlash.value = false
  wrongTappedLeft.value = null

  nextProblem()
  phase.value = 'playing'
  showRuleHint.value = true

  countdownTimer = setInterval(() => {
    secondsRemaining.value -= 1
    if (secondsRemaining.value <= 0) {
      secondsRemaining.value = 0
      clearTimers()
      phase.value = 'summary'
    }
  }, 1000)
}

function handleSideTap(tappedLeft: boolean) {
  const current = problem.value
  if (!current || wrongFlash.value || phase.value !== 'playing') return

  const ok = isCorrectTap(current, tappedLeft)
  sessionTotal.value += 1

  if (ok) {
    sessionCorrect.value += 1
    streak.value += 1
    if (streak.value >= STREAK_TO_LEVEL_UP && level.value < NumberCompareGenerator.maxLevel) {
      level.value += 1
      streak.value = 0
    }
    if (showRuleHint.value) showRuleHint.value = false
    nextProblem()
    return
  }

  streak.value = 0
  wrongFlash.value = true
  wrongTappedLeft.value = tappedLeft
  wrongTimer = setTimeout(() => {
    wrongFlash.value = false
    wrongTappedLeft.value = null
    nextProblem()
  }, WRONG_FEEDBACK_MS)
}

function handleBack() {
  clearTimers()
}

function handlePlayAgain() {
  startSession()
}

function handleEnd() {
  phase.value = 'setup'
  problem.value = null
  router.back()
}

function panelState(isLeft: boolean) {
  const tapped = wrongTappedLeft.value
  return {
    wrong: wrongFlash.value && tapped === isLeft,
    correct: wrongFlash.value && tapped !== null && tapped !== isLeft,
    enabled: !wrongFlash.value,
  }
}

function isExpression(display: string): boolean {
  return /[+\-×÷]/.test(display)
}

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<template>
  <SplitChoiceGameShell :senior-mode="seniorMode" @back="handleBack">
    <section v-if="phase === 'setup'" class="nc-setup">
      <h1 class="nc-setup__title">{{ t('categoryMathGameNumberCompare') }}</h1>
      <p class="nc-setup__hint">{{ t('numberCompareRuleHint') }}</p>
      <button class="nc-setup__start" type="button" @click="startSession">
        {{ t('numberCompareStart') }}
      </button>
    </section>

    <section
      v-else-if="phase === 'playing' && problem"
      class="nc-play"
      :class="{ 'nc-play--senior': seniorMode }"
    >
      <SplitChoiceTimerChip :label="timeLeftLabel" :senior-mode="seniorMode" />

      <SplitChoiceFloatingHint
        :text="t('numberCompareRuleHint')"
        :senior-mode="seniorMode"
        :visible="showRuleHint"
      />

      <div class="nc-panels" :class="{ 'nc-panels--flash': wrongFlash }">
        <button
          type="button"
          class="nc-panel"
          :class="{
            'nc-panel--wrong': panelState(true).wrong,
            'nc-panel--correct': panelState(true).correct,
            'nc-panel--senior': seniorMode,
          }"
          :disabled="!panelState(true).enabled"
          @click="handleSideTap(true)"
        >
          <span
            class="nc-panel__value"
            :class="{ 'nc-panel__value--expr': isExpression(problem.leftDisplay) }"
          >{{ problem.leftDisplay }}</span>
          <span v-if="panelState(true).wrong" class="nc-panel__mark">✕</span>
          <span v-else-if="panelState(true).correct" class="nc-panel__mark">✓</span>
        </button>

        <div class="nc-divider" aria-hidden="true" />

        <button
          type="button"
          class="nc-panel"
          :class="{
            'nc-panel--wrong': panelState(false).wrong,
            'nc-panel--correct': panelState(false).correct,
            'nc-panel--senior': seniorMode,
          }"
          :disabled="!panelState(false).enabled"
          @click="handleSideTap(false)"
        >
          <span
            class="nc-panel__value"
            :class="{ 'nc-panel__value--expr': isExpression(problem.rightDisplay) }"
          >{{ problem.rightDisplay }}</span>
          <span v-if="panelState(false).wrong" class="nc-panel__mark">✕</span>
          <span v-else-if="panelState(false).correct" class="nc-panel__mark">✓</span>
        </button>
      </div>
    </section>

    <SplitChoiceSessionSummary
      :open="phase === 'summary'"
      :senior-mode="seniorMode"
      :session-total="sessionTotal"
      :session-correct="sessionCorrect"
      :accuracy-percent="accuracyPercent"
      @play-again="handlePlayAgain"
      @end="handleEnd"
    />
  </SplitChoiceGameShell>
</template>

<style scoped>
.nc-setup {
  display: grid;
  place-content: center;
  gap: 1rem;
  min-height: 100vh;
  padding: 5rem 1.5rem 2rem;
  text-align: center;
}

.nc-setup__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.nc-setup__hint {
  margin: 0;
  color: var(--color-on-surface-variant);
  line-height: 1.6;
}

.nc-setup__start {
  justify-self: center;
  min-width: 10rem;
  min-height: 3rem;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
}

.nc-play {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 4.5rem 0 0;
}

.nc-panels {
  display: flex;
  flex: 1;
  min-height: 0;
}

.nc-divider {
  width: 2px;
  background: color-mix(in srgb, var(--color-outline) 35%, transparent);
}

.nc-panels--flash::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: rgb(220 38 38 / 18%);
}

.nc-panel {
  position: relative;
  display: grid;
  place-items: center;
  flex: 1;
  min-height: 12rem;
  border: 0;
  padding: 1rem;
  background: transparent;
  color: var(--color-on-surface);
  cursor: pointer;
}

.nc-panel:disabled {
  cursor: default;
}

.nc-panel--wrong {
  outline: 4px solid #dc2626;
  background: rgb(220 38 38 / 12%);
}

.nc-panel--correct {
  outline: 4px solid var(--color-primary);
}

.nc-panel__value {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.nc-panel__value--expr {
  font-size: 2.1rem;
}

.nc-panel--senior .nc-panel__value {
  font-size: 3.75rem;
}

.nc-panel--senior .nc-panel__value--expr {
  font-size: 2.85rem;
}

.nc-panel__mark {
  position: absolute;
  bottom: 1.25rem;
  font-size: 2.5rem;
  font-weight: 800;
}

.nc-panel--wrong .nc-panel__mark {
  color: #dc2626;
}

.nc-panel--correct .nc-panel__mark {
  color: var(--color-primary);
}
</style>
