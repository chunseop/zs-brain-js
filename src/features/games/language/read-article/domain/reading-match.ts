export interface ReadingMatchResult {
  originalCount: number
  recognizedCount: number
  correctCount: number
  missedCount: number
  extraCount: number
  accuracyPercent: number
}

/** Keep letters/digits/CJK ideographs for comparison; lowercase Latin. */
export function normalizeReadingText(input: string): string {
  return Array.from(input)
    .map((ch) => {
      if (/[A-Za-z0-9]/.test(ch)) return ch.toLowerCase()
      if (/[\u4e00-\u9fff\uac00-\ud7a3\u1100-\u11ff\u3130-\u318f]/.test(ch)) return ch
      return ''
    })
    .join('')
}

function longestCommonSubsequenceLength(a: string, b: string): number {
  const left = Array.from(a)
  const right = Array.from(b)
  const rows = left.length
  const cols = right.length
  const dp: number[][] = Array.from({ length: rows + 1 }, () =>
    Array.from({ length: cols + 1 }, () => 0),
  )

  for (let i = 1; i <= rows; i += 1) {
    for (let j = 1; j <= cols; j += 1) {
      if (left[i - 1] === right[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
      }
    }
  }

  return dp[rows]![cols]!
}

export function compareReading(
  originalText: string,
  recognizedText: string,
): ReadingMatchResult {
  const original = normalizeReadingText(originalText)
  const recognized = normalizeReadingText(recognizedText)
  const originalCount = Array.from(original).length
  const recognizedCount = Array.from(recognized).length
  const correctCount = longestCommonSubsequenceLength(original, recognized)
  const missedCount = Math.max(0, originalCount - correctCount)
  const extraCount = Math.max(0, recognizedCount - correctCount)
  const accuracyPercent =
    originalCount === 0 ? 0 : Math.round((correctCount * 100) / originalCount)

  return {
    originalCount,
    recognizedCount,
    correctCount,
    missedCount,
    extraCount,
    accuracyPercent,
  }
}
