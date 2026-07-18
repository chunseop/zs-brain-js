import { isRef } from 'vue'

import type { AppLocale } from '@/core/storage/keys'

import { i18n } from './index'

/** Read the active locale whether vue-i18n exposes a ref or a plain string. */
export function getAppLocale(): AppLocale {
  const locale = i18n.global.locale
  return (isRef(locale) ? locale.value : locale) as AppLocale
}

export function setAppLocale(locale: AppLocale): void {
  const current = i18n.global.locale
  if (isRef(current)) {
    current.value = locale
    return
  }
  ;(i18n.global as { locale: AppLocale }).locale = locale
}
