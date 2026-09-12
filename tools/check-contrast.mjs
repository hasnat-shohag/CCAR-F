#!/usr/bin/env node
/**
 * Post-build contrast guard.
 *
 * The domain accents are the risk: they are chosen for colour identity, and a shade
 * that looks fine on a swatch can land well under 4.5:1 once it is text on the page
 * background. That is how the term columns shipped at 3.19:1 on the amber domain and
 * how the sidebar's current entry ended up accent-on-accent and invisible.
 *
 * This reads *computed* colours from the built site in a headless browser rather than
 * re-deriving Starlight's cascade from the stylesheet, so a token change is measured
 * exactly as a reader would see it.
 *
 * Usage:
 *   node tools/check-contrast.mjs [--base /CCAR-F] [--verbose] [--allow-missing-browser]
 *
 * Exits 1 when a target falls below its floor, or below a recorded known-gap value.
 * A browser is required; GitHub's ubuntu runners ship Chrome, and `CHROME_PATH`
 * overrides discovery. `--allow-missing-browser` degrades to a skip for machines
 * without one, and is deliberately not how CI runs it.
 */

import { spawn, spawnSync } from 'node:child_process';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const args = process.argv.slice(2);
const argValue = (name, fallback) => {
	const index = args.indexOf(name);
	return index === -1 ? fallback : args[index + 1];
};
const base = argValue('--base', '/CCAR-F');
const verbose = args.includes('--verbose');
const allowMissingBrowser = args.includes('--allow-missing-browser');

if (!existsSync(dist)) {
	console.error('dist/ not found — run `pnpm build` before `pnpm check:contrast`.');
	process.exit(1);
}

/**
 * One page per domain, plus the unaccented pages, so every domain shade is measured.
 * `domain` mirrors the frontmatter-driven `data-domain` and keys the known-gap table.
 */
const PAGES = [
	{ path: 'learn/1-agentic-architecture/1-1-agentic-loops', domain: 1 },
	{ path: 'quick-reference/domain-2', domain: 2 },
	{ path: 'learn/3-claude-code-config/3-2-slash-commands-skills', domain: 3 },
	{ path: 'quick-reference/domain-4', domain: 4 },
	{ path: 'learn/5-context-management/5-1-context-window-management', domain: 5 },
	{ path: 'glossary', domain: 'none' },
	{ path: 'exam-guide', domain: 'none' },
];

/**
 * `pseudo` measures a generated marker; its floor is the 3:1 graphics bar, not text's 4.5:1.
 * `focus` focuses the element first, which is how the skip link's colours exist at all.
 *
 * `content-link`, `site-title` and `skip-link` all resolve `--sl-color-text-accent`, the token
 * the light theme points at the high-contrast accent shade. That is deliberate: a regression
 * in that one line shows up as failures on all three rather than passing unnoticed.
 */
const TARGETS = [
	{ id: 'term', label: 'term column', selector: '.keyword-term', floor: 4.5 },
	{ id: 'table-code', label: 'table inline code', selector: '.ref-table code', floor: 4.5 },
	{ id: 'prose-code', label: 'prose inline code', selector: '.sl-markdown-content p code', floor: 4.5 },
	{ id: 'content-link', label: 'content link', selector: '.sl-markdown-content p a', floor: 4.5 },
	{ id: 'site-title', label: 'nav site title', selector: '.site-title', floor: 4.5 },
	{ id: 'skip-link', label: 'focused skip link', selector: '.sl-skip-link', floor: 4.5, focus: true },
	{ id: 'sidebar-current', label: 'sidebar current entry', selector: '.sidebar-content a[aria-current=page]', floor: 4.5 },
	{
		id: 'sidebar-tick',
		label: 'sidebar completed tick',
		selector: '.sidebar-content a[data-lesson-id].is-complete:not([aria-current])',
		pseudo: '::after',
		floor: 3,
	},
];

/**
 * Pre-existing debt, recorded so the guard ships green and still catches a drop.
 * Key: `<target>:<domain>:<theme>`.
 *
 * Empty on purpose: the light-theme accent gaps this shipped with (content links on the
 * amber and teal domains, 3.19:1 and 3.74:1) are fixed at the token, so the guard now
 * demands the full 4.5:1 there. Add an entry only for debt you cannot fix yet, and delete
 * it once the value reaches the floor — the run prints a reminder when it does.
 */
const KNOWN_GAPS = new Map();

/** Lessons seeded into localStorage so the completed-tick target has something to measure. */
const SEEDED_LESSONS = ['1-1', '3-2', '5-1'];

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
	'.png': 'image/png',
	'.xml': 'application/xml; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
};

const contrastFn = `
	const lum = (color) => {
		const parts = (color.match(/[\\d.]+/g) || []).map(Number);
		const [r, g, b] = parts.slice(0, 3).map((v) => {
			const s = v / 255;
			return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const alphaOf = (color) => {
		const parts = (color.match(/[\\d.]+/g) || []).map(Number);
		return parts.length > 3 ? parts[3] : 1;
	};
	const effectiveBg = (el) => {
		let node = el;
		while (node) {
			const bg = getComputedStyle(node).backgroundColor;
			if (bg && bg !== 'transparent' && alphaOf(bg) > 0.5) return bg;
			node = node.parentElement;
		}
		return 'rgb(255, 255, 255)';
	};
	const ratioOf = (color, bg) => {
		const a = lum(color);
		const b = lum(bg);
		return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
	};
`;

const measureExpression = (theme) => `(() => {
	const root = document.documentElement;
	root.dataset.theme = '${theme}';
${contrastFn}
	const targets = ${JSON.stringify(TARGETS)};
	return targets.map((target) => {
		const el = document.querySelector(target.selector);
		if (!el) return { id: target.id, missing: true };
		if (target.focus) el.focus();
		const color = getComputedStyle(el, target.pseudo ?? null).color;
		const bg = effectiveBg(el);
		return { id: target.id, color, bg, ratio: ratioOf(color, bg) };
	});
})()`;

async function freePort() {
	return new Promise((accept, reject) => {
		const probe = createNetServer();
		probe.once('error', reject);
		probe.listen(0, '127.0.0.1', () => {
			const { port } = probe.address();
			probe.close(() => accept(port));
		});
	});
}

/** Serve dist/ under the configured base, so the built absolute asset paths resolve. */
function serveDist() {
	return createHttpServer(async (request, response) => {
		try {
			const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
			if (!pathname.startsWith(base)) {
				response.writeHead(404).end('outside base');
				return;
			}
			let relative = pathname.slice(base.length);
			if (relative === '' || relative.endsWith('/')) relative += 'index.html';
			const target = join(dist, normalize(relative));
			if (!target.startsWith(dist)) {
				response.writeHead(403).end('forbidden');
				return;
			}
			const body = await readFile(target);
			response.writeHead(200, { 'content-type': MIME[extname(target)] ?? 'application/octet-stream' });
			response.end(body);
		} catch {
			response.writeHead(404).end('not found');
		}
	});
}

function findChrome() {
	const candidates = [
		process.env.CHROME_PATH,
		'google-chrome',
		'google-chrome-stable',
		'chromium',
		'chromium-browser',
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/Applications/Chromium.app/Contents/MacOS/Chromium',
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
	].filter(Boolean);

	for (const candidate of candidates) {
		const probe = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
		if (!probe.error && probe.status === 0) return candidate;
	}
	return null;
}

async function main() {
	const chromePath = findChrome();
	if (!chromePath) {
		const notice = 'no Chrome found — set CHROME_PATH to run the contrast check';
		if (allowMissingBrowser) {
			console.log(`contrast check skipped: ${notice}`);
			return;
		}
		throw new Error(notice);
	}

	const server = serveDist();
	await new Promise((accept, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', accept);
	});
	const origin = `http://127.0.0.1:${server.address().port}${base}/`;

	const debugPort = await freePort();
	const profile = await mkdtemp(join(tmpdir(), 'ccarf-contrast-'));
	const chrome = spawn(
		chromePath,
		[
			'--headless=new',
			'--no-sandbox',
			'--disable-gpu',
			'--disable-dev-shm-usage',
			'--hide-scrollbars',
			`--remote-debugging-port=${debugPort}`,
			`--user-data-dir=${profile}`,
			'about:blank',
		],
		{ stdio: 'ignore' },
	);

	let ws;
	const cleanup = async () => {
		try {
			ws?.close();
		} catch {
			/* already closed */
		}
		// Chrome keeps writing into its profile for a moment after SIGTERM; removing the
		// directory before it exits throws ENOTEMPTY and masks the check's own result.
		if (chrome.exitCode === null) {
			const exited = new Promise((accept) => chrome.once('exit', accept));
			chrome.kill();
			await Promise.race([exited, sleep(5000)]);
		}
		server.close();
		await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
	};

	try {
		const endpoint = await debugEndpoint(debugPort);
		ws = new WebSocket(endpoint);
		await new Promise((accept) => ws.addEventListener('open', accept, { once: true }));

		let nextId = 0;
		const pending = new Map();
		ws.addEventListener('message', (event) => {
			const message = JSON.parse(event.data);
			const settle = pending.get(message.id);
			if (settle) {
				pending.delete(message.id);
				settle(message);
			}
		});
		const send = (method, params = {}, sessionId) => {
			const id = (nextId += 1);
			ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
			return new Promise((accept) => pending.set(id, accept));
		};

		const { result: target } = await send('Target.createTarget', { url: 'about:blank' });
		const { result: attached } = await send('Target.attachToTarget', {
			targetId: target.targetId,
			flatten: true,
		});
		const session = attached.sessionId;
		await send('Page.enable', {}, session);
		await send('Runtime.enable', {}, session);
		await send(
			'Emulation.setDeviceMetricsOverride',
			{ width: 1280, height: 900, deviceScaleFactor: 1, mobile: false },
			session,
		);

		const evaluate = async (expression) => {
			const { result } = await send('Runtime.evaluate', { expression, returnByValue: true }, session);
			return result?.result?.value;
		};

		const openPage = async (path) => {
			await send('Page.navigate', { url: `${origin}${path}/` }, session);
			for (let attempt = 0; attempt < 40; attempt += 1) {
				await sleep(150);
				if (await evaluate(`document.readyState === 'complete'`)) return;
			}
			throw new Error(`page did not finish loading: ${path}`);
		};

		// Seed progress once; the sidebar tick renders from localStorage at load time.
		await openPage(PAGES[0].path);
		const lessons = Object.fromEntries(SEEDED_LESSONS.map((id) => [id, { completed: true, at: '2026-01-01' }]));
		await evaluate(`localStorage.setItem('ccarf:v1', ${JSON.stringify(JSON.stringify({ version: 1, lessons }))})`);

		const results = [];
		for (const page of PAGES) {
			await openPage(page.path);
			for (const theme of ['light', 'dark']) {
				const measured = await evaluate(measureExpression(theme));
				if (!measured) throw new Error(`measurement returned nothing on ${page.path} (${theme})`);
				for (const entry of measured) {
					results.push({ ...entry, page: page.path, domain: page.domain, theme });
				}
			}
		}

		report(results);
	} finally {
		await cleanup();
	}
}

async function debugEndpoint(port) {
	for (let attempt = 0; attempt < 60; attempt += 1) {
		try {
			const response = await fetch(`http://127.0.0.1:${port}/json/version`);
			if (response.ok) return (await response.json()).webSocketDebuggerUrl;
		} catch {
			/* browser not up yet */
		}
		await sleep(200);
	}
	throw new Error('Chrome did not expose its debugging port');
}

function report(results) {
	const failures = [];
	const closures = [];

	console.log(`contrast check · ${PAGES.length} page(s) × 2 themes · ${base}\n`);

	for (const target of TARGETS) {
		const rows = results.filter((entry) => entry.id === target.id && !entry.missing);
		if (rows.length === 0) {
			failures.push(`${target.label}: no element matched \`${target.selector}\` on any sampled page`);
			console.log(`? ${target.label.padEnd(22)} not measured — selector matched nothing`);
			continue;
		}

		const worst = rows.reduce((min, entry) => (entry.ratio < min.ratio ? entry : min));
		const gaps = [];
		const missed = [];
		for (const entry of rows) {
			const key = `${target.id}:${entry.domain}:${entry.theme}`;
			const recorded = KNOWN_GAPS.get(key);
			const where = `${entry.page} (${entry.theme}, D${entry.domain})`;
			if (recorded === undefined) {
				if (entry.ratio < target.floor) {
					missed.push(`${target.label} ${entry.ratio}:1 on ${where} — needs ${target.floor}:1`);
				}
				continue;
			}
			if (entry.ratio >= target.floor) {
				closures.push(`${key} now ${entry.ratio}:1 — remove it from KNOWN_GAPS`);
			} else if (entry.ratio < recorded - 0.05) {
				missed.push(`${target.label} fell to ${entry.ratio}:1 on ${where} — was ${recorded}:1`);
			} else {
				gaps.push(`${entry.ratio}:1 on ${where}`);
			}
		}
		failures.push(...missed);

		const status = missed.length > 0 ? '✗' : gaps.length > 0 ? '!' : '✓';
		console.log(
			`${status} ${target.label.padEnd(22)} worst ${String(worst.ratio).padStart(5)}:1  (floor ${target.floor}:1)  ${worst.page} · ${worst.theme} · D${worst.domain}`,
		);
		for (const gap of gaps) console.log(`    known gap: ${gap}`);
		if (verbose) {
			for (const entry of rows) {
				console.log(`    ${entry.ratio.toFixed(2).padStart(6)}:1  ${entry.theme.padEnd(5)} D${entry.domain}  ${entry.page}  (${entry.color} on ${entry.bg})`);
			}
		}
	}

	console.log('');
	for (const closure of closures) console.log(`note: ${closure}`);
	if (closures.length > 0) console.log('');

	if (failures.length > 0) {
		for (const failure of failures) console.error(`contrast: ${failure}`);
		console.error(`\n${failures.length} contrast failure(s).`);
		process.exitCode = 1;
		return;
	}

	console.log(
		KNOWN_GAPS.size === 0
			? 'No contrast regressions. No recorded known gaps.'
			: `No contrast regressions. ${KNOWN_GAPS.size} recorded known gap(s).`,
	);
}

await main();
