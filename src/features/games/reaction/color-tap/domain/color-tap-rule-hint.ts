/** Consecutive correct taps required before hiding the mid-session rule hint. */
export const RULE_SWITCH_HINT_STREAK = 3

export interface RuleHintState {
  visible: boolean
  correctStreak: number
  /** How many consecutive correct taps are required to hide the hint. */
  requiredStreak: number
}

export function resetRuleHintForSwitch(
  requiredStreak: number = RULE_SWITCH_HINT_STREAK,
): RuleHintState {
  return {
    visible: true,
    correctStreak: 0,
    requiredStreak,
  }
}

/** Session start uses the same three-tap streak as later rule switches. */
export function resetRuleHintForSessionStart(): RuleHintState {
  return resetRuleHintForSwitch()
}

export function nextRuleHintAfterTap(state: RuleHintState, correct: boolean): RuleHintState {
  if (!state.visible) return state

  if (!correct) {
    return { ...state, correctStreak: 0 }
  }

  const correctStreak = state.correctStreak + 1
  return {
    ...state,
    correctStreak,
    visible: correctStreak < state.requiredStreak,
  }
}
