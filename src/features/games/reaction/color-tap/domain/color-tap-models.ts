export interface ColorTapColorToken {
  id: string
  backgroundArgb: number
  labelInkArgb: number
}

export interface ColorTapPanel {
  backgroundArgb: number
  /** Opposite side background color id (shown as label text). */
  labelColorId: string
  labelInkArgb: number
  backgroundColorId: string
}

export interface ColorTapInstruction {
  targetColorId: string
}

export interface ColorTapRound {
  left: ColorTapPanel
  right: ColorTapPanel
  instruction: ColorTapInstruction
  correctOnLeft: boolean
}

/** Tap the side whose text is displayed in the target color. */
export function isCorrectTap(round: ColorTapRound, tappedLeft: boolean): boolean {
  return tappedLeft === round.correctOnLeft
}

export function isTargetColorOnLeft(round: ColorTapRound): boolean {
  return round.left.backgroundColorId === round.instruction.targetColorId
}
