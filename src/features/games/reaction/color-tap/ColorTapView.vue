<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useAppSettingsStore } from '@/app/settings/use-app-settings'
import { argbToCss, colorTapColorLabel } from '@/features/games/reaction/color-tap/color-tap-labels'
import { ColorTapGenerator } from '@/features/games/reaction/color-tap/domain/color-tap-generator'
import type {
  ColorTapInstruction,
  ColorTapPanel,
  ColorTapRound,
} from '@/features/games/reaction/color-tap/domain/color-tap-models'
import { isCorrectTap } from '@/features/games/reaction/color-tap/domain/color-tap-models'
import {
  nextRuleHintAfterTap,
  resetRuleHintForSessionStart,
  resetRuleHintForSwitch,
  type RuleHintState,
} from '@/features/games/reaction/color-tap/domain/color-tap-rule-hint'
import { planRuleSwitchElapsedSeconds } from '@/features/games/reaction/color-tap/domain/color-tap-rule-switches'
import SplitChoiceGameShell from '@/features/games/shared/SplitChoiceGameShell.vue'
import SplitChoiceFloatingHint from '@/features/games/shared/SplitChoiceFloatingHint.vue'
import SplitChoiceSessionSummary from '@/features/games/shared/SplitChoiceSessionSummary.vue'
import {
  playCorrectFeedback,
  playWrongFeedback,
} from '@/features/games/shared/tap-feedback-sound'

const SESSION_SECONDS = 45
const WRONG_FEEDBACK_MS = 1500

type Phase = 'setup' | 'playing' | 'summary'

const router = useRouter()
const { t } = useI18n()
const settings = useAppSettingsStore()

const generator = new ColorTapGenerator()
const phase = ref<Phase>('setup')
const instruction = ref<ColorTapInstruction | null>(null)
const round = ref<ColorTapRound | null>(null)
const secondsRemaining = ref(SESSION_SECONDS)
const sessionTotal = ref(0)
const sessionCorrect = ref(0)
const ruleHint = ref<RuleHintState>(resetRuleHintForSessionStart())
const wrongFlash = ref(false)
const wrongTappedLeft = ref<boolean | null>(null)

let countdownTimer: ReturnType<typeof setInterval> | undefined
let wrongTimer: ReturnType<typeof setTimeout> | undefined
let ruleSwitchAtElapsed: number[] = []
let elapsedSeconds = 0

const seniorMode = computed(() => settings.seniorModeEnabled)

const accuracyPercent = computed(() => {
  if (sessionTotal.value === 0) return 0
  return Math.round((sessionCorrect.value * 100) / sessionTotal.value)
})

const ruleHintText = computed(() => {
  if (!instruction.value) return ''
  const colorName = colorTapColorLabel(t, instruction.value.targetColorId)
  return t('colorTapRuleHint', { colorName })
})

function clearTimers() {
  if (countdownTimer) clearInterval(countdownTimer)
  if (wrongTimer) clearTimeout(wrongTimer)
  countdownTimer = undefined
  wrongTimer = undefined
}

function nextRound() {
  if (!instruction.value) return
  round.value = generator.next(instruction.value)
}

function switchRule() {
  if (!instruction.value) return
  const fromId = instruction.value.targetColorId
  instruction.value = generator.randomInstructionDifferentFrom(fromId)
  ruleHint.value = resetRuleHintForSwitch()
  wrongFlash.value = false
  wrongTappedLeft.value = null
  nextRound()
}

function startSession() {
  clearTimers()
  sessionTotal.value = 0
  sessionCorrect.value = 0
  secondsRemaining.value = SESSION_SECONDS
  elapsedSeconds = 0
  ruleSwitchAtElapsed = planRuleSwitchElapsedSeconds(SESSION_SECONDS)
  wrongFlash.value = false
  wrongTappedLeft.value = null
  ruleHint.value = resetRuleHintForSessionStart()

  instruction.value = generator.randomInstruction()
  round.value = generator.next(instruction.value)
  phase.value = 'playing'

  countdownTimer = setInterval(() => {
    elapsedSeconds += 1
    secondsRemaining.value -= 1

    if (ruleSwitchAtElapsed.includes(elapsedSeconds) && phase.value === 'playing') {
      switchRule()
    }

    if (secondsRemaining.value <= 0) {
      secondsRemaining.value = 0
      clearTimers()
      phase.value = 'summary'
    }
  }, 1000)
}

function handleSideTap(tappedLeft: boolean) {
  const currentRound = round.value
  if (!currentRound || wrongFlash.value || phase.value !== 'playing') return

  const ok = isCorrectTap(currentRound, tappedLeft)
  sessionTotal.value += 1
  if (ok) sessionCorrect.value += 1
  ruleHint.value = nextRuleHintAfterTap(ruleHint.value, ok)

  if (ok) {
    void playCorrectFeedback()
    nextRound()
    return
  }

  void playWrongFeedback()
  wrongFlash.value = true
  wrongTappedLeft.value = tappedLeft
  wrongTimer = setTimeout(() => {
    wrongFlash.value = false
    wrongTappedLeft.value = null
    nextRound()
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
  round.value = null
  instruction.value = null
  router.back()
}

function panelLabel(panel: ColorTapPanel): string {
  return colorTapColorLabel(t, panel.labelColorId)
}

function panelState(isLeft: boolean) {
  const tapped = wrongTappedLeft.value
  return {
    wrong: wrongFlash.value && tapped === isLeft,
    correct: wrongFlash.value && tapped !== null && tapped !== isLeft,
    enabled: !wrongFlash.value,
  }
}

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<template>
  <SplitChoiceGameShell
    :title="t('categoryReactionGameColorTap')"
    :senior-mode="seniorMode"
    @back="handleBack"
  >
    <section v-if="phase === 'setup'" class="color-tap-setup">
      <p class="color-tap-setup__hint">{{ t('colorTapSetupHint') }}</p>
      <button class="color-tap-setup__start" type="button" @click="startSession">
        {{ t('colorTapStart') }}
      </button>
    </section>

    <section
      v-else-if="phase === 'playing' && round"
      class="color-tap-play"
      :class="{ 'color-tap-play--senior': seniorMode }"
    >
      <SplitChoiceFloatingHint
        :text="ruleHintText"
        :senior-mode="seniorMode"
        :visible="ruleHint.visible"
      />

      <div class="color-tap-panels" :class="{ 'color-tap-panels--flash': wrongFlash }">
        <button
          type="button"
          class="color-tap-panel"
          :class="{
            'color-tap-panel--wrong': panelState(true).wrong,
            'color-tap-panel--correct': panelState(true).correct,
            'color-tap-panel--senior': seniorMode,
          }"
          :disabled="!panelState(true).enabled"
          @click="handleSideTap(true)"
        >
          <span
            class="color-tap-panel__label"
            :style="{ color: argbToCss(round.left.labelInkArgb) }"
          >
            {{ panelLabel(round.left) }}
          </span>
          <span v-if="panelState(true).wrong" class="color-tap-panel__mark">✕</span>
          <span v-else-if="panelState(true).correct" class="color-tap-panel__mark">✓</span>
        </button>

        <div class="color-tap-divider" aria-hidden="true" />

        <button
          type="button"
          class="color-tap-panel"
          :class="{
            'color-tap-panel--wrong': panelState(false).wrong,
            'color-tap-panel--correct': panelState(false).correct,
            'color-tap-panel--senior': seniorMode,
          }"
          :disabled="!panelState(false).enabled"
          @click="handleSideTap(false)"
        >
          <span
            class="color-tap-panel__label"
            :style="{ color: argbToCss(round.right.labelInkArgb) }"
          >
            {{ panelLabel(round.right) }}
          </span>
          <span v-if="panelState(false).wrong" class="color-tap-panel__mark">✕</span>
          <span v-else-if="panelState(false).correct" class="color-tap-panel__mark">✓</span>
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
.color-tap-setup {
  display: grid;
  place-content: center;
  gap: 1rem;
  min-height: calc(100vh - 4rem);
  padding: 2rem 1.5rem;
  text-align: center;
}

.color-tap-setup__hint {
  margin: 0;
  color: var(--color-on-surface-variant);
  line-height: 1.6;
}

.color-tap-setup__start {
  justify-self: center;
  min-width: 9rem;
  min-height: 2.75rem;
  padding: 0.55rem 1.25rem;
  border: 1px solid var(--color-primary);
  border-radius: 9px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.color-tap-play {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 4rem);
  padding: 3.5rem 0 0;
}

.color-tap-panels {
  display: flex;
  flex: 1;
  min-height: 0;
}

.color-tap-divider {
  width: 2px;
  background: color-mix(in srgb, var(--color-outline) 35%, transparent);
}

.color-tap-panels--flash::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: rgb(220 38 38 / 18%);
}

.color-tap-panel {
  position: relative;
  display: grid;
  place-items: center;
  flex: 1;
  min-height: 12rem;
  border: 0;
  padding: 1rem;
  background: transparent;
  cursor: pointer;
}

.color-tap-panel:disabled {
  cursor: default;
}

.color-tap-panel--wrong {
  outline: 4px solid #dc2626;
}

.color-tap-panel--correct {
  outline: 4px solid var(--color-primary);
}

.color-tap-panel__label {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.15;
}

.color-tap-panel--senior .color-tap-panel__label {
  font-size: 4.75rem;
}

.color-tap-panel__mark {
  position: absolute;
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--color-on-surface);
  text-shadow: 0 2px 8px rgb(255 255 255 / 80%);
}

.color-tap-panel--wrong .color-tap-panel__mark {
  color: #dc2626;
}

.color-tap-panel--correct .color-tap-panel__mark {
  color: var(--color-primary);
}
</style>
