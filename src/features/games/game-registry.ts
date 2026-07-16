import { RoutePaths } from '@/app/router/route-names'

export interface GameDefinition {
  id: string
  titleKey: string
  /** When null, the game is considered "coming soon". */
  routePath: string | null
  enabled?: boolean
}

const gameById: Record<string, GameDefinition> = {
  memory_position_flip_board: {
    id: 'memory_position_flip_board',
    titleKey: 'categoryMemoryGamePositionFlipBoard',
    routePath: RoutePaths.positionFlipBoard,
  },
  memory_shopping_list: {
    id: 'memory_shopping_list',
    titleKey: 'categoryMemoryGameShoppingList',
    routePath: null,
  },
  reaction_whack_a_mole: {
    id: 'reaction_whack_a_mole',
    titleKey: 'categoryReactionGameWhackAMole',
    routePath: RoutePaths.whackAMole,
  },
  reaction_t_rex_runner: {
    id: 'reaction_t_rex_runner',
    titleKey: 'categoryReactionGameTRexRunner',
    routePath: RoutePaths.tRexRunner,
  },
  reaction_red_green_tap: {
    id: 'reaction_red_green_tap',
    titleKey: 'categoryReactionGameColorTap',
    routePath: RoutePaths.colorTap,
  },
  reaction_arrow_tap: {
    id: 'reaction_arrow_tap',
    titleKey: 'categoryReactionGameArrowTap',
    routePath: null,
  },
  math_compare_mental: {
    id: 'math_compare_mental',
    titleKey: 'categoryMathGameNumberCompare',
    routePath: RoutePaths.numberCompare,
  },
  cognition_rotate_tap: {
    id: 'cognition_rotate_tap',
    titleKey: 'categoryCognitionGameRotateTap',
    routePath: null,
  },
  cognition_puzzle: {
    id: 'cognition_puzzle',
    titleKey: 'categoryCognitionGamePuzzle',
    routePath: null,
  },
  cognition_face_dog_memory: {
    id: 'cognition_face_dog_memory',
    titleKey: 'categoryCognitionGameFaceDogBreedMemory',
    routePath: null,
  },
  language_idiom_quiz: {
    id: 'language_idiom_quiz',
    titleKey: 'categoryLanguageGameIdiomQuiz',
    routePath: null,
  },
  language_sentence_building: {
    id: 'language_sentence_building',
    titleKey: 'categoryLanguageGameSentenceBuilding',
    routePath: null,
  },
  motor_phone_balance: {
    id: 'motor_phone_balance',
    titleKey: 'categoryMotorGamePhoneBalance',
    routePath: null,
  },
}

export function gameByGameId(gameId: string): GameDefinition | undefined {
  return gameById[gameId]
}

export function titleKeyForGameId(gameId: string): string | undefined {
  return gameById[gameId]?.titleKey
}

export function routePathForGameId(gameId: string): string | null {
  return gameById[gameId]?.routePath ?? null
}
