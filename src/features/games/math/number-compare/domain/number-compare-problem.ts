export interface NumberCompareProblem {
  level: number
  leftDisplay: string
  rightDisplay: string
  leftValue: number
  rightValue: number
}

export function isCorrectTap(
  problem: NumberCompareProblem,
  tappedLeft: boolean,
): boolean {
  const tapped = tappedLeft ? problem.leftValue : problem.rightValue
  const other = tappedLeft ? problem.rightValue : problem.leftValue
  return tapped > other
}

interface Expr {
  display: string
  value: number
}

/** Generates number-compare problems per level (see Flutter 关卡说明.md). */
export class NumberCompareGenerator {
  static readonly maxLevel = 8
  private static readonly maxAttempts = 120

  constructor(private readonly random: () => number = Math.random) {}

  next(level: number): NumberCompareProblem {
    const lv = Math.min(Math.max(level, 1), NumberCompareGenerator.maxLevel)
    for (let attempt = 0; attempt < NumberCompareGenerator.maxAttempts; attempt += 1) {
      const problem = this.tryLevel(lv)
      if (problem) return problem
    }
    return this.tryPlainPair(1)!
  }

  private tryLevel(lv: number): NumberCompareProblem | null {
    switch (lv) {
      case 1:
        return this.tryPlainPair(1)
      case 2:
        return this.tryPlainPair(2, 10)
      case 3:
        return this.tryExprVsPlain(3, () => this.addSubSingle())
      case 4:
        return this.tryExprVsPlain(4, () => this.addSubSingle(), 10)
      case 5:
        return this.tryExprVsPlain(5, () => this.mixedExpr())
      case 6:
        return this.tryExprVsPlain(6, () => this.mixedExpr(), 15)
      case 7:
        return this.tryMulDivVsAddSub(7)
      case 8:
        return this.tryMulDivVsAddSub(8, 15)
      default:
        return null
    }
  }

  private coin(): boolean {
    return this.random() < 0.5
  }

  private ri(min: number, max: number): number {
    if (min >= max) return min
    return min + Math.floor(this.random() * (max - min + 1))
  }

  private pairOk(left: number, right: number, maxDiff?: number): boolean {
    if (left === right) return false
    if (maxDiff != null && Math.abs(left - right) > maxDiff) return false
    return true
  }

  private tryPlainPair(level: number, maxDiff?: number): NumberCompareProblem | null {
    const l = this.ri(1, 99)
    const r = this.ri(1, 99)
    if (!this.pairOk(l, r, maxDiff)) return null
    return {
      level,
      leftDisplay: `${l}`,
      rightDisplay: `${r}`,
      leftValue: l,
      rightValue: r,
    }
  }

  private pickPlainOtherThan(avoid: number): number | null {
    for (let k = 0; k < 80; k += 1) {
      const n = this.ri(1, 99)
      if (n !== avoid) return n
    }
    if (avoid > 1) return avoid - 1
    if (avoid < 99) return avoid + 1
    return null
  }

  private tryExprVsPlain(
    level: number,
    expr: () => Expr,
    maxDiff?: number,
  ): NumberCompareProblem | null {
    const e = expr()
    const other = this.pickPlainOtherThan(e.value)
    if (other == null) return null
    if (!this.pairOk(e.value, other, maxDiff)) return null
    if (this.coin()) {
      return {
        level,
        leftDisplay: e.display,
        rightDisplay: `${other}`,
        leftValue: e.value,
        rightValue: other,
      }
    }
    return {
      level,
      leftDisplay: `${other}`,
      rightDisplay: e.display,
      leftValue: other,
      rightValue: e.value,
    }
  }

  private tryMulDivVsAddSub(level: number, maxDiff?: number): NumberCompareProblem | null {
    const mulDiv = this.coin() ? this.mulTable() : this.divTable()
    const addSub = this.addSubSingle()
    if (!this.pairOk(mulDiv.value, addSub.value, maxDiff)) return null
    if (this.coin()) {
      return {
        level,
        leftDisplay: mulDiv.display,
        rightDisplay: addSub.display,
        leftValue: mulDiv.value,
        rightValue: addSub.value,
      }
    }
    return {
      level,
      leftDisplay: addSub.display,
      rightDisplay: mulDiv.display,
      leftValue: addSub.value,
      rightValue: mulDiv.value,
    }
  }

  private addSubSingle(): Expr {
    if (this.coin()) {
      const a = this.ri(8, 50)
      const b = this.ri(8, 50)
      return { display: `${a} + ${b}`, value: a + b }
    }
    const a = this.ri(20, 70)
    const b = this.ri(5, a - 5)
    return { display: `${a} - ${b}`, value: a - b }
  }

  private mixedExpr(): Expr {
    const kind = this.ri(0, 3)
    switch (kind) {
      case 0: {
        const a = this.ri(10, 45)
        const b = this.ri(10, 45)
        return { display: `${a} + ${b}`, value: a + b }
      }
      case 1: {
        const a = this.ri(30, 80)
        const b = this.ri(5, a - 10)
        return { display: `${a} - ${b}`, value: a - b }
      }
      case 2:
        return this.mulTable()
      default:
        return this.divTable()
    }
  }

  private mulTable(): Expr {
    const a = this.ri(2, 9)
    const b = this.ri(2, 9)
    return { display: `${a} × ${b}`, value: a * b }
  }

  private divTable(): Expr {
    const divisor = this.ri(2, 9)
    const quotient = this.ri(2, 9)
    const dividend = divisor * quotient
    return { display: `${dividend} ÷ ${divisor}`, value: quotient }
  }
}
