import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const lessonFrontmatter = z.object({
  titleEn: z.string().optional(),
  domain: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  task: z.string().optional(),
  order: z.number().optional(),
  // Terms only. The definition shown in a lesson's keyword table comes from
  // `glossary-terms.json` (the single source of truth, CONTRIBUTING rule 6), so
  // a lesson cannot drift from it. `strictObject` rather than `object`: zod v4's
  // `z.object` silently strips unknown keys, which would let a leftover `bn:`
  // validate cleanly and vanish with no error at any gate.
  keywords: z.array(z.strictObject({ term: z.string() })).optional(),
  sources: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  sourceUrl: z.string().optional(),
  updated: z.union([z.string(), z.date()]).optional(),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: lessonFrontmatter }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
