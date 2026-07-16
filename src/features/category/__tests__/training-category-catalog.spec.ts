import { describe, expect, it } from 'vitest'

import {
  buildTrainingCategoryCatalog,
  routePathForCategory,
  trainingCategoryById,
} from '../training-category-catalog'
import { routePathForGameId } from '@/features/games/game-registry'

describe('training-category-catalog', () => {
  it('lists six skill categories', () => {
    const catalog = buildTrainingCategoryCatalog()
    expect(catalog).toHaveLength(6)
    expect(catalog.map((item) => item.id)).toEqual([
      'memory',
      'reaction',
      'math',
      'cognition',
      'language',
      'motor',
    ])
  })

  it('resolves category by id and builds route paths', () => {
    const reaction = trainingCategoryById('reaction')
    expect(reaction?.games).toHaveLength(4)
    expect(routePathForCategory('math')).toBe('/training/math')
  })

  it('maps playable games to existing routes', () => {
    expect(routePathForGameId('math_compare_mental')).toBe('/games/number-compare')
    expect(routePathForGameId('reaction_whack_a_mole')).toBe('/whack-a-mole')
    expect(routePathForGameId('memory_shopping_list')).toBeNull()
  })
})
