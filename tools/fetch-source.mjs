#!/usr/bin/env node
/**
 * Dev-only helper: snapshot the English source lessons as plain text so they can
 * be translated into Bangla. Output goes to tools/.source/ which is gitignored
 * and never published.
 *
 * Usage:
 *   node tools/fetch-source.mjs                  # fetch every lesson
 *   node tools/fetch-source.mjs 1-1-agentic-loops 2-1-tool-schema-design
 *   node tools/fetch-source.mjs --force          # refetch existing files
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://claudecertificationguide.com';
const LISTING = `${SITE}/llms-full.txt`;
const OUTPUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '.source');

const args = process.argv.slice(2);
const force = args.includes('--force');
const requested = args.filter((arg) => !arg.startsWith('--'));

/** Extract lesson URLs (/learn/<domain>/<lesson>) from the site's content listing. */
async function lessonUrls() {
	const response = await fetch(LISTING);
	if (!response.ok) throw new Error(`listing failed: ${response.status} ${response.statusText}`);
	const listing = await response.text();
	const urls = new Set();
	for (const match of listing.matchAll(/\/learn\/[a-z0-9-]+\/[a-z0-9-]+/g)) {
		urls.add(match[0]);
	}
	return [...urls].sort();
}

/** Crude HTML to text conversion: good enough as translation reference. */
function htmlToText(html) {
	let text = html
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<svg[\s\S]*?<\/svg>/gi, ' [diagram] ')
		.replace(/<\/(h1|h2|h3|h4|p|li|tr|div|section|article)>/gi, '\n')
		.replace(/<li[^>]*>/gi, '- ')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '');
	const entities = { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#39': "'", nbsp: ' ' };
	text = text.replace(/&(#?[a-z0-9]+);/gi, (entity, code) => entities[code] ?? entity);
	return text
		.split('\n')
		.map((line) => line.replace(/\s+/g, ' ').trim())
		.filter(Boolean)
		.join('\n');
}

async function fetchLesson(path) {
	const slug = path.split('/').pop();
	const target = join(OUTPUT_DIR, `${slug}.txt`);
	if (!force && existsSync(target)) {
		console.log(`skip  ${slug} (exists, use --force to refetch)`);
		return;
	}
	const response = await fetch(`${SITE}${path}`);
	if (!response.ok) throw new Error(`${path}: ${response.status} ${response.statusText}`);
	const html = await response.text();
	await writeFile(target, `source: ${SITE}${path}\n\n${htmlToText(html)}\n`, 'utf8');
	console.log(`saved ${slug}`);
}

async function main() {
	await mkdir(OUTPUT_DIR, { recursive: true });
	const all = await lessonUrls();
	const selected = requested.length
		? all.filter((path) => requested.some((slug) => path.endsWith(slug)))
		: all;
	if (selected.length === 0) {
		console.error('no lessons matched');
		process.exitCode = 1;
		return;
	}
	for (const path of selected) {
		await fetchLesson(path);
	}
	console.log(`\n${selected.length} lesson(s) processed into tools/.source/`);
}

await main();
