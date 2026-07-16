<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { RoutePaths } from '@/app/router/route-names'
import { useAppSettingsStore } from '@/app/settings/use-app-settings'

type HomeMenuId =
  | 'todayTraining'
  | 'startTraining'
  | 'calendar'
  | 'analytics'
  | 'family'

const menuItems: Array<{
  id: HomeMenuId
  icon: string
  routePath: string
  titleKey: string
  descKey: string
}> = [
  {
    id: 'todayTraining',
    icon: '📅',
    routePath: RoutePaths.todayTraining,
    titleKey: 'homeMenuTodayTraining',
    descKey: 'homeMenuTodayTrainingDesc',
  },
  {
    id: 'startTraining',
    icon: '🧩',
    routePath: RoutePaths.categoryTraining,
    titleKey: 'homeMenuCategoryTraining',
    descKey: 'homeMenuCategoryTrainingDesc',
  },
  {
    id: 'calendar',
    icon: '🗓️',
    routePath: RoutePaths.calendar,
    titleKey: 'homeMenuCalendar',
    descKey: 'homeMenuCalendarDesc',
  },
  {
    id: 'analytics',
    icon: '📈',
    routePath: RoutePaths.analytics,
    titleKey: 'homeMenuAnalytics',
    descKey: 'homeMenuAnalyticsDesc',
  },
  {
    id: 'family',
    icon: '👨‍👩‍👧',
    routePath: RoutePaths.family,
    titleKey: 'homeMenuFamily',
    descKey: 'homeMenuFamilyDesc',
  },
]

const router = useRouter()
const { t } = useI18n()
const settings = useAppSettingsStore()

const seniorMode = computed(() => settings.seniorModeEnabled)

function openSettings() {
  router.push(RoutePaths.settings)
}
</script>

<template>
  <div class="app-shell">
    <header class="app-bar">
      <span class="app-bar__action" aria-hidden="true" />
      <h1 class="app-bar__title">{{ t('appTitle') }}</h1>
      <button
        class="app-bar__action"
        type="button"
        :aria-label="t('settingsTitle')"
        @click="openSettings"
      >
        ⚙️
      </button>
    </header>

    <main class="app-main">
      <h2 class="section-title">{{ t('homeMenuSection') }}</h2>
      <ul class="menu-list">
        <li v-for="item in menuItems" :key="item.id">
          <RouterLink
            :to="item.routePath"
            class="menu-item"
            :class="{ 'menu-item--senior': seniorMode }"
          >
            <span class="menu-item__icon" aria-hidden="true">{{ item.icon }}</span>
            <div class="menu-item__content">
              <p class="menu-item__title">{{ t(item.titleKey) }}</p>
              <p class="menu-item__desc">{{ t(item.descKey) }}</p>
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
