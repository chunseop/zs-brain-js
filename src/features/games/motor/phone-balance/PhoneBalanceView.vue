<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useAppSettingsStore } from '@/app/settings/use-app-settings'
import SplitChoiceGameShell from '@/features/games/shared/SplitChoiceGameShell.vue'
import SplitChoiceTimerChip from '@/features/games/shared/SplitChoiceTimerChip.vue'

import {
  isWithinBalanceThreshold,
  orientationDelta,
  stabilityPercent,
  tiltMagnitude,
  type OrientationPoint,
} from './domain/phone-balance-metrics'
import { useDeviceOrientation } from './use-device-orientation'

const CALIBRATION_MS = 2_000
const SESSION_MS = 10_000
const SAMPLE_MS = 50
const IMBALANCE_DEBOUNCE_MS = 200
const NORMAL_THRESHOLD = 6
const SENIOR_THRESHOLD = 8
const VISUAL_LIMIT_DEGREES = 14

type Phase = 'setup' | 'calibrating' | 'playing' | 'summary'

const { t } = useI18n()
const router = useRouter()
const settings = useAppSettingsStore()
const orientation = useDeviceOrientation()

const phase = ref<Phase>('setup')
const center = ref<OrientationPoint | null>(null)
const calibrationSamples = ref<OrientationPoint[]>([])
const calibrationRemaining = ref(2)
const secondsRemaining = ref(10)
const currentDelta = ref<OrientationPoint>({ beta: 0, gamma: 0 })
const stableMs = ref(0)
const imbalanceCount = ref(0)
const maxTilt = ref(0)
const messageKey = ref<string | null>(null)

let calibrationTimer: ReturnType<typeof setInterval> | undefined
let calibrationFinishTimer: ReturnType<typeof setTimeout> | undefined
let sessionTimer: ReturnType<typeof setInterval> | undefined
let sessionStartedAt = 0
let previousTickAt = 0
let outsideSince: number | null = null
let outsideCounted = false

const seniorMode = computed(() => settings.seniorModeEnabled)
const threshold = computed(() => (seniorMode.value ? SENIOR_THRESHOLD : NORMAL_THRESHOLD))
const currentTilt = computed(() => tiltMagnitude(currentDelta.value))
const isStable = computed(() =>
  isWithinBalanceThreshold(currentDelta.value, threshold.value),
)
const finalStability = computed(() => stabilityPercent(stableMs.value, SESSION_MS))
const stableSeconds = computed(() => (stableMs.value / 1_000).toFixed(1))
const maxTiltLabel = computed(() => `${maxTilt.value.toFixed(1)}°`)
const timerLabel = computed(() =>
  t('phoneBalanceTimeLeft', { seconds: secondsRemaining.value }),
)

const ballStyle = computed(() => {
  const x = Math.max(-1, Math.min(1, currentDelta.value.gamma / VISUAL_LIMIT_DEGREES))
  const y = Math.max(-1, Math.min(1, currentDelta.value.beta / VISUAL_LIMIT_DEGREES))
  return {
    left: `${50 + x * 38}%`,
    top: `${50 + y * 38}%`,
  }
})

const sensorErrorKey = computed(() => {
  switch (orientation.error.value) {
    case 'unsupported':
      return 'phoneBalanceErrorUnsupported'
    case 'permission-denied':
      return 'phoneBalanceErrorPermission'
    case 'unavailable':
      return 'phoneBalanceErrorUnavailable'
    default:
      return messageKey.value
  }
})

function clearTimers() {
  if (calibrationTimer) clearInterval(calibrationTimer)
  if (calibrationFinishTimer) clearTimeout(calibrationFinishTimer)
  if (sessionTimer) clearInterval(sessionTimer)
  calibrationTimer = undefined
  calibrationFinishTimer = undefined
  sessionTimer = undefined
}

function stopActiveSession() {
  clearTimers()
  orientation.stop()
}

async function startCalibration() {
  stopActiveSession()
  messageKey.value = null
  center.value = null
  calibrationSamples.value = []
  calibrationRemaining.value = 2
  currentDelta.value = { beta: 0, gamma: 0 }

  const started = await orientation.start()
  if (!started) {
    phase.value = 'setup'
    return
  }

  phase.value = 'calibrating'
  const startedAt = performance.now()

  calibrationTimer = setInterval(() => {
    const elapsed = performance.now() - startedAt
    calibrationRemaining.value = Math.max(1, Math.ceil((CALIBRATION_MS - elapsed) / 1_000))
    if (orientation.hasSample.value) {
      calibrationSamples.value.push({
        beta: orientation.beta.value,
        gamma: orientation.gamma.value,
      })
    }
  }, SAMPLE_MS)

  calibrationFinishTimer = setTimeout(finishCalibration, CALIBRATION_MS)
}

function finishCalibration() {
  if (calibrationTimer) clearInterval(calibrationTimer)
  calibrationTimer = undefined
  calibrationFinishTimer = undefined

  const samples = calibrationSamples.value
  if (samples.length === 0) {
    orientation.stop()
    phase.value = 'setup'
    messageKey.value = 'phoneBalanceErrorNoSamples'
    return
  }

  center.value = {
    beta: samples.reduce((sum, sample) => sum + sample.beta, 0) / samples.length,
    gamma: samples.reduce((sum, sample) => sum + sample.gamma, 0) / samples.length,
  }
  startSession()
}

function startSession() {
  stableMs.value = 0
  imbalanceCount.value = 0
  maxTilt.value = 0
  secondsRemaining.value = 10
  outsideSince = null
  outsideCounted = false
  sessionStartedAt = performance.now()
  previousTickAt = sessionStartedAt
  phase.value = 'playing'

  sessionTimer = setInterval(sampleSession, SAMPLE_MS)
}

function sampleSession() {
  if (!center.value || !orientation.hasSample.value) return

  const now = performance.now()
  const elapsed = now - sessionStartedAt
  const tickDuration = Math.min(now - previousTickAt, SAMPLE_MS * 2)
  previousTickAt = now

  currentDelta.value = orientationDelta(
    { beta: orientation.beta.value, gamma: orientation.gamma.value },
    center.value,
  )

  const tilt = currentTilt.value
  maxTilt.value = Math.max(maxTilt.value, tilt)

  if (isStable.value) {
    stableMs.value += tickDuration
    outsideSince = null
    outsideCounted = false
  } else {
    outsideSince ??= now
    if (!outsideCounted && now - outsideSince >= IMBALANCE_DEBOUNCE_MS) {
      imbalanceCount.value += 1
      outsideCounted = true
    }
  }

  secondsRemaining.value = Math.max(0, Math.ceil((SESSION_MS - elapsed) / 1_000))
  if (elapsed >= SESSION_MS) finishSession()
}

function finishSession() {
  stopActiveSession()
  secondsRemaining.value = 0
  phase.value = 'summary'
}

function handleBack() {
  stopActiveSession()
}

function handleEnd() {
  stopActiveSession()
  router.back()
}

function handleVisibilityChange() {
  if (document.hidden && (phase.value === 'calibrating' || phase.value === 'playing')) {
    stopActiveSession()
    phase.value = 'setup'
    messageKey.value = 'phoneBalanceInterrupted'
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  stopActiveSession()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <SplitChoiceGameShell
    :title="t('phoneBalanceTitle')"
    :senior-mode="seniorMode"
    @back="handleBack"
  >
    <section v-if="phase === 'setup'" class="balance-setup">
      <div class="balance-phone" aria-hidden="true">📱</div>
      <p class="balance-setup__hint">{{ t('phoneBalanceSetupHint') }}</p>
      <p v-if="sensorErrorKey" class="balance-error" role="alert">
        {{ t(sensorErrorKey) }}
      </p>
      <button class="balance-primary" type="button" @click="startCalibration">
        {{ t('phoneBalanceStartCalibration') }}
      </button>
    </section>

    <section v-else-if="phase === 'calibrating'" class="balance-calibrating">
      <p class="balance-calibrating__title">{{ t('phoneBalanceCalibratingTitle') }}</p>
      <div class="balance-phone balance-phone--pulse" aria-hidden="true">📱</div>
      <p>{{ t('phoneBalanceCalibratingHint') }}</p>
      <strong class="balance-countdown">{{ calibrationRemaining }}</strong>
    </section>

    <section v-else-if="phase === 'playing'" class="balance-play">
      <SplitChoiceTimerChip :label="timerLabel" :senior-mode="seniorMode" />
      <p
        class="balance-status"
        :class="{ 'balance-status--warning': !isStable }"
        role="status"
      >
        {{ t(isStable ? 'phoneBalanceStable' : 'phoneBalanceAdjust') }}
      </p>

      <div class="balance-board" :class="{ 'balance-board--warning': !isStable }">
        <div class="balance-safe-zone" />
        <div
          class="balance-ball"
          :class="{ 'balance-ball--warning': !isStable }"
          :style="ballStyle"
        />
        <span class="balance-axis balance-axis--horizontal" />
        <span class="balance-axis balance-axis--vertical" />
      </div>

      <p class="balance-tilt">
        {{ t('phoneBalanceCurrentTilt', { degrees: currentTilt.toFixed(1) }) }}
      </p>
    </section>

    <Teleport to="body">
      <div v-if="phase === 'summary'" class="balance-summary-overlay" role="dialog" aria-modal="true">
        <div class="balance-summary" :class="{ 'balance-summary--senior': seniorMode }">
          <h2>{{ t('phoneBalanceSummaryTitle') }}</h2>
          <dl>
            <div>
              <dt>{{ t('phoneBalanceStableTime') }}</dt>
              <dd>{{ t('phoneBalanceSecondsValue', { seconds: stableSeconds }) }}</dd>
            </div>
            <div>
              <dt>{{ t('phoneBalanceStability') }}</dt>
              <dd>{{ finalStability }}%</dd>
            </div>
            <div>
              <dt>{{ t('phoneBalanceImbalanceCount') }}</dt>
              <dd>{{ imbalanceCount }}</dd>
            </div>
            <div>
              <dt>{{ t('phoneBalanceMaxTilt') }}</dt>
              <dd>{{ maxTiltLabel }}</dd>
            </div>
          </dl>
          <div class="balance-summary__actions">
            <button type="button" class="balance-secondary" @click="startCalibration">
              {{ t('numberComparePlayAgain') }}
            </button>
            <button type="button" class="balance-primary" @click="handleEnd">
              {{ t('numberCompareEnd') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </SplitChoiceGameShell>
</template>

<style scoped>
.balance-setup,
.balance-calibrating,
.balance-play {
  min-height: calc(100vh - 4rem);
  padding: 1.5rem 1.5rem 2rem;
  text-align: center;
}

.balance-setup,
.balance-calibrating {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 1rem;
}

.balance-calibrating__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
}

.balance-setup__hint,
.balance-calibrating p {
  max-width: 32rem;
  margin: 0;
  color: var(--color-on-surface-variant);
  font-weight: 600;
  line-height: 1.7;
}

.balance-phone {
  font-size: 4.5rem;
  line-height: 1;
}

.balance-phone--pulse {
  animation: balance-pulse 1s ease-in-out infinite alternate;
}

.balance-countdown {
  font-size: 3rem;
  color: var(--color-primary);
}

.balance-error {
  max-width: 32rem;
  margin: 0;
  color: #dc2626;
  font-weight: 700;
  line-height: 1.6;
}

.balance-primary,
.balance-secondary {
  min-width: 9rem;
  min-height: 2.75rem;
  padding: 0.55rem 1.25rem;
  border: 1px solid var(--color-primary);
  border-radius: 9px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.balance-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.balance-secondary {
  background: transparent;
  color: var(--color-primary);
}

.balance-play {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}

.balance-status {
  margin: 0;
  color: #15803d;
  font-size: 1.35rem;
  font-weight: 800;
}

.balance-status--warning {
  color: #dc2626;
}

.balance-board {
  position: relative;
  width: min(70vw, 22rem);
  aspect-ratio: 1;
  overflow: hidden;
  border: 4px solid #22c55e;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-surface) 92%, #22c55e 8%);
  box-shadow: inset 0 0 30px rgb(15 23 42 / 8%), var(--shadow-sm);
}

.balance-board--warning {
  border-color: #ef4444;
  background: color-mix(in srgb, var(--color-surface) 90%, #ef4444 10%);
}

.balance-safe-zone {
  position: absolute;
  inset: 32%;
  z-index: 2;
  border: 3px dashed #16a34a;
  border-radius: 50%;
  background: rgb(34 197 94 / 8%);
}

.balance-axis {
  position: absolute;
  z-index: 1;
  background: color-mix(in srgb, var(--color-outline) 35%, transparent);
}

.balance-axis--horizontal {
  top: 50%;
  right: 8%;
  left: 8%;
  height: 1px;
}

.balance-axis--vertical {
  top: 8%;
  bottom: 8%;
  left: 50%;
  width: 1px;
}

.balance-ball {
  position: absolute;
  z-index: 3;
  width: 3.25rem;
  height: 3.25rem;
  border: 4px solid #166534;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 5px 12px rgb(15 23 42 / 30%);
  transform: translate(-50%, -50%);
  transition: left 70ms linear, top 70ms linear, background-color 120ms ease;
}

.balance-ball--warning {
  border-color: #991b1b;
  background: #f87171;
}

.balance-tilt {
  margin: 0;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}

.balance-summary-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 45%);
}

.balance-summary {
  width: min(25rem, 100%);
  padding: 1.35rem;
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-on-surface);
  box-shadow: 0 12px 32px rgb(15 23 42 / 20%);
}

.balance-summary h2 {
  margin: 0 0 1rem;
}

.balance-summary dl {
  margin: 0;
}

.balance-summary dl div {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  margin: 0.45rem 0;
  line-height: 1.5;
}

.balance-summary dt {
  text-align: right;
}

.balance-summary dt::after {
  content: '：';
  padding: 0 0.2rem;
}

.balance-summary dd {
  margin: 0;
  text-align: left;
  font-variant-numeric: tabular-nums;
}

.balance-summary__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.balance-summary--senior {
  font-size: 1.125rem;
  font-weight: 700;
}

.balance-summary--senior h2 {
  font-size: 1.45rem;
}

.balance-summary--senior .balance-primary,
.balance-summary--senior .balance-secondary {
  min-height: 3rem;
  font-size: 1.08rem;
}

@keyframes balance-pulse {
  from {
    transform: rotate(-2deg);
  }
  to {
    transform: rotate(2deg);
  }
}
</style>
