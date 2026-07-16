/** Stable game id for routing and analytics. */
export interface TrainingCatalogGame {
  id: string
}

/** Display model aligned with biz-plan categories (UI only). */
export interface TrainingCategoryCatalogItem {
  id: string
  titleKey: string
  descriptionKey: string
  icon: string
  games: TrainingCatalogGame[]
}

/** Six skill categories and their games (i18n keys for titles/descriptions). */
export function buildTrainingCategoryCatalog(): TrainingCategoryCatalogItem[] {
  return [
    {
      id: 'memory',
      titleKey: 'categoryMemoryTitle',
      descriptionKey: 'categoryMemoryDesc',
      icon: '🧠',
      games: [
        { id: 'memory_position_flip_board' },
        { id: 'memory_shopping_list' },
      ],
    },
    {
      id: 'reaction',
      titleKey: 'categoryReactionTitle',
      descriptionKey: 'categoryReactionDesc',
      icon: '⚡',
      games: [
        { id: 'reaction_whack_a_mole' },
        { id: 'reaction_t_rex_runner' },
        { id: 'reaction_red_green_tap' },
        { id: 'reaction_arrow_tap' },
      ],
    },
    {
      id: 'math',
      titleKey: 'categoryMathTitle',
      descriptionKey: 'categoryMathDesc',
      icon: '🔢',
      games: [{ id: 'math_compare_mental' }],
    },
    {
      id: 'cognition',
      titleKey: 'categoryCognitionTitle',
      descriptionKey: 'categoryCognitionDesc',
      icon: '🧩',
      games: [
        { id: 'cognition_rotate_tap' },
        { id: 'cognition_puzzle' },
        { id: 'cognition_face_dog_memory' },
      ],
    },
    {
      id: 'language',
      titleKey: 'categoryLanguageTitle',
      descriptionKey: 'categoryLanguageDesc',
      icon: '📖',
      games: [
        { id: 'language_idiom_quiz' },
        { id: 'language_sentence_building' },
      ],
    },
    {
      id: 'motor',
      titleKey: 'categoryMotorTitle',
      descriptionKey: 'categoryMotorDesc',
      icon: '📱',
      games: [{ id: 'motor_phone_balance' }],
    },
  ]
}

export function trainingCategoryById(
  categoryId: string,
): TrainingCategoryCatalogItem | null {
  return buildTrainingCategoryCatalog().find((item) => item.id === categoryId) ?? null
}

export function routePathForCategory(categoryId: string): string {
  return `/training/${categoryId}`
}
