import { Preferences } from '@capacitor/preferences'

import {
  AppSettingsPrefsKeys,
  type AppLocale,
  type ThemeMode,
} from './keys'

export async function readThemeMode(): Promise<ThemeMode> {
  const { value } = await Preferences.get({ key: AppSettingsPrefsKeys.themeMode })
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value
  }
  return 'system'
}

export async function writeThemeMode(mode: ThemeMode): Promise<void> {
  await Preferences.set({ key: AppSettingsPrefsKeys.themeMode, value: mode })
}

export async function readLocaleOverride(): Promise<AppLocale | null> {
  const { value } = await Preferences.get({ key: AppSettingsPrefsKeys.localeOverride })
  if (value === 'zh' || value === 'en' || value === 'ko') {
    return value
  }
  return null
}

export async function writeLocaleOverride(locale: AppLocale | null): Promise<void> {
  if (locale === null) {
    await Preferences.remove({ key: AppSettingsPrefsKeys.localeOverride })
    return
  }
  await Preferences.set({ key: AppSettingsPrefsKeys.localeOverride, value: locale })
}

export async function readSeniorMode(): Promise<boolean> {
  const { value } = await Preferences.get({ key: AppSettingsPrefsKeys.seniorMode })
  if (value === 'true') return true
  if (value === 'false') return false
  return true
}

export async function writeSeniorMode(enabled: boolean): Promise<void> {
  await Preferences.set({
    key: AppSettingsPrefsKeys.seniorMode,
    value: enabled ? 'true' : 'false',
  })
}
