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
- The same applies to `.mdx` content: Astro adds no `base` to links written in Markdown or MDX, so `/learn/` 404s in production. Write `<a href={siteUrl('learn/')}>…</a>` instead. Starlight hero-action links in frontmatter cannot call `siteUrl()` and must spell out the base (`/CCAR-F/learn/`). `pnpm check:links` fails on any root-relative link missing the base.
- Diagrams are Mermaid fenced blocks; they render client-side, so no build-time browser is needed. Mermaid pins each diagram's natural width in an inline `max-width`, and `custom.css` lifts that cap so every flowchart fills the reading column; the inline style is why that rule needs `!important`.
- Progress state stays in localStorage under `ccarf:v1` (`src/lib/progress.ts`); no backend.
- Accent text on a neutral surface must clear WCAG AA (4.5:1); use `--sl-color-accent-high` (dark shade in light theme, light shade in dark) rather than the raw `--sl-color-accent`, which only reads on white for saturated blues. The light theme's `--sl-color-text-accent` is remapped to `--sl-color-accent-high` in `custom.css`, so links, the nav title, the skip link and the TOC marker all inherit the fix — do not reintroduce raw accent on text.
- `pnpm check:contrast` measures computed colours in headless Chrome over `dist/`, so run it after `pnpm build`; it needs a Chrome binary (`CHROME_PATH` overrides discovery, `--allow-missing-browser` skips). `KNOWN_GAPS` in `tools/check-contrast.mjs` records accepted debt — it ships empty, so prefer fixing the token over recording a gap.
- Page grid: Starlight gives the leftover width to the article and the table-of-contents column equally, which lets the TOC column reach 920px on a wide screen while the reading column stays pinned. `custom.css` caps the TOC column at `--sl-sidebar-width` and raises `--sl-content-width` to 48rem at ≥72rem. Keep `--__toc-width` in sync when changing that column; it drives the header's own grid.
- Before committing: `pnpm check`, `pnpm build`, `pnpm check:links`, `pnpm check:contrast`.
- A domain whose lessons are not translated yet keeps its index page (with "অনুবাদ বাকি" tags) so sidebar links never 404.
