import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const lessonFrontmatter = z.object({
  titleEn: z.string().optional(),
  domain: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  task: z.string().optional(),
  order: z.number().optional(),
  keywords: z
    .array(
      z.object({
        term: z.string(),
        bn: z.string(),
        tip: z.string().optional(),
      }),
    )
    .optional(),
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
