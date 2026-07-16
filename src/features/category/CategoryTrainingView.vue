<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useAppSettingsStore } from '@/app/settings/use-app-settings'
import {
  buildTrainingCategoryCatalog,
  routePathForCategory,
} from '@/features/category/training-category-catalog'

const router = useRouter()
const { t } = useI18n()
const settings = useAppSettingsStore()

const catalog = buildTrainingCategoryCatalog()
const seniorMode = computed(() => settings.seniorModeEnabled)
</script>

<template>
  <div class="app-shell">
    <header class="app-bar">
      <button class="app-bar__back" type="button" :aria-label="t('back')" @click="router.back()">
        ←
      </button>
      <h1 class="app-bar__title">{{ t('categoryTrainingTitle') }}</h1>
      <span class="app-bar__action" aria-hidden="true" />
    </header>

    <main class="app-main">
      <ul class="menu-list">
        <li v-for="item in catalog" :key="item.id">
          <RouterLink
            :to="routePathForCategory(item.id)"
            class="menu-item"
            :class="{ 'menu-item--senior': seniorMode }"
          >
            <span class="menu-item__icon" aria-hidden="true">{{ item.icon }}</span>
            <div class="menu-item__content">
              <p class="menu-item__title">{{ t(item.titleKey) }}</p>
              <p class="menu-item__desc">{{ t(item.descriptionKey) }}</p>
            </div>
            <span class="menu-item__chevron" aria-hidden="true">›</span>
          </RouterLink>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
.menu-item--senior .menu-item__title {
  font-size: 1.2rem;
}

.menu-item--senior .menu-item__desc {
  font-size: 1rem;
  font-weight: 600;
}

.menu-item--senior .menu-item__icon {
  width: 3.75rem;
  height: 3.75rem;
  font-size: 1.75rem;
}
</style>
