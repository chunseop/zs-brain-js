import { describe, expect, it } from 'vitest'

import {
  RULE_SWITCH_HINT_STREAK,
  nextRuleHintAfterTap,
  resetRuleHintForSessionStart,
  resetRuleHintForSwitch,
} from '../domain/color-tap-rule-hint'

describe('color-tap rule hint streak', () => {
  it('keeps showing the first rule until 3 consecutive correct taps', () => {
    let state = resetRuleHintForSessionStart()

    state = nextRuleHintAfterTap(state, true)
    expect(state.visible).toBe(true)
    state = nextRuleHintAfterTap(state, true)
    expect(state.visible).toBe(true)
    state = nextRuleHintAfterTap(state, true)

    expect(state.visible).toBe(false)
    expect(state.correctStreak).toBe(RULE_SWITCH_HINT_STREAK)
  })

  it('keeps showing after a rule switch until 3 consecutive correct taps', () => {
    let state = resetRuleHintForSwitch()
    expect(state.visible).toBe(true)
    expect(state.correctStreak).toBe(0)

    state = nextRuleHintAfterTap(state, true)
    expect(state.visible).toBe(true)
    expect(state.correctStreak).toBe(1)

    state = nextRuleHintAfterTap(state, true)
    expect(state.visible).toBe(true)
    expect(state.correctStreak).toBe(2)

    state = nextRuleHintAfterTap(state, true)
    expect(state.visible).toBe(false)
    expect(state.correctStreak).toBe(RULE_SWITCH_HINT_STREAK)
  })

  it('resets the streak on a wrong tap while the hint is visible', () => {
    let state = resetRuleHintForSwitch()
    state = nextRuleHintAfterTap(state, true)
    state = nextRuleHintAfterTap(state, true)
    expect(state.correctStreak).toBe(2)

    state = nextRuleHintAfterTap(state, false)
    expect(state.visible).toBe(true)
    expect(state.correctStreak).toBe(0)

    state = nextRuleHintAfterTap(state, true)
    expect(state.visible).toBe(true)
    expect(state.correctStreak).toBe(1)
  })

  it('ignores taps once the hint is already hidden', () => {
    let state = resetRuleHintForSwitch()
    state = nextRuleHintAfterTap(state, true)
    state = nextRuleHintAfterTap(state, true)
    state = nextRuleHintAfterTap(state, true)
    expect(state.visible).toBe(false)

    const afterWrong = nextRuleHintAfterTap(state, false)
    expect(afterWrong.visible).toBe(false)
    expect(afterWrong.correctStreak).toBe(state.correctStreak)
  })
})
