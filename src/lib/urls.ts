/** Prefix an internal path with the configured Astro base path. */
const base = import.meta.env.BASE_URL.endsWith('/')
	? import.meta.env.BASE_URL
	: `${import.meta.env.BASE_URL}/`;

export function siteUrl(path: string): string {
	return `${base}${path.replace(/^\/+/, '')}`;
}
