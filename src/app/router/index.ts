import { createRouter, createWebHistory } from 'vue-router'

import { RouteNames, RoutePaths } from './route-names'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: RoutePaths.home,
      name: RouteNames.home,
      component: () => import('@/features/home/HomeView.vue'),
    },
    {
      path: RoutePaths.settings,
      name: RouteNames.settings,
      component: () => import('@/features/settings/SettingsView.vue'),
    },
    {
      path: RoutePaths.numberCompare,
      name: RouteNames.numberCompare,
      component: () => import('@/features/games/math/number-compare/NumberCompareView.vue'),
    },
    {
      path: RoutePaths.colorTap,
      name: RouteNames.colorTap,
      component: () => import('@/features/games/reaction/color-tap/ColorTapView.vue'),
    },
  ],
})

export default router
