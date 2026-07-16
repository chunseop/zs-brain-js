import { describe, expect, it } from 'vitest'

import {
  NumberCompareGenerator,
  isCorrectTap,
} from '../domain/number-compare-problem'

function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32
    return state / 2 ** 32
  }
}

describe('NumberCompareGenerator', () => {
  it('never produces a tie across all levels', () => {
    const generator = new NumberCompareGenerator(seededRandom(7))
    for (let level = 1; level <= NumberCompareGenerator.maxLevel; level += 1) {
      for (let i = 0; i < 100; i += 1) {
        const problem = generator.next(level)
        expect(problem.leftValue).not.toBe(problem.rightValue)
      }
    }
  })

  it('respects max diff constraint on level 2', () => {
    const generator = new NumberCompareGenerator(seededRandom(2))
    for (let i = 0; i < 100; i += 1) {
      const problem = generator.next(2)
      expect(Math.abs(problem.leftValue - problem.rightValue)).toBeLessThanOrEqual(10)
    }
  })

  it('has one expression side on level 3', () => {
    const generator = new NumberCompareGenerator(seededRandom(3))
    for (let i = 0; i < 50; i += 1) {
      const problem = generator.next(3)
      const leftIsExpr = /[+\-×÷]/.test(problem.leftDisplay)
      const rightIsExpr = /[+\-×÷]/.test(problem.rightDisplay)
      expect(leftIsExpr !== rightIsExpr).toBe(true)
    }
  })

  it('marks the larger side as correct', () => {
    const generator = new NumberCompareGenerator(seededRandom(5))
    for (let i = 0; i < 100; i += 1) {
      const problem = generator.next(5)
      const leftBigger = problem.leftValue > problem.rightValue
      expect(isCorrectTap(problem, true)).toBe(leftBigger)
      expect(isCorrectTap(problem, false)).toBe(!leftBigger)
    }
  })
})
