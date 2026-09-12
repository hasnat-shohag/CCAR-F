// @ts-check
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { DOMAINS, SOURCE_SITE } from './src/lib/domains.ts';
import { domainLessons, lessonPath } from './src/lib/lessons.ts';

const repoUrl = 'https://github.com/hasnat-shohag/CCAR-F';
const docsRoot = join(dirname(fileURLToPath(import.meta.url)), 'src/content/docs');

/**
 * Only list lessons whose MDX file exists, so the sidebar grows as translation progresses.
 *
 * @param {string} slug
 */
const hasLesson = (slug) => existsSync(join(docsRoot, `${slug}.mdx`));

/** Short domain names for the revision-sheet labels, so the sidebar stays scannable. */
const sheetLabels = [
	'এজেন্টিক আর্কিটেকচার',
	'টুল ডিজাইন ও MCP',
	'Claude Code কনফিগারেশন',
	'প্রম্পট ইঞ্জিনিয়ারিং',
	'কনটেক্সট ও রিলায়েবিলিটি',
];

export default defineConfig({
	site: 'https://hasnat-shohag.github.io',
	base: '/CCAR-F',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'CCAR-F বাংলা গাইড',
			description:
				'Claude Certified Architect (Foundations) পরীক্ষার বাংলা স্টাডি গাইড — ৫টি ডোমেইন, ৩০টি লেসন, কীওয়ার্ড টেবিল, ডায়াগ্রাম ও অগ্রগতি ট্র্যাকিং।',
			locales: {
				root: { label: 'বাংলা', lang: 'bn-BD' },
			},
			defaultLocale: 'root',
			favicon: '/favicon.svg',
			customCss: ['./src/styles/custom.css'],
			components: {
				Head: './src/components/starlight/Head.astro',
			},
			editLink: {
				baseUrl: `${repoUrl}/edit/main/`,
			},
			lastUpdated: true,
			pagination: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			social: [{ icon: 'github', label: 'GitHub', href: repoUrl }],
			sidebar: [
				{
					label: 'শুরু করুন',
					items: [
						{ label: 'সিলেবাস ও পরীক্ষার তথ্য', link: '/learn/' },
						{ label: 'অগ্রগতি ড্যাশবোর্ড', link: '/progress/' },
						{ label: 'কীওয়ার্ড গ্লোসারি', link: '/glossary/' },
						{ label: 'উৎস ও লাইসেন্স', link: '/about/' },
					],
				},
				...DOMAINS.map((domain) => ({
					label: `0${domain.id} — ${domain.labelBn} · ${domain.weight}%`,
					items: [
						{ label: 'ডোমেইন ওভারভিউ', link: `/learn/${domain.slug}/` },
						...domainLessons(domain.id).map((lesson) => ({
							label: `${lesson.id} — ${lesson.titleBn}`,
							slug: lessonPath(lesson),
							attrs: { 'data-lesson-id': lesson.id },
						})).filter((item) => hasLesson(item.slug)),
					],
				})),
				{
					label: 'রিভিশন ও রেফারেন্স',
					items: [
						{ label: 'পরীক্ষা গাইড ও ব্লুপ্রিন্ট', link: '/exam-guide/' },
						{ label: 'দ্রুত রিভিশন শিট', link: '/quick-reference/' },
						...DOMAINS.map((domain) => ({
							label: `D${domain.id} শিট — ${sheetLabels[domain.id - 1]}`,
							link: `/quick-reference/domain-${domain.id}/`,
						})),
					],
				},
			],
			head: [
				{
					tag: 'meta',
					attrs: {
						name: 'description',
						content:
							'CCAR-F পরীক্ষার বাংলা স্টাডি গাইড: ৫টি ডোমেইন, ৩০টি লেসন, কীওয়ার্ড ও অগ্রগতি ট্র্যাকিং।',
					},
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:site_name',
						content: 'CCAR-F বাংলা গাইড',
					},
				},
			],
		}),
	],
	// Source site is credited on every lesson page; kept here for reference in config-level tooling.
	vite: {
		define: {
			__SOURCE_SITE__: JSON.stringify(SOURCE_SITE),
		},
		build: {
			// Mermaid is loaded lazily as its own chunk; the chunk is intentionally large.
			chunkSizeWarningLimit: 1200,
		},
	},
});
