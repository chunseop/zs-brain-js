import type {
  ColorTapColorToken,
  ColorTapInstruction,
  ColorTapRound,
} from './color-tap-models'

export const COLOR_TAP_TOKENS: ColorTapColorToken[] = [
  { id: 'red', backgroundArgb: 0xffc62828, labelInkArgb: 0xff1565c0 },
  { id: 'yellow', backgroundArgb: 0xffd97706, labelInkArgb: 0xff1565c0 },
  { id: 'blue', backgroundArgb: 0xff1565c0, labelInkArgb: 0xff1565c0 },
]

export class ColorTapGenerator {
  constructor(private readonly random: () => number = Math.random) {}

  tokenById(id: string): ColorTapColorToken {
    const token = COLOR_TAP_TOKENS.find((item) => item.id === id)
    if (!token) throw new Error(`Unknown color id: ${id}`)
    return token
  }

  randomInstruction(): ColorTapInstruction {
    const target = COLOR_TAP_TOKENS[Math.floor(this.random() * COLOR_TAP_TOKENS.length)]!
    return { targetColorId: target.id }
  }

  next(instruction: ColorTapInstruction): ColorTapRound {
    const targetToken = this.tokenById(instruction.targetColorId)
    const otherToken = this.randomToken(instruction.targetColorId)
    const targetOnLeft = this.random() < 0.5

    const leftBg = targetOnLeft ? targetToken : otherToken
    const rightBg = targetOnLeft ? otherToken : targetToken

    const left = {
      backgroundArgb: leftBg.backgroundArgb,
      labelColorId: rightBg.id,
      labelInkArgb: leftBg.backgroundArgb,
      backgroundColorId: leftBg.id,
    }
    const right = {
      backgroundArgb: rightBg.backgroundArgb,
      labelColorId: leftBg.id,
      labelInkArgb: rightBg.backgroundArgb,
      backgroundColorId: rightBg.id,
    }

    return { left, right, instruction, correctOnLeft: targetOnLeft }
  }

  private randomToken(excludeId: string): ColorTapColorToken {
    const pool = COLOR_TAP_TOKENS.filter((token) => token.id !== excludeId)
    return pool[Math.floor(this.random() * pool.length)]!
  }
}
