import { describe, expect, it } from 'vitest'

import {
  calculateDisplayScore,
  calculateRawScore,
  calculateStarRating,
  StarRating,
  type ScoreConfig,
  type ScoreFactors,
} from '../src/index'

describe('calculateRawScore', () => {
  it('clamps factors and caps raw score', () => {
    const config: ScoreConfig = {
      accuracyMin: 0.35,
      accuracyMax: 1.0,
      speedMin: 0.85,
      speedMax: 1.25,
      stabilityMin: 0.9,
      stabilityMax: 1.15,
      difficultyMin: 1.0,
      difficultyMax: 2.0,
      modeMin: 0.0,
      modeMax: 1.0,
      fatigueMin: 0.7,
      fatigueMax: 1.0,
      rawCap: 100,
      displayK: 2,
    }

    const factors: ScoreFactors = {
      baseScore: 1000,
      accuracy: 0.0,
      speedFactor: 10.0,
      stability: 0.0,
      difficulty: 10.0,
      modeFactor: 2.0,
      fatigueFactor: 0.0,
    }

    const raw = calculateRawScore(factors, config)
    expect(raw).toBe(100)

    const display = calculateDisplayScore(raw, config)
    expect(display).toBe(200)
  })
})

describe('calculateStarRating', () => {
  it('applies thresholds', () => {
    expect(
      calculateStarRating({ completed: true, accuracy: 0.96, stability: 1.06 }),
    ).toBe(StarRating.Three)
    expect(
      calculateStarRating({ completed: true, accuracy: 0.8, stability: 0.9 }),
    ).toBe(StarRating.Two)
    expect(
      calculateStarRating({ completed: true, accuracy: 0.5, stability: 0.9 }),
    ).toBe(StarRating.One)
  })
})
