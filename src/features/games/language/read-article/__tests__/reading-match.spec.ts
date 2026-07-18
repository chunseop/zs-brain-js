import { describe, expect, it } from 'vitest'

import {
  compareReading,
  normalizeReadingText,
} from '../domain/reading-match'

describe('reading match', () => {
  it('strips punctuation and whitespace for comparison', () => {
    expect(normalizeReadingText('你好，世界！')).toBe('你好世界')
    expect(normalizeReadingText('Hello, world.')).toBe('helloworld')
    expect(normalizeReadingText('안녕하세요, 세계!')).toBe('안녕하세요세계')
  })

  it('scores a perfect reading', () => {
    const result = compareReading('春天来了。', '春天来了')
    expect(result).toEqual({
      originalCount: 4,
      recognizedCount: 4,
      correctCount: 4,
      missedCount: 0,
      extraCount: 0,
      accuracyPercent: 100,
    })
  })

  it('counts missed and extra characters', () => {
    const result = compareReading('一二三四五', '一三四五六')
    expect(result.originalCount).toBe(5)
    expect(result.recognizedCount).toBe(5)
    expect(result.correctCount).toBe(4)
    expect(result.missedCount).toBe(1)
    expect(result.extraCount).toBe(1)
    expect(result.accuracyPercent).toBe(80)
  })

  it('returns zero accuracy when nothing was recognized', () => {
    expect(compareReading('测试文章', '')).toEqual({
      originalCount: 4,
      recognizedCount: 0,
      correctCount: 0,
      missedCount: 4,
      extraCount: 0,
      accuracyPercent: 0,
    })
  })
})
