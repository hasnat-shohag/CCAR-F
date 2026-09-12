# CCAR-F বাংলা স্টাডি গাইড

[![Deploy site to GitHub Pages](https://github.com/hasnat-shohag/CCAR-F/actions/workflows/deploy.yml/badge.svg)](https://github.com/hasnat-shohag/CCAR-F/actions/workflows/deploy.yml)
[![Code license: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](./LICENSE)
[![Content license: CC BY-NC-SA 4.0](https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-lightgrey.svg)](./LICENSE-CONTENT)

**Claude Certified Architect (Foundations)** — CCAR-F পরীক্ষার জন্য বাংলা স্টাডি সাইট। ৫টি ডোমেইন, ৩০টি লেসন, ডোমেইনভিত্তিক রিভিশন শিট, পরীক্ষা গাইড, কীওয়ার্ড গ্লোসারি, Mermaid ডায়াগ্রাম আর ব্রাউজারে-সংরক্ষিত অগ্রগতি ট্র্যাকার।

**লাইভ সাইট:** https://hasnat-shohag.github.io/CCAR-F/

## বৈশিষ্ট্য

- **৫টি ডোমেইন, ৩০টি লেসন** — প্রতিটিতে বাংলা ব্যাখ্যা, মূল কীওয়ার্ড টেবিল, ডায়াগ্রাম, পরীক্ষার ফাঁদ, প্র্যাকটিস সিনারিও ও বিল্ড এক্সারসাইজ।
- **প্রযুক্তিগত শব্দ ইংরেজিতেই** — `stop_reason`, `MCP`, `CLAUDE.md`, `PreToolUse`; কোড-আইডেন্টিফায়ার কখনও transliterate করা হয় না, তাই GitHub-এ খুঁজে পাওয়া সহজ।
- **অগ্রগতি ট্র্যাকিং** — সাইডবারে ✓ চিহ্ন আর `/progress/` ড্যাশবোর্ডে ডোমেইনভিত্তিক প্রগ্রেস বার; অবস্থা শুধু `localStorage`-এ (`ccarf:v1`), কোনো বেকএন্ড নেই।
- **রিভিশন ও রেফারেন্স** — `/quick-reference/`-এ প্রতি ডোমেইনের এক-পাতার প্রিন্ট-বান্ধব শিট, `/exam-guide/`-এ পরীক্ষার ফরম্যাট, ৬টি সিনারিও, ওয়েট ও পাসের নিয়ম।
- **বাংলা টাইপোগ্রাফি ও থিম** — Noto Sans Bengali, Inter ও JetBrains Mono; ডোমেইন অনুযায়ী অ্যাকসেন্ট রং (নীল, টিল, অ্যাম্বার, ভায়োলেট, রোজ), ডার্ক/লাইট থিম, WCAG AA কনট্রাস্ট।

## দ্রুত শুরু

Node 22+ ও pnpm 11+ দরকার (`.nvmrc` দেখুন)।

```bash
pnpm install
pnpm dev        # http://localhost:4321/CCAR-F/
```

## স্ক্রিপ্ট

| কমান্ড | কাজ |
| --- | --- |
| `pnpm dev` | ডেভেলপমেন্ট সার্ভার (`/CCAR-F/` বেসে) |
| `pnpm build` | প্রোডাকশন বিল্ড, আউটপুট `dist/` |
| `pnpm preview` | বিল্ড করা সাইট লোকালি সার্ভ করে |
| `pnpm check` | `astro check` — টাইপ ও কনটেন্ট স্কিমা যাচাই |
| `pnpm check:links` | ভেতরের লিংক যাচাই; `dist/` বিল্ডের পর চালান |
| `pnpm check:contrast` | computed রঙের কনট্রাস্ট যাচাই; `dist/` ও হেডলেস Chrome দরকার |
| `pnpm fetch-source` | মূল ইংরেজি পাঠ ডাউনলোড করে অনুবাদের রেফারেন্স বানায় (শুধু ডেভেলপার, আউটপুট `tools/.source/`, gitignored) |

`fetch-source` নির্দিষ্ট লেসনেও চলে — `pnpm fetch-source 1-1-agentic-loops`, আর পুরনো ফাইল আবার নামাতে `--force`।

`check:links` অনূদিত না হওয়া লেসনকে "pending" ধরে (এগুলো ফেল নয়); সত্যিকারের ভাঙা লিংক থাকলে কমান্ড ফেল করে। `--verbose` দিলে পেন্ডিং তালিকাও দেখায়।

`check:contrast` বিল্ড করা `dist/` হেডলেস Chrome-এ খুলে টার্ম-কলাম, টেবিলের কোড, লিংক, নেভ টাইটেল, skip link ও সাইডবারের বর্তমান এন্ট্রির computed রং মাপে — Starlight-এর cascade হাতে মডেল না করে পাঠক যা দেখবে ঠিক সেটাই। Chrome না থাকলে `--allow-missing-browser` দিলে চেকটি স্কিপ হয়, আর `CHROME_PATH` দিয়ে ব্রাউজার পাথ দেওয়া যায়। `KNOWN_GAPS`-এ নথিভুক্ত ঋণ ছাড়া সীমার নিচে নামলে কমান্ড ফেল করে।

## প্রজেক্ট স্ট্রাকচার

```
src/
  content.config.ts          # কনটেন্ট স্কিমা — লেসন ফ্রন্টম্যাটার ভ্যালিডেশন
  content/docs/              # সাইটের সব পাতা (MDX)
    learn/<domain>/          # ডোমেইন ওভারভিউ + লেসন
    quick-reference/         # ডোমেইনভিত্তিক রিভিশন শিট
    glossary.mdx             # গ্লোসারি এক্সপ্লোরার
    progress.mdx             # অগ্রগতি ড্যাশবোর্ড
    exam-guide.mdx           # পরীক্ষার ব্লুপ্রিন্ট ও সিনারিও
    about.mdx                # উৎস ও লাইসেন্স
  content/glossary-terms.json # পরিভাষার একক সূত্র
  content/i18n/bn-BD.json     # Starlight UI স্ট্রিং
  components/                 # content/, progress/, starlight/ কম্পোনেন্ট
  lib/                        # domains, lessons, progress, urls হেল্পার
  styles/custom.css           # থিম টোকেন, গ্রিড ও ডায়াগ্রাম স্টাইল
tools/
  check-links.mjs             # বিল্ড-পরবর্তী ভেতরের লিংক যাচাই
  check-contrast.mjs          # বিল্ড-পরবর্তী কনট্রাস্ট গার্ড (হেডলেস Chrome)
  fetch-source.mjs            # মূল ইংরেজি পাঠের স্ন্যাপশট (ডেভ-অনলি)

## লেসন লেখা ও অনুবাদের নিয়ম

1. ফাইল: `src/content/docs/learn/<domain-slug>/<task-slug>.mdx` — স্লাগ মূল ইংরেজি সাইটের মতোই।
2. ফ্রন্টম্যাটার পূরণ করুন: `title` (বাংলা), `titleEn`, `domain` (১–৫), `task`, `order`, `sourceUrl`, `updated`, `keywords[]`, `sources[]`। স্কিমা `src/content.config.ts`-এ।
3. শিরোনামের ক্রম ধরে রাখুন: এই লেসনে যা জানতে হবে → মূল অংশ → ডায়াগ্রাম (Mermaid) → পরীক্ষার ফাঁদ → প্র্যাকটিস সিনারিও → বিল্ড এক্সারসাইজ → সূত্র।
4. প্রতি লেসনের শেষে অবশ্যই `<Attribution sourceUrl={frontmatter.sourceUrl} />` আর `<MarkComplete lessonId="<domain>-<task>" />`।
5. **শব্দ ইংরেজিতেই রাখুন** — `stop_reason`, `tool_use`, `MCP`, `CLAUDE.md`, `PreToolUse`, `fork_session`, কমান্ড ও কোড transliterate করবেন না।
6. নতুন পরিভাষার এন্ট্রি আগে `src/content/glossary-terms.json`-এ দিন, তারপর লেসনে সেটাই ব্যবহার করুন। একই শব্দ দুইভাবে অনূদিত হলে গ্লোসারির রূপটাই চূড়ান্ত।
7. মেশিন-অনুবাদ হুবহু বসাবেন না — প্রাকৃতিক বাংলা > আক্ষরিক অনুবাদ।
8. যে ডোমেইনের লেসন এখনও অনূদিত হয়নি, তার index পাতা "অনুবাদ বাকি" ট্যাগসহ রাখুন, যাতে সাইডবার লিংক 404 না দেয়।

### ভেতরের লিংক

সাইট `/CCAR-F` বেসে চলে, আর Astro Markdown/MDX-এর লেখা লিংকে `base` যোগ করে না। তাই `/learn/` প্রোডাকশনে 404 দেয়।

- `.astro` কম্পোনেন্টে: `siteUrl('learn/')` (`src/lib/urls.ts`)।
- `.mdx` কনটেন্টে: `<a href={siteUrl('learn/')}>…</a>`।
- Starlight ফ্রন্টম্যাটারের hero-action লিংকে `siteUrl()` কল করা যায় না — বেস স্পষ্ট লিখুন (`/CCAR-F/learn/`)।

`pnpm check:links` বেস ছাড়া যেকোনো root-relative লিংকে ফেল করে, তাই ভুল নীরবে পাস করে না।

### ডিজাইন ও কনট্রাস্ট

- নিউট্রাল সারফেসে অ্যাকসেন্ট টেক্সট WCAG AA (৪.৫:১) পাস করতে হবে — কাঁচা `--sl-color-accent`-এর বদলে `--sl-color-accent-high` ব্যবহার করুন। লাইট থিমে `--sl-color-text-accent` ইতিমধ্যে `--sl-color-accent-high`-এ remap করা, তাই লিংক, নেভ টাইটেল, skip link ও TOC মার্কার সবই ঠিক থাকে; টেক্সটে কাঁচা accent ফিরিয়ে আনবেন না।
- ডায়াগ্রাম Mermaid fenced block; ক্লায়েন্টে রেন্ডার হয়, বিল্ড-টাইম ব্রাউজার লাগে না। Mermaid নিজের প্রস্থ inline `max-width`-এ পিন করে, আর `custom.css` সেই সীমা তুলে দেয় যাতে flowchart পড়ার কলাম ভরে।
- Starlight-এর ডিফল্ট গ্রিডে TOC কলাম চওড়া স্ক্রিনে ৯২০px অবধি প্রসারিত হতে পারে। `custom.css` TOC কলাম `--sl-sidebar-width`-এ সীমিত রাখে আর `--sl-content-width` ৪৮rem-এ তোলে (≥৭২rem)। ওই কলাম বদলালে হেডারের গ্রিড চালানো `--__toc-width`-ও মিলিয়ে নিন।

## PR করার আগে

```bash
pnpm check
pnpm build
pnpm check:links
pnpm check:contrast
```

- [ ] উপরের চারটি কমান্ড পাস করে
- [ ] ভেতরের লিংক অটুট (prev/next, সাইডবার, গ্লোসারি রেফারেন্স)
- [ ] রঙ/থিম বদলালে টেক্সটের কনট্রাস্ট ৪.৫:১-এর উপরে (নিছক গ্রাফিক চিহ্নের জন্য ৩:১)
- [ ] নতুন শব্দ `glossary-terms.json`-এ যোগ করা
- [ ] কমিট মেসেজ পরিষ্কার (`feat: 1.2 অনুবাদ যোগ`, `fix: 1.1 কীওয়ার্ড টেবিল সংশোধন`)

## ডিপ্লয়

`main`-এ পুশ করলেই GitHub Actions সাইট বিল্ড করে GitHub Pages-এ দেয়; Actions থেকে `workflow_dispatch`-ও চালানো যায়। CI ধাপ: install → `pnpm check` → `pnpm build` → `pnpm check:links` → `pnpm check:contrast` → artifact আপলোড → ডিপ্লয়।

- URL: https://hasnat-shohag.github.io/CCAR-F/ — base path `/CCAR-F`; `astro.config.mjs`-এর `base` বদলালে `.github/workflows/deploy.yml`-ও মিলিয়ে নিন।
- একবারের সেটআপ (GitHub UI থেকে): Settings → General → Default branch = **main**, আর Settings → Pages → Source = **GitHub Actions**। Actions-এর `GITHUB_TOKEN` দিয়ে Pages চালু করা যায় না, তাই দ্বিতীয় ধাপটি হাতে করতে হয় — না করলে ডিপ্লয় `Configure Pages` ধাপে থামে।

## অবদান

PR স্বাগত — বিশেষ করে অনুবাদ সংশোধন। বিস্তারিত নিয়ম [CONTRIBUTING.md](./CONTRIBUTING.md)-এ। সংক্ষেপে: পরিবর্তন ছোট রাখুন (প্রতি PR-এ একটি লেসন বা একটি কম্পোনেন্ট), প্রযুক্তিগত শব্দ ইংরেজিতে রাখুন, নতুন শব্দ আগে গ্লোসারিতে যোগ করুন, আর উপরের চারটি কমান্ড পাস করান।

বাগ বা ভুল অনুবাদ পেলে [issue](https://github.com/hasnat-shohag/CCAR-F/issues) খুলুন — পাতা/লেসনের নাম, ভুল বাক্যটি হুবহু, কেন ভুল ও সঠিক কী হওয়া উচিত, এবং মূল ইংরেজি পাতার লিংক (থাকলে) দিন।

কনটেন্ট-মালিক এই অনুবাদ অপসারণ চাইলে issue খুলুন — যুক্তি ছাড়াই যোগ্য পাতাগুলো সরিয়ে নেওয়া হবে।

## লাইসেন্স ও কৃতিত্ব

- কোড: MIT (`LICENSE`)।
- বাংলা কনটেন্ট: CC BY-NC-SA 4.0 (`LICENSE-CONTENT`)। অবদানের মাধ্যমে আপনি এই শর্তে সম্মত হচ্ছেন।
- মূল ইংরেজি স্টাডি গাইড: [claudecertificationguide.com](https://claudecertificationguide.com/learn)।
- পরীক্ষার ব্লুপ্রিন্ট ও প্রযুক্তিগত তথ্য: Anthropic।
