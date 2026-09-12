#!/usr/bin/env node
/**
 * Post-build internal link checker.
 *
 * Links pointing at lessons/domains that are planned but not translated yet are
 * reported as "pending" (the sidebar and roadmap grow milestone by milestone),
 * everything else that is missing counts as broken and fails the run.
 *
 * Usage: node tools/check-links.mjs [--base /CCAR-F]
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const baseIndex = process.argv.indexOf('--base');
const base = baseIndex === -1 ? '/CCAR-F' : process.argv[baseIndex + 1];

/** Planned slugs from src/lib/lessons.ts — not yet built, so not failures. */
const lessonsSource = await readFile(join(root, 'src/lib/lessons.ts'), 'utf8');
const domainsSource = await readFile(join(root, 'src/lib/domains.ts'), 'utf8');
const plannedSlugs = new Set(
	[...lessonsSource.matchAll(/slug: '([^']+)'/g)].map((match) => match[1]),
);
const plannedDomains = new Set(
	[...domainsSource.matchAll(/slug: '([^']+)'/g)].map((match) => match[1]),
);

async function* walk(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else yield path;
	}
}

function exists(path) {
	try {
		return statSync(path).isFile() || statSync(path).isDirectory();
	} catch {
		return false;
	}
}

function distTarget(pathname) {
	const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.slice(1);
	if (rest === '') return join(dist, 'index.html');
	if (rest.endsWith('/')) return join(dist, rest, 'index.html');
	return join(dist, rest);
}

/** Is this a lesson/domain page that the roadmap says we will translate later? */
function isPlanned(pathname) {
	const rest = (pathname.startsWith(base) ? pathname.slice(base.length) : pathname.slice(1)).replace(
		/^\/+/,
		'',
	);
	const domainOnly = rest.match(/^learn\/(\d-[a-z-]+)\/?$/);
	if (domainOnly) return plannedDomains.has(domainOnly[1]);
	const match = rest.match(/^learn\/(\d-[a-z-]+)\/([a-z0-9-]+)\/?$/);
	if (!match) return false;
	const [, domainSlug, lessonSlug] = match;
	return plannedSlugs.has(lessonSlug) && plannedDomains.has(domainSlug);
}

const broken = [];
const pending = [];
let files = 0;
let links = 0;

for await (const file of walk(dist)) {
	if (!file.endsWith('.html')) continue;
	files += 1;
	const html = await readFile(file, 'utf8');
	for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
		const href = match[1];
		if (!href.startsWith('/') || href.startsWith('//')) continue;
		links += 1;
		// Astro does not add the site base to links written in Markdown/MDX or in Starlight
		// hero actions, so a root-relative link that skips the base only resolves when the
		// site is served from the domain root. Treat those as broken rather than silently
		// matching a file that happens to exist at the dist root.
		if (!href.startsWith(base)) {
			broken.push(
				`${relative(dist, file)} → ${href} (missing the ${base} base — use siteUrl() from src/lib/urls.ts)`,
			);
			continue;
		}
		const target = distTarget(href);
		if (exists(target) || exists(join(target, 'index.html'))) continue;
		if (isPlanned(href)) pending.push(`${relative(dist, file)} → ${href}`);
		else broken.push(`${relative(dist, file)} → ${href}`);
	}
}

const unique = (list) => [...new Set(list)];
const verbose = process.argv.includes('--verbose');
console.log(
	`${files} HTML file(s), ${links} internal link(s) checked · ${unique(pending).length} pending (not translated yet) · ${unique(broken).length} broken`,
);
if (verbose) for (const entry of unique(pending)) console.log(`  pending: ${entry}`);
for (const entry of unique(broken)) console.log(`  broken:  ${entry}`);
if (broken.length > 0) process.exitCode = 1;
