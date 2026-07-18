export type ArticleLocale = 'zh' | 'en' | 'ko'

export interface ReadArticleItem {
  id: string
  theme: string
  charCount: number
  text: string
}

export interface ReadArticleLibrary {
  version: number
  locale: string
  description: string
  count: number
  articles: ReadArticleItem[]
}

function resolveArticleLocale(locale: string | null | undefined): ArticleLocale {
  const normalized = (locale ?? '').toLowerCase()
  if (normalized.startsWith('en')) return 'en'
  if (normalized.startsWith('ko')) return 'ko'
  return 'zh'
}

export async function getArticleLibrary(
  locale: string | null | undefined,
): Promise<ReadArticleLibrary> {
  switch (resolveArticleLocale(locale)) {
    case 'en':
      return (await import('./articles.en.json')).default as ReadArticleLibrary
    case 'ko':
      return (await import('./articles.ko.json')).default as ReadArticleLibrary
    default:
      return (await import('./articles.zh.json')).default as ReadArticleLibrary
  }
}

/** Lazily load one locale and pick an article for the current session. */
export async function pickRandomArticle(
  locale: string | null | undefined,
  random: () => number = Math.random,
): Promise<ReadArticleItem> {
  const list = (await getArticleLibrary(locale)).articles
  const index = Math.floor(random() * list.length)
  return list[index]!
}
