# Senior Health Reading Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six curated senior-health reading passages to each of the Chinese, English, and Korean article libraries.

**Architecture:** Store curated passages in each locale configuration in `generate-articles.mjs`, then append them after the 500 generated passages with computed IDs and character counts. Regenerate all three JSON libraries and verify their metadata and health-topic coverage in the existing article-library test.

**Tech Stack:** Node.js ESM, JSON, TypeScript, Vitest

## Global Constraints

- Each locale receives two calcium, two muscle-loss, and two muscle-training passages.
- Health text must be cautious, readable, and free of diagnosis or treatment claims.
- Existing generated passages remain unchanged; each library grows from 500 to 506.
- Do not add dependencies or commit changes.

---

### Task 1: Add and verify curated multilingual health passages

**Files:**
- Modify: `src/features/games/language/read-article/__tests__/articles.spec.ts`
- Modify: `src/features/games/language/read-article/data/generate-articles.mjs`
- Regenerate: `src/features/games/language/read-article/data/articles.zh.json`
- Regenerate: `src/features/games/language/read-article/data/articles.en.json`
- Regenerate: `src/features/games/language/read-article/data/articles.ko.json`

**Interfaces:**
- Consumes: locale configurations used by `buildArticles(locale, config)`.
- Produces: three article libraries with `count === 506`, six curated entries per locale, unique IDs, and accurate `charCount`.

- [x] **Step 1: Update the article-library test**

Change the expected library size from 500 to 506. Assert that each locale has two entries for each curated theme: `calcium`, `muscle-loss`, and `muscle-training`. Also assert unique IDs and `charCount === Array.from(text).length`.

- [x] **Step 2: Run the focused test and verify failure**

Run:

```bash
npx vitest --run src/features/games/language/read-article/__tests__/articles.spec.ts
```

Expected: FAIL because the current libraries contain 500 entries and no curated themes.

- [x] **Step 3: Add curated passages to the generator**

Add a `curated` array to each locale configuration containing six objects shaped as:

```js
{ theme: 'calcium', text: '...' }
{ theme: 'muscle-loss', text: '...' }
{ theme: 'muscle-training', text: '...' }
```

Update `buildArticles` to append `config.curated` after the first 500 generated passages and assign IDs from 501 onward while computing each passage's Unicode character count.

- [x] **Step 4: Regenerate article libraries**

Run:

```bash
node src/features/games/language/read-article/data/generate-articles.mjs
```

Expected: `zh`, `en`, and `ko` each report 506 unique articles.

- [x] **Step 5: Run focused and project verification**

Run:

```bash
npx vitest --run src/features/games/language/read-article/__tests__/articles.spec.ts
npm run build
```

Expected: tests pass and the production build completes successfully.
