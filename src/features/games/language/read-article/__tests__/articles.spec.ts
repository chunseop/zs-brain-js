import { describe, expect, it } from 'vitest'

import {
  getArticleLibrary,
  pickRandomArticle,
} from '../data/articles'

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[。．.!?？！])\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
}

describe('localized article libraries', () => {
  it.each(['zh', 'en', 'ko'] as const)(
    'contains 104 unique %s articles without reused sentences',
    async (locale) => {
      const library = await getArticleLibrary(locale)
      expect(library.count).toBe(104)
      expect(library.articles).toHaveLength(104)
      expect(new Set(library.articles.map((article) => article.text)).size).toBe(104)
      expect(new Set(library.articles.map((article) => article.id)).size).toBe(104)
      expect(
        library.articles.every(
          (article) => article.charCount === Array.from(article.text).length,
        ),
      ).toBe(true)
      if (locale === 'zh') {
        expect(
          library.articles.every(
            (article) => article.charCount >= 90 && article.charCount <= 120,
          ),
        ).toBe(true)
      }

      const sentences = library.articles.flatMap((article) => splitSentences(article.text))
      expect(new Set(sentences).size).toBe(sentences.length)

      expect(library.articles.filter((article) => article.theme === 'calcium')).toHaveLength(4)
      expect(library.articles.filter((article) => article.theme === 'muscle-loss')).toHaveLength(4)
      expect(library.articles.filter((article) => article.theme === 'muscle-training')).toHaveLength(4)
      expect(library.articles.filter((article) => article.theme === 'protein')).toHaveLength(5)
      expect(library.articles.filter((article) => article.theme === 'cardio')).toHaveLength(2)
      expect(library.articles.filter((article) => article.theme === 'life-knowledge')).toHaveLength(2)
      expect(library.articles.filter((article) => article.theme === 'life-tips')).toHaveLength(2)
    },
  )

  it('picks from the requested locale and falls back to Chinese', async () => {
    expect((await pickRandomArticle('en', () => 0)).id).toMatch(/^en-/)
    expect((await pickRandomArticle('ko', () => 0)).id).toMatch(/^ko-/)
    expect((await pickRandomArticle('unknown', () => 0)).id).toMatch(/^zh-/)
    expect((await pickRandomArticle(undefined, () => 0)).id).toMatch(/^zh-/)
  })
})
