import type { AppLocale } from '@/core/storage/keys'

import { i18n } from './index'

/** vue-i18n v10 composition mode exposes locale as a plain string on global. */
export function getAppLocale(): AppLocale {
  return i18n.global.locale as AppLocale
}

export function setAppLocale(locale: AppLocale): void {
  i18n.global.locale = locale
}
