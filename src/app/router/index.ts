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
      path: RoutePaths.categoryTraining,
      name: RouteNames.categoryTraining,
      component: () => import('@/features/category/CategoryTrainingView.vue'),
    },
    {
      path: RoutePaths.categoryGames,
      name: RouteNames.categoryGames,
      component: () => import('@/features/category/TrainingCategoryGamesView.vue'),
    },
    {
      path: RoutePaths.todayTraining,
      name: RouteNames.todayTraining,
      component: () => import('@/features/today/TodayTrainingView.vue'),
    },
    {
      path: RoutePaths.calendar,
      name: RouteNames.calendar,
      component: () => import('@/features/calendar/TrainingCalendarView.vue'),
    },
    {
      path: RoutePaths.analytics,
      name: RouteNames.analytics,
      component: () => import('@/features/analytics/AbilityAnalyticsView.vue'),
    },
    {
      path: RoutePaths.family,
      name: RouteNames.family,
      component: () => import('@/features/family/FamilyCenterView.vue'),
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
      path: RoutePaths.positionFlipBoard,
      name: RouteNames.positionFlipBoard,
      component: () => import('@/features/games/GamePlaceholderView.vue'),
    },
    {
      path: RoutePaths.colorTap,
      name: RouteNames.colorTap,
      component: () => import('@/features/games/reaction/color-tap/ColorTapView.vue'),
    },
    {
      path: RoutePaths.whackAMole,
      name: RouteNames.whackAMole,
      component: () => import('@/features/games/GamePlaceholderView.vue'),
    },
    {
      path: RoutePaths.tRexRunner,
      name: RouteNames.tRexRunner,
      component: () => import('@/features/games/GamePlaceholderView.vue'),
    },
  ],
})

export default router
