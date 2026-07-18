export interface OrientationPoint {
  beta: number
  gamma: number
}

export function orientationDelta(
  current: OrientationPoint,
  center: OrientationPoint,
): OrientationPoint {
  return {
    beta: current.beta - center.beta,
    gamma: current.gamma - center.gamma,
  }
}

export function tiltMagnitude(delta: OrientationPoint): number {
  return Math.hypot(delta.beta, delta.gamma)
}

export function isWithinBalanceThreshold(
  delta: OrientationPoint,
  threshold: number,
): boolean {
  return tiltMagnitude(delta) <= threshold
}

export function stabilityPercent(stableMs: number, totalMs: number): number {
  if (totalMs <= 0) return 0
  const percent = Math.round((stableMs / totalMs) * 100)
  return Math.min(100, Math.max(0, percent))
}
