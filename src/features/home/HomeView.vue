<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { RoutePaths } from '@/app/router/route-names'
import { useAppSettingsStore } from '@/app/settings/use-app-settings'

const menuItems = [
  {
    id: 'numberCompare',
    icon: '🔢',
    routePath: RoutePaths.numberCompare,
    titleKey: 'categoryMathGameNumberCompare',
    descKey: 'numberCompareRuleHint',
  },
  {
    id: 'colorTap',
    icon: '🎨',
    routePath: RoutePaths.colorTap,
    titleKey: 'categoryReactionGameColorTap',
    descKey: 'colorTapSetupHint',
  },
  {
    id: 'readArticle',
    icon: '📖',
    routePath: RoutePaths.readArticle,
    titleKey: 'readArticleTitle',
    descKey: 'readArticleHomeDescription',
  },
  {
    id: 'phoneBalance',
    icon: '⚖️',
    routePath: RoutePaths.phoneBalance,
    titleKey: 'phoneBalanceTitle',
    descKey: 'phoneBalanceHomeDescription',
  },
] as const

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
        class="app-bar__action app-bar__settings"
        type="button"
        :aria-label="t('settingsTitle')"
        @click="openSettings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </header>

    <main class="app-main">
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
.app-bar__settings svg {
  width: 1.5rem;
  height: 1.5rem;
  display: block;
}

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
