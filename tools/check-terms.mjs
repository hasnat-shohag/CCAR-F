#!/usr/bin/env node
/**
 * Terminology and content-integrity checker.
 *
 * Four checks, each one covering a failure a human reviewer has actually missed
 * on this site:
 *
 *   1. leaked-ui-key   — an English UI string in the built page: either a
 *                        Starlight i18n key rendered as literal text, or a
 *                        library default. bn-BD is not a locale Starlight ships,
 *                        so there is NO English fallback: a missing key puts its
 *                        own dotted name into the page. Needs `pnpm build` first.
 *   2. banned-variant  — a term variant the policy in src/content/style-terms.json
 *                        says to avoid, found in lesson prose.
 *   3. unknown-term    — a frontmatter keyword that is not in the glossary. The
 *                        glossary is the single source of truth (CONTRIBUTING
 *                        rule 6), and KeywordTable.astro throws on these, so this
 *                        check is the fast version of a build failure.
 *   4. stray-definition— a leftover `bn:`/`tip:` inside a keywords block. The
 *                        frontmatter migration deleted these; `pnpm check` cannot
 *                        see it because astro check does not run zod against
 *                        frontmatter YAML, only `pnpm build` does.
 *
 * Usage: node tools/check-terms.mjs [--verbose]
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const contentDir = join(root, 'src/content/docs');
const verbose = process.argv.includes('--verbose');

/**
 * Every key Starlight ships, frozen from
 * node_modules/@astrojs/starlight/dist/translations/en.js (28 keys).
 * Re-sync this list when Starlight is upgraded: a key added upstream and left
 * untranslated in src/content/i18n/bn-BD.json renders its own name into the page,
 * which is exactly what this check exists to catch, and it cannot catch a key it
 * does not know about.
 */
const STARLIGHT_KEYS = [
	'404.text',
	'aside.caution',
	'aside.danger',
	'aside.note',
	'aside.tip',
	'builtWithStarlight.label',
	'fileTree.directory',
	'heading.anchorLabel',
	'i18n.untranslatedContent',
	'languageSelect.accessibleLabel',
	'menuButton.accessibleLabel',
	'page.draft',
	'page.editLink',
	'page.lastUpdated',
	'page.nextLink',
	'page.previousLink',
	'search.cancelLabel',
	'search.ctrlKey',
	'search.devWarning',
	'search.label',
	'sidebarNav.accessibleLabel',
	'skipLink.label',
	'tableOfContents.onThisPage',
	'tableOfContents.overview',
	'themeSelect.accessibleLabel',
	'themeSelect.auto',
	'themeSelect.dark',
	'themeSelect.light',
];

/**
 * Accepted debt, in the style of check-contrast.mjs. Record a variant here only
 * with a reason; an entry whose variant stops appearing is reported so it gets
 * removed rather than lingering.
 */
const KNOWN_GAPS = new Map([
	// ['আপডেট', 'both idiomatic; হালনাগাদ already ships in bn-BD.json and Attribution.astro'],
]);

/**
 * The other half of check 1. A missing key leaks the key NAME; a key that exists
 * but is forwarded to a library leaks the library's English DEFAULT. Starlight
 * forwards exactly three keys to Expressive Code, so before they were added to
 * bn-BD.json every code block on the site offered "Copy to clipboard". A
 * key-name scan cannot see that, because nothing is missing.
 *
 * These are UI chrome, never prose, so their absence from dist/ is unambiguous.
 * Do not add a bare word here ("Search", "Next"): they occur in script filenames
 * and payloads and would be permanent false positives.
 */
const UI_LITERALS = ['Copy to clipboard', 'Copied!', 'Edit page'];

const policy = JSON.parse(await readFile(join(root, 'src/content/style-terms.json'), 'utf8'));
const glossary = JSON.parse(await readFile(join(root, 'src/content/glossary-terms.json'), 'utf8'));
const glossaryTerms = new Set(glossary.map((entry) => entry.term));

const protectedStrings = new Set(policy.protected ?? []);
const bannedRules = (policy.preferred ?? []).filter((rule) => !protectedStrings.has(rule.avoid));

// The Bengali block, U+0980–U+09FF, built from code points rather than written
// literally: the range endpoints are unassigned characters, and a literal copy
// of either one is easy to mangle without noticing.
const BANGLA = new RegExp(`[${String.fromCharCode(0x0980)}-${String.fromCharCode(0x09ff)}]`);
const isBangla = (char) => char !== undefined && BANGLA.test(char);

async function* walk(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else yield path;
	}
}

const violations = [];
const add = (check, where, message) => violations.push({ check, where, message });

// ---------------------------------------------------------------- check 1

let newestSource = 0;
for await (const file of walk(contentDir)) {
	if (!file.endsWith('.mdx')) continue;
	const mtime = statSync(file).mtimeMs;
	if (mtime > newestSource) newestSource = mtime;
}

if (!existsSync(dist)) {
	add('leaked-ui-key', 'dist/', 'not built — run `pnpm build` first (this check reads dist/)');
} else {
	let newestHtml = 0;
	for await (const file of walk(dist)) {
		if (!file.endsWith('.html')) continue;
		const mtime = statSync(file).mtimeMs;
		if (mtime > newestHtml) newestHtml = mtime;
		let html = await readFile(file, 'utf8');
		// Drop code blocks: a lesson is allowed to document a Starlight key.
		html = html.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code[\s\S]*?<\/code>/g, '');
		for (const key of STARLIGHT_KEYS) {
			if (html.includes(key)) {
				add('leaked-ui-key', relative(root, file), `renders the raw i18n key "${key}" — add it to src/content/i18n/bn-BD.json`);
			}
		}
		for (const literal of UI_LITERALS) {
			if (html.includes(literal)) {
				add('leaked-ui-key', relative(root, file), `renders the English UI string "${literal}" — its i18n key is missing from bn-BD.json`);
			}
		}
	}
	// Scanning a build older than the content means check 1 silently reports on
	// pages that no longer exist. Fail loudly instead of passing on stale output.
	if (newestHtml > 0 && newestSource > newestHtml) {
		add('stale-dist', 'dist/', 'older than src/content/docs — rerun `pnpm build`, then this check');
	}
}

// ------------------------------------------------------- checks 2, 3, 4

for await (const file of walk(contentDir)) {
	if (!file.endsWith('.mdx')) continue;
	const where = relative(root, file);
	const lines = (await readFile(file, 'utf8')).split('\n');

	let inFrontmatter = false;
	let frontmatterSeen = 0;
	let inKeywords = false;
	let fence = null;
	let inMermaid = false;

	lines.forEach((line, index) => {
		const lineNo = index + 1;

		if (/^---\s*$/.test(line) && frontmatterSeen < 2) {
			frontmatterSeen += 1;
			inFrontmatter = frontmatterSeen === 1;
			inKeywords = false;
			return;
		}

		if (inFrontmatter) {
			if (/^keywords:\s*$/.test(line)) {
				inKeywords = true;
				return;
			}
			if (inKeywords) {
				// check 4: the migration deleted these from every lesson.
				if (/^\s+(bn|tip):/.test(line)) {
					add('stray-definition', `${where}:${lineNo}`, `leftover ${line.trim().split(':')[0]}: inside keywords — definitions live in glossary-terms.json`);
				}
				const term = line.match(/^\s+-\s+term:\s*(.+?)\s*$/);
				if (term) {
					const value = term[1].replace(/^['"]|['"]$/g, '');
					// check 3: KeywordTable.astro throws on an unknown term.
					if (!glossaryTerms.has(value)) {
						add('unknown-term', `${where}:${lineNo}`, `"${value}" is not in src/content/glossary-terms.json`);
					}
				}
				if (/^[a-zA-Z]/.test(line)) inKeywords = false;
			}
			// Navigation titles stay Bangla by decision; they are not prose.
			if (/^(title|titleEn):/.test(line)) return;
		} else {
			const marker = line.match(/^\s*(`{3,}|~{3,})/);
			if (marker) {
				if (fence === null) {
					fence = marker[1][0];
					inMermaid = /^\s*`{3,}\s*mermaid\b/.test(line);
				} else if (marker[1][0] === fence) {
					fence = null;
					inMermaid = false;
				}
				return;
			}
			// Mermaid node labels are rendered prose; every other fence is code.
			if (fence !== null && !inMermaid) return;
			if (/^\s*import\s/.test(line)) return;
			if (/^\s*<!--/.test(line)) return;
		}

		// check 2: mask inline code, then match on Bangla-script boundaries.
		for (const segment of line.split(/(`[^`]*`)/)) {
			if (segment.startsWith('`') && segment.endsWith('`') && segment.length > 1) continue;
			for (const rule of bannedRules) {
				let from = 0;
				for (;;) {
					const at = segment.indexOf(rule.avoid, from);
					if (at === -1) break;
					// \b does not work for Bangla; a following Bangla character is
					// usually a legitimate suffix (হিস্ট্রিতে), so only a Bangla
					// character BEFORE the match means we are mid-word.
					if (!isBangla(segment[at - 1])) {
						add('banned-variant', `${where}:${lineNo}`, `"${rule.avoid}" → use "${rule.use}"`);
					}
					from = at + rule.avoid.length;
				}
			}
		}
	});
}

// ------------------------------------------------------------- reporting

const seen = new Set();
const unique = violations.filter((entry) => {
	const key = `${entry.check}|${entry.where}|${entry.message}`;
	if (seen.has(key)) return false;
	seen.add(key);
	return true;
});

const checks = ['leaked-ui-key', 'banned-variant', 'unknown-term', 'stray-definition', 'stale-dist'];
const failed = [];
const gaps = [];
const closures = [];

for (const entry of unique) {
	const recorded = KNOWN_GAPS.get(entry.message);
	if (recorded === undefined) failed.push(entry);
	else gaps.push(entry);
}
if (KNOWN_GAPS.size > 0) {
	const stillSeen = new Set(unique.map((entry) => entry.message));
	for (const key of KNOWN_GAPS.keys()) {
		if (!stillSeen.has(key)) closures.push(key);
	}
}

console.log(
	`terminology check · ${STARLIGHT_KEYS.length} UI keys + ${UI_LITERALS.length} UI strings, ` +
		`${bannedRules.length} banned variants, ${glossaryTerms.size} glossary terms · ${failed.length} violation(s)` +
		(gaps.length ? ` · ${gaps.length} known gap(s)` : ''),
);

// A broken build leaks the same key into all 45 files; cap the listing so the
// report stays readable and `--verbose` is the way to see every occurrence.
const perCheckLimit = verbose ? Infinity : 10;

for (const name of checks) {
	const entries = failed.filter((entry) => entry.check === name);
	if (entries.length === 0) continue;
	console.log(`\n${name} (${entries.length}):`);
	for (const entry of entries.slice(0, perCheckLimit)) {
		console.log(`  ${entry.where}\n    ${entry.message}`);
	}
	if (entries.length > perCheckLimit) {
		console.log(`  …and ${entries.length - perCheckLimit} more (rerun with --verbose)`);
	}
}
for (const entry of gaps) console.log(`  known gap: ${entry.where}  ${entry.message}`);
for (const key of closures) console.log(`  ${key} no longer appears — remove it from KNOWN_GAPS`);

if (failed.length > 0 || closures.length > 0) process.exitCode = 1;
