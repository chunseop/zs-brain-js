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
  it.each(['en', 'ko'] as const)(
    'contains 360 unique %s articles without reused sentences',
    async (locale) => {
      const library = await getArticleLibrary(locale)
      expect(library.count).toBe(360)
      expect(library.articles).toHaveLength(360)
      expect(new Set(library.articles.map((article) => article.text)).size).toBe(360)
      expect(new Set(library.articles.map((article) => article.id)).size).toBe(360)
      expect(
        library.articles.every(
          (article) => article.charCount === Array.from(article.text).length,
        ),
      ).toBe(true)
      expect(library.articles.every((article) => article.text.trim().length > 0)).toBe(true)

      const sentences = library.articles.flatMap((article) => splitSentences(article.text))
      expect(new Set(sentences).size).toBe(sentences.length)

      expect(library.articles.filter((article) => article.theme === 'calcium')).toHaveLength(4)
      expect(library.articles.filter((article) => article.theme === 'muscle-loss')).toHaveLength(4)
      expect(library.articles.filter((article) => article.theme === 'muscle-training')).toHaveLength(4)
      expect(library.articles.filter((article) => article.theme === 'protein')).toHaveLength(5)
      expect(library.articles.filter((article) => article.theme === 'cardio')).toHaveLength(2)
      expect(library.articles.filter((article) => article.theme === 'life-tips')).toHaveLength(2)
      expect(library.articles.filter((article) => article.theme === 'science')).toHaveLength(32)
      expect(library.articles.filter((article) => article.theme === 'literature')).toHaveLength(32)
      expect(library.articles.filter((article) => article.theme === 'health-knowledge')).toHaveLength(32)
      expect(library.articles.filter((article) => article.theme === 'life-knowledge')).toHaveLength(34)
    },
  )

  it('contains 500 unique zh articles without reused sentences', async () => {
    const library = await getArticleLibrary('zh')
    expect(library.count).toBe(500)
    expect(library.articles).toHaveLength(500)
    expect(new Set(library.articles.map((article) => article.text)).size).toBe(500)
    expect(new Set(library.articles.map((article) => article.id)).size).toBe(500)
    expect(
      library.articles.every(
        (article) => article.charCount === Array.from(article.text).length,
      ),
    ).toBe(true)
    expect(library.articles.every((article) => article.text.trim().length > 0)).toBe(true)

    const sentences = library.articles.flatMap((article) => splitSentences(article.text))
    expect(new Set(sentences).size).toBe(sentences.length)

    expect(library.articles.filter((article) => article.theme === 'calcium')).toHaveLength(4)
    expect(library.articles.filter((article) => article.theme === 'muscle-loss')).toHaveLength(4)
    expect(library.articles.filter((article) => article.theme === 'muscle-training')).toHaveLength(4)
    expect(library.articles.filter((article) => article.theme === 'protein')).toHaveLength(5)
    expect(library.articles.filter((article) => article.theme === 'cardio')).toHaveLength(32)
    expect(library.articles.filter((article) => article.theme === 'aerobic')).toHaveLength(30)
    expect(library.articles.filter((article) => article.theme === 'qr-payment')).toHaveLength(30)
    expect(library.articles.filter((article) => article.theme === 'circulation')).toHaveLength(25)
    expect(library.articles.filter((article) => article.theme === 'life-tips')).toHaveLength(2)
    expect(library.articles.filter((article) => article.theme === 'science')).toHaveLength(32)
    expect(library.articles.filter((article) => article.theme === 'literature')).toHaveLength(32)
    expect(library.articles.filter((article) => article.theme === 'health-knowledge')).toHaveLength(50)
    expect(library.articles.filter((article) => article.theme === 'life-knowledge')).toHaveLength(41)
  })

  it('picks from the requested locale and falls back to Chinese', async () => {
    expect((await pickRandomArticle('en', () => 0)).id).toMatch(/^en-/)
    expect((await pickRandomArticle('ko', () => 0)).id).toMatch(/^ko-/)
    expect((await pickRandomArticle('unknown', () => 0)).id).toMatch(/^zh-/)
    expect((await pickRandomArticle(undefined, () => 0)).id).toMatch(/^zh-/)
  })

  it('includes the selected public-domain excerpt from 匆匆', async () => {
    const library = await getArticleLibrary('zh')
    expect(
      library.articles.some((article) =>
        article.text.startsWith('燕子去了，有再来的时候；杨柳枯了，有再青的时候'),
      ),
    ).toBe(true)
  })
})
