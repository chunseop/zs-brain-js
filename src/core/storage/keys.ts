/** Keys aligned with Flutter [AppSettingsPrefsKeys]. */
export const AppSettingsPrefsKeys = {
  themeMode: 'app_theme_mode',
  localeOverride: 'app_locale_override',
  seniorMode: 'app_senior_mode',
} as const

export type ThemeMode = 'system' | 'light' | 'dark'
export type AppLocale = 'zh' | 'en' | 'ko'
