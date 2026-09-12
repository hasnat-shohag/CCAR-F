## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Project conventions (CCAR-F Bangla study site)

- Content lives in `src/content/docs/`. Lessons: `src/content/docs/learn/<domain-slug>/<task-slug>.mdx`, slugs mirror the English source site.
- Lesson frontmatter: `title` (Bangla), `titleEn`, `domain` (1-5), `task`, `order`, `sourceUrl`, `updated`, `keywords[]`, `sources[]`. Schema: `src/content.config.ts`.
- Every lesson body ends with `<Attribution sourceUrl={frontmatter.sourceUrl} />` and `<MarkComplete lessonId="<domain>-<task>" />`.
- Keep technical terms in English/Latin script (`stop_reason`, `MCP`, `CLAUDE.md`, `PreToolUse`); never transliterate code identifiers.
- Add new terminology to `src/content/glossary-terms.json` before using it in a lesson; the glossary wins on conflicts.
- Internal links inside `.astro` components must go through `siteUrl()` from `src/lib/urls.ts` (site is served under `/CCAR-F`).
- Diagrams are Mermaid fenced blocks; they render client-side, so no build-time browser is needed.
- Progress state stays in localStorage under `ccarf:v1` (`src/lib/progress.ts`); no backend.
- Before committing: `pnpm check`, `pnpm build`, `pnpm check:links`.
- A domain whose lessons are not translated yet keeps its index page (with "অনুবাদ বাকি" tags) so sidebar links never 404.
