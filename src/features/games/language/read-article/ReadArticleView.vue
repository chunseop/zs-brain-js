<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useAppSettingsStore } from '@/app/settings/use-app-settings'
import SplitChoiceGameShell from '@/features/games/shared/SplitChoiceGameShell.vue'

import {
  pickRandomArticle,
  type ReadArticleItem,
} from './data/articles'
import { compareReading, type ReadingMatchResult } from './domain/reading-match'
import { useSpeechRecognition } from './use-speech-recognition'

type Phase = 'ready' | 'reading' | 'summary'

const { t, locale } = useI18n()
const router = useRouter()
const settings = useAppSettingsStore()
const speech = useSpeechRecognition()

const phase = ref<Phase>('ready')
const article = ref<ReadArticleItem | null>(null)
const matchResult = ref<ReadingMatchResult | null>(null)

const seniorMode = computed(() => settings.seniorModeEnabled)
const speechLocale = computed(() => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'ko') return 'ko-KR'
  return 'zh-CN'
})
const liveTranscript = computed(() => {
  const finalText = speech.transcript.value
  const interim = speech.interimTranscript.value
  return `${finalText}${interim}`.trim()
})

const speechErrorKey = computed(() => {
  switch (speech.error.value) {
    case 'unsupported':
      return 'readArticleErrorUnsupported'
    case 'permission-denied':
      return 'readArticleErrorPermission'
    case 'network':
      return 'readArticleErrorNetwork'
    case 'unavailable':
      return 'readArticleErrorUnavailable'
    default:
      return null
  }
})

const summaryRows = computed(() => {
  const result = matchResult.value
  if (!result) return []
  return [
    { label: t('readArticleStatOriginal'), value: String(result.originalCount) },
    { label: t('readArticleStatRecognized'), value: String(result.recognizedCount) },
    { label: t('readArticleStatCorrect'), value: String(result.correctCount) },
    { label: t('readArticleStatAccuracy'), value: `${result.accuracyPercent}%` },
    { label: t('readArticleStatMissed'), value: String(result.missedCount) },
    { label: t('readArticleStatExtra'), value: String(result.extraCount) },
  ]
})

const colon = computed(() => (locale.value === 'en' ? ':' : '：'))

async function loadNewArticle() {
  speech.stop()
  matchResult.value = null
  article.value = await pickRandomArticle(locale.value)
  phase.value = 'ready'
}

async function startReading() {
  if (!article.value) return
  matchResult.value = null
  const ok = await speech.start(speechLocale.value)
  if (!ok) {
    phase.value = 'ready'
    return
  }
  phase.value = 'reading'
}

function finishReading() {
  if (!article.value) return
  speech.stop()
  matchResult.value = compareReading(article.value.text, speech.transcript.value)
  phase.value = 'summary'
}

function handleBack() {
  speech.stop()
}

function handleEnd() {
  speech.stop()
  router.back()
}

onBeforeUnmount(() => {
  speech.stop()
})

onMounted(() => {
  void loadNewArticle()
})
</script>

<template>
  <SplitChoiceGameShell
    :title="t('readArticleTitle')"
    :senior-mode="seniorMode"
    @back="handleBack"
  >
    <section v-if="article" class="read-page" :class="{ 'read-page--senior': seniorMode }">
      <p class="read-page__hint">{{ t('readArticleSetupHint') }}</p>

      <article class="read-article" aria-live="polite">
        <p class="read-article__meta">
          {{ t('readArticleCharCount', { count: article.charCount }) }}
        </p>
        <p class="read-article__text">{{ article.text }}</p>
      </article>

      <section v-if="phase === 'reading'" class="read-live" aria-live="polite">
        <h2>{{ t('readArticleListening') }}</h2>
        <p class="read-live__text">
          {{ liveTranscript || t('readArticleWaitingSpeech') }}
        </p>
      </section>

      <p v-if="speechErrorKey" class="read-error" role="alert">
        {{ t(speechErrorKey) }}
      </p>

      <div class="read-actions">
        <template v-if="phase === 'ready'">
          <button type="button" class="read-secondary" @click="loadNewArticle">
            {{ t('readArticleNextArticle') }}
          </button>
          <button type="button" class="read-primary" @click="startReading">
            {{ t('readArticleStart') }}
          </button>
        </template>

        <template v-else-if="phase === 'reading'">
          <button type="button" class="read-primary" @click="finishReading">
            {{ t('readArticleFinish') }}
          </button>
        </template>
      </div>
    </section>
    <p v-else class="read-loading" role="status">{{ t('readArticleLoading') }}</p>

    <Teleport to="body">
      <div
        v-if="phase === 'summary' && matchResult"
        class="read-summary-overlay"
        role="dialog"
        aria-modal="true"
      >
        <div class="read-summary" :class="{ 'read-summary--senior': seniorMode }">
          <h2>{{ t('readArticleSummaryTitle') }}</h2>
          <ul class="read-summary__stats">
            <li v-for="row in summaryRows" :key="row.label">
              <span class="read-summary__label">{{ row.label }}</span>
              <span class="read-summary__sep" aria-hidden="true">{{ colon }}</span>
              <span class="read-summary__value">{{ row.value }}</span>
            </li>
          </ul>
          <div class="read-summary__actions">
            <button type="button" class="read-secondary" @click="loadNewArticle">
              {{ t('readArticleNextArticle') }}
            </button>
            <button type="button" class="read-secondary" @click="startReading">
              {{ t('readArticleRetry') }}
            </button>
            <button type="button" class="read-primary" @click="handleEnd">
              {{ t('numberCompareEnd') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </SplitChoiceGameShell>
</template>

<style scoped>
.read-loading {
  margin: 4rem auto;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}

.read-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 1rem 1.25rem 0;
}

.read-page__hint {
  flex-shrink: 0;
  margin: 0 auto 0.85rem;
  max-width: 34rem;
  color: var(--color-on-surface-variant);
  line-height: 1.65;
  text-align: center;
  font-weight: 600;
}

.read-article {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: min(40rem, 100%);
  min-height: 0;
  margin: 0 auto;
  padding: 1.25rem;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid color-mix(in srgb, var(--color-outline) 45%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-surface) 92%, var(--color-primary) 8%);
  -webkit-overflow-scrolling: touch;
}

.read-article__meta {
  flex-shrink: 0;
  margin: 0 0 0.75rem;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}

.read-article__text {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.85;
}

.read-page--senior .read-article__text {
  font-size: 1.45rem;
}

.read-live {
  flex-shrink: 0;
  width: min(40rem, 100%);
  margin: 0.85rem auto 0;
  padding: 1rem 1.15rem;
  border-radius: 12px;
  background: #111827;
  color: #f8fafc;
}

.read-live h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.read-live__text {
  margin: 0;
  max-height: 6.5rem;
  overflow-y: auto;
  min-height: 3rem;
  line-height: 1.7;
  font-weight: 600;
  word-break: break-word;
}

.read-error {
  flex-shrink: 0;
  max-width: 40rem;
  margin: 0.75rem auto 0;
  color: #dc2626;
  font-weight: 700;
  line-height: 1.55;
  text-align: center;
}

.read-actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin: 0.85rem -1.25rem 0;
  padding: 0.85rem 1.25rem max(0.85rem, env(safe-area-inset-bottom));
  border-top: 1px solid color-mix(in srgb, var(--color-outline) 50%, transparent);
  background: color-mix(in srgb, var(--color-surface) 94%, var(--color-primary) 6%);
}

.read-primary,
.read-secondary {
  min-width: 8.5rem;
  min-height: 2.75rem;
  padding: 0.5rem 1.1rem;
  border: 1px solid var(--color-primary);
  border-radius: 9px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.read-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.read-secondary {
  background: transparent;
  color: var(--color-primary);
}

.read-summary-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 45%);
}

.read-summary {
  width: min(26rem, 100%);
  padding: 1.25rem;
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-on-surface);
  box-shadow: 0 12px 32px rgb(15 23 42 / 20%);
}

.read-summary h2 {
  margin: 0 0 1rem;
}

.read-summary__stats {
  list-style: none;
  margin: 0;
  padding: 0;
}

.read-summary__stats li {
  display: grid;
  grid-template-columns: 6rem auto 1fr;
  align-items: baseline;
  margin: 0.35rem 0;
  line-height: 1.5;
}

.read-summary__label {
  text-align: right;
}

.read-summary__sep {
  padding: 0 0.2rem;
}

.read-summary__value {
  font-variant-numeric: tabular-nums;
}

.read-summary__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 1.25rem;
}

.read-summary--senior {
  font-size: 1.1rem;
  font-weight: 700;
}

.read-summary--senior h2 {
  font-size: 1.4rem;
}
</style>
