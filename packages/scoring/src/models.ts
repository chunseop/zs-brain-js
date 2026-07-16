/** Input factors for scoring a single session/run. */
export interface ScoreFactors {
  /** Base workload for this run (positive integer suggested). */
  baseScore: number
  /** Accuracy multiplier, typically clamped to a non-zero lower bound. */
  accuracy: number
  /** Speed multiplier. */
  speedFactor: number
  /** Stability multiplier (streak / error smooth factor). */
  stability: number
  /** Difficulty multiplier. */
  difficulty: number
  /** Mode multiplier (e.g. practice / retry). */
  modeFactor: number
  /** Fatigue multiplier for anti-grind (optional). */
  fatigueFactor: number
}

/** Configuration for turning factors into scores. */
export interface ScoreConfig {
  accuracyMin: number
  accuracyMax: number
  speedMin: number
  speedMax: number
  stabilityMin: number
  stabilityMax: number
  difficultyMin: number
  difficultyMax: number
  modeMin: number
  modeMax: number
  fatigueMin: number
  fatigueMax: number
  /** Per-run cap before converting to display score. */
  rawCap: number
  /** Display score multiplier. DisplayScore = round(clamp(raw,0,rawCap) * K) */
  displayK: number
}

export const defaultScoreConfig: ScoreConfig = {
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
  rawCap: 5000,
  displayK: 1.0,
}

/** A star rating for a run. */
export enum StarRating {
  One = 1,
  Two = 2,
  Three = 3,
}
