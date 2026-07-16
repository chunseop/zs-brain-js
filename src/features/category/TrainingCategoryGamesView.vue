<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useAppSettingsStore } from '@/app/settings/use-app-settings'
import { useToast } from '@/core/ui/use-toast'
import { trainingCategoryById } from '@/features/category/training-category-catalog'
import {
  routePathForGameId,
  titleKeyForGameId,
} from '@/features/games/game-registry'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const settings = useAppSettingsStore()
const toast = useToast()

const categoryId = computed(() => String(route.params.categoryId ?? ''))
const category = computed(() => trainingCategoryById(categoryId.value))
const seniorMode = computed(() => settings.seniorModeEnabled)
const showCategoryDescription = computed(() => categoryId.value !== 'memory')

function gameTitle(gameId: string): string {
  const titleKey = titleKeyForGameId(gameId)
  return titleKey ? t(titleKey) : gameId
}

function openGame(gameId: string): void {
  const routePath = routePathForGameId(gameId)
  if (routePath) {
    router.push(routePath)
    return
  }
  toast.show(t('categoryGameComingSoon', { gameName: gameTitle(gameId) }))
}
</script>

<template>
  <div class="app-shell">
    <header class="app-bar">
      <button class="app-bar__back" type="button" :aria-label="t('back')" @click="router.back()">
        ←
      </button>
      <h1 class="app-bar__title">
        {{ category ? t(category.titleKey) : t('categoryTrainingTitle') }}
      </h1>
      <span class="app-bar__action" aria-hidden="true" />
    </header>

    <main class="app-main" :class="{ 'app-main--senior': seniorMode }">
      <template v-if="category">
        <p v-if="showCategoryDescription" class="category-desc">
          {{ t(category.descriptionKey) }}
        </p>
        <ul class="game-list">
          <li v-for="game in category.games" :key="game.id">
            <button
              type="button"
              class="game-item"
              :class="{ 'game-item--senior': seniorMode }"
              @click="openGame(game.id)"
            >
              <span class="game-item__title">{{ gameTitle(game.id) }}</span>
              <span class="game-item__play" aria-hidden="true">▶</span>
            </button>
          </li>
        </ul>
      </template>

      <section v-else class="page-card">
        <p>{{ t('categoryUnknownIdBody') }}</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.category-desc {
  margin: 0 0 1rem;
  color: var(--color-on-surface-variant);
  font-size: 0.9rem;
}

.app-main--senior .category-desc {
  font-size: 1rem;
  font-weight: 700;
}

.game-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.game-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface) 92%, var(--color-primary) 8%);
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.game-item:hover {
  transform: translateY(-1px);
}

.game-item__title {
  font-size: 1rem;
  font-weight: 600;
}

.game-item--senior {
  padding: 1rem 1.125rem;
}

.game-item--senior .game-item__title {
  font-size: 1.2rem;
  font-weight: 700;
}

.game-item__play {
  color: var(--color-on-surface-variant);
  font-size: 1.25rem;
}

.game-item--senior .game-item__play {
  font-size: 1.5rem;
}
</style>
