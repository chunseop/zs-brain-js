import { describe, expect, it } from 'vitest'

import {
  isWithinBalanceThreshold,
  orientationDelta,
  stabilityPercent,
  tiltMagnitude,
} from '../domain/phone-balance-metrics'

describe('phone balance metrics', () => {
  it('computes front/back and left/right deviation from calibration center', () => {
    expect(
      orientationDelta(
        { beta: 14, gamma: -3 },
        { beta: 10, gamma: -5 },
      ),
    ).toEqual({ beta: 4, gamma: 2 })
  })

  it('uses the two-axis Euclidean tilt magnitude', () => {
    expect(tiltMagnitude({ beta: 3, gamma: 4 })).toBe(5)
  })

  it('treats the threshold boundary as stable', () => {
    expect(isWithinBalanceThreshold({ beta: 3.6, gamma: 4.8 }, 6)).toBe(true)
    expect(isWithinBalanceThreshold({ beta: 3.7, gamma: 4.8 }, 6)).toBe(false)
  })

  it('rounds and clamps stability percentage', () => {
    expect(stabilityPercent(7_555, 10_000)).toBe(76)
    expect(stabilityPercent(12_000, 10_000)).toBe(100)
    expect(stabilityPercent(-100, 10_000)).toBe(0)
    expect(stabilityPercent(0, 0)).toBe(0)
  })
})
