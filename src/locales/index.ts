import { createI18n } from 'vue-i18n'

import en from './en.json'
import ko from './ko.json'
import zh from './zh.json'

export type MessageSchema = typeof zh

export const i18n = createI18n<[MessageSchema], 'zh' | 'en' | 'ko'>({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: { zh, en, ko },
})
