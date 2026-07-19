/** Soft split-choice tap feedback via Web Audio (no asset files). */

let sharedContext: AudioContext | null = null

/** Test-only: clear the cached AudioContext between cases. */
export function resetTapFeedbackSoundForTests(): void {
  sharedContext = null
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new AudioCtx()
  }
  return sharedContext
}

async function resumeIfNeeded(ctx: AudioContext): Promise<boolean> {
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      return false
    }
  }
  return ctx.state === 'running'
}

function playTone(
  ctx: AudioContext,
  {
    frequency,
    startAt,
    duration,
    gain = 0.08,
    type = 'sine',
  }: {
    frequency: number
    startAt: number
    duration: number
    gain?: number
    type?: OscillatorType
  },
): void {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gainNode.gain.setValueAtTime(0.0001, startAt)
  gainNode.gain.exponentialRampToValueAtTime(gain, startAt + 0.02)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration + 0.02)
}

/** Correct: soft ascending two-tone “ding-dong”. */
export async function playCorrectFeedback(): Promise<void> {
  const ctx = getContext()
  if (!ctx || !(await resumeIfNeeded(ctx))) return
  const t0 = ctx.currentTime
  playTone(ctx, { frequency: 523.25, startAt: t0, duration: 0.12, gain: 0.07 }) // C5
  playTone(ctx, { frequency: 659.25, startAt: t0 + 0.11, duration: 0.16, gain: 0.07 }) // E5
}

/** Wrong: lower single tone. */
export async function playWrongFeedback(): Promise<void> {
  const ctx = getContext()
  if (!ctx || !(await resumeIfNeeded(ctx))) return
  const t0 = ctx.currentTime
  playTone(ctx, {
    frequency: 220,
    startAt: t0,
    duration: 0.28,
    gain: 0.09,
    type: 'triangle',
  }) // A3
}
