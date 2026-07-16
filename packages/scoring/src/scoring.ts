import {
  defaultScoreConfig,
  type ScoreConfig,
  type ScoreFactors,
  StarRating,
} from './models'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Computes the raw score for a single run.
 *
 * Formula (from `biz-plan.md`):
 * RawScore = BaseScore × Accuracy × SpeedFactor × Stability × Difficulty × ModeFactor × FatigueFactor
 */
export function calculateRawScore(
  factors: ScoreFactors,
  config: ScoreConfig = defaultScoreConfig,
): number {
  const base = factors.baseScore
  const accuracy = clamp(factors.accuracy, config.accuracyMin, config.accuracyMax)
  const speed = clamp(factors.speedFactor, config.speedMin, config.speedMax)
  const stability = clamp(factors.stability, config.stabilityMin, config.stabilityMax)
  const difficulty = clamp(factors.difficulty, config.difficultyMin, config.difficultyMax)
  const mode = clamp(factors.modeFactor, config.modeMin, config.modeMax)
  const fatigue = clamp(factors.fatigueFactor, config.fatigueMin, config.fatigueMax)

  const raw = base * accuracy * speed * stability * difficulty * mode * fatigue
  return Math.min(raw, config.rawCap)
}

/** Converts raw score into a UI-friendly integer score. */
export function calculateDisplayScore(
  rawScore: number,
  config: ScoreConfig = defaultScoreConfig,
): number {
  const capped = clamp(rawScore, 0, config.rawCap)
  return Math.round(capped * config.displayK)
}

/**
 * Computes a star rating for a run.
 *
 * Default thresholds follow `biz-plan.md` (example):
 * - 3 stars: Accuracy ≥ 0.95 and Stability ≥ 1.05
 * - 2 stars: Accuracy ≥ 0.80
 * - 1 star: Completed
 */
export function calculateStarRating({
  completed,
  accuracy,
  stability,
  threeStarAccuracyMin = 0.95,
  threeStarStabilityMin = 1.05,
  twoStarAccuracyMin = 0.8,
}: {
  completed: boolean
  accuracy: number
  stability: number
  threeStarAccuracyMin?: number
  threeStarStabilityMin?: number
  twoStarAccuracyMin?: number
}): StarRating {
  if (!completed) {
    throw new Error('completed must be true to rate a run.')
  }

  if (accuracy >= threeStarAccuracyMin && stability >= threeStarStabilityMin) {
    return StarRating.Three
  }
  if (accuracy >= twoStarAccuracyMin) {
    return StarRating.Two
  }
  return StarRating.One
}
