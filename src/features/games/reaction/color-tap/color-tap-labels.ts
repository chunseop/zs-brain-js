import type { Composer } from 'vue-i18n'

const COLOR_LABEL_KEYS: Record<string, string> = {
  red: 'colorTapColorRed',
  yellow: 'colorTapColorYellow',
  blue: 'colorTapColorBlue',
}

export function colorTapColorLabel(t: Composer['t'], colorId: string): string {
  const key = COLOR_LABEL_KEYS[colorId]
  return key ? String(t(key)) : colorId
}

export function argbToCss(argb: number): string {
  const rgb = argb & 0xffffff
  return `#${rgb.toString(16).padStart(6, '0')}`
}
