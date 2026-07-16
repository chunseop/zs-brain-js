import { describe, expect, it } from 'vitest'

import { ColorTapGenerator } from '../domain/color-tap-generator'
import type { ColorTapInstruction } from '../domain/color-tap-models'
import { isCorrectTap, isTargetColorOnLeft } from '../domain/color-tap-models'

function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32
    return state / 2 ** 32
  }
}

describe('ColorTapGenerator', () => {
  it('keeps left and right display colors different', () => {
    const generator = new ColorTapGenerator(seededRandom(0))
    for (let i = 0; i < 200; i += 1) {
      const round = generator.next(generator.randomInstruction())
      expect(round.left.backgroundColorId).not.toBe(round.right.backgroundColorId)
    }
  })

  it('shows opposite color name with matching ink on each side', () => {
    const generator = new ColorTapGenerator(seededRandom(1))
    for (let i = 0; i < 200; i += 1) {
      const round = generator.next(generator.randomInstruction())
      expect(round.left.labelColorId).toBe(round.right.backgroundColorId)
      expect(round.right.labelColorId).toBe(round.left.backgroundColorId)
      expect(round.left.labelColorId).not.toBe(round.left.backgroundColorId)
      expect(round.right.labelColorId).not.toBe(round.right.backgroundColorId)
      expect(round.left.labelInkArgb).toBe(round.left.backgroundArgb)
      expect(round.right.labelInkArgb).toBe(round.right.backgroundArgb)
    }
  })

  it('accepts tap on side showing target color (red)', () => {
    const generator = new ColorTapGenerator(seededRandom(2))
    const instruction: ColorTapInstruction = { targetColorId: 'red' }
    for (let i = 0; i < 100; i += 1) {
      const round = generator.next(instruction)
      const redOnLeft = isTargetColorOnLeft(round)
      expect(isCorrectTap(round, true)).toBe(redOnLeft)
      expect(isCorrectTap(round, false)).toBe(!redOnLeft)
    }
  })

  it('accepts tap on side showing target color (blue)', () => {
    const generator = new ColorTapGenerator(seededRandom(3))
    const instruction: ColorTapInstruction = { targetColorId: 'blue' }
    for (let i = 0; i < 100; i += 1) {
      const round = generator.next(instruction)
      const blueOnLeft = round.left.backgroundColorId === 'blue'
      expect(blueOnLeft !== (round.right.backgroundColorId === 'blue')).toBe(true)
      expect(isCorrectTap(round, true)).toBe(blueOnLeft)
      expect(isCorrectTap(round, false)).toBe(!blueOnLeft)
    }
  })
})
