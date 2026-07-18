/** Plan 3–5 mid-session rule-switch moments (elapsed seconds), within a session. */
export function planRuleSwitchElapsedSeconds(
  sessionSeconds: number,
  random: () => number = Math.random,
): number[] {
  const switchCount = 3 + Math.floor(random() * 3) // 3, 4, or 5
  const earliest = 6
  const latest = Math.max(earliest + 1, sessionSeconds - 4)
  const span = latest - earliest
  const marks = new Set<number>()

  for (let i = 1; i <= switchCount; i += 1) {
    const base = earliest + Math.round((span * i) / (switchCount + 1))
    const jitter = Math.floor(random() * 5) - 2
    const clamped = Math.min(latest, Math.max(earliest, base + jitter))
    marks.add(clamped)
  }

  // Ensure we still have at least 3 distinct times if collisions collapsed the set.
  let guard = 0
  while (marks.size < Math.min(3, switchCount) && guard < 40) {
    marks.add(earliest + Math.floor(random() * (span + 1)))
    guard += 1
  }

  return [...marks].sort((a, b) => a - b)
}
