import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  playCorrectFeedback,
  playWrongFeedback,
  resetTapFeedbackSoundForTests,
} from '../tap-feedback-sound'

class FakeOscillator {
  type: OscillatorType = 'sine'
  frequency = { value: 0 }
  connect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

class FakeGain {
  gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  connect = vi.fn()
}

class FakeAudioContext {
  state: AudioContextState = 'running'
  currentTime = 1
  destination = {}
  resume = vi.fn(async () => {
    this.state = 'running'
  })
  createOscillator = vi.fn(() => new FakeOscillator())
  createGain = vi.fn(() => new FakeGain())
}

describe('tap-feedback-sound', () => {
  afterEach(() => {
    resetTapFeedbackSoundForTests()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('plays two ascending tones for a correct tap', async () => {
    const ctx = new FakeAudioContext()
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          return ctx
        }
      },
    )

    await playCorrectFeedback()

    expect(ctx.createOscillator).toHaveBeenCalledTimes(2)
    const first = ctx.createOscillator.mock.results[0]!.value as FakeOscillator
    const second = ctx.createOscillator.mock.results[1]!.value as FakeOscillator
    expect(first.frequency.value).toBeCloseTo(523.25)
    expect(second.frequency.value).toBeCloseTo(659.25)
    expect(first.start).toHaveBeenCalled()
    expect(second.start).toHaveBeenCalled()
  })

  it('plays one lower tone for a wrong tap', async () => {
    const ctx = new FakeAudioContext()
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          return ctx
        }
      },
    )

    await playWrongFeedback()

    expect(ctx.createOscillator).toHaveBeenCalledTimes(1)
    const tone = ctx.createOscillator.mock.results[0]!.value as FakeOscillator
    expect(tone.frequency.value).toBe(220)
    expect(tone.type).toBe('triangle')
    expect(tone.start).toHaveBeenCalled()
  })
})
