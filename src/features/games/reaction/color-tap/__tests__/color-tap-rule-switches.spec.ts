import { describe, expect, it } from 'vitest'

import { planRuleSwitchElapsedSeconds } from '../domain/color-tap-rule-switches'

function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32
    return state / 2 ** 32
  }
}

describe('planRuleSwitchElapsedSeconds', () => {
  it('plans 3 to 5 unique switch times inside the session', () => {
    for (let seed = 0; seed < 30; seed += 1) {
      const marks = planRuleSwitchElapsedSeconds(45, seededRandom(seed))
      expect(marks.length).toBeGreaterThanOrEqual(3)
      expect(marks.length).toBeLessThanOrEqual(5)
      expect(new Set(marks).size).toBe(marks.length)
      expect(marks.every((t) => t >= 6 && t <= 41)).toBe(true)
      expect([...marks].sort((a, b) => a - b)).toEqual(marks)
    }
  })
})
