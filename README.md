<div align="center">

# NetaGirifiles

**The public record behind your elected MP.**

A civic-transparency project that republishes information from public Election Commission of India affidavits in a readable, searchable, shareable form.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev)
[![Postgres](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Live site:** [netagirifiles.fun](https://www.netagirifiles.fun) &nbsp;·&nbsp; **About:** [netagirifiles.fun/about](https://www.netagirifiles.fun/about) &nbsp;·&nbsp; **Disclaimer:** [netagirifiles.fun/disclaimer](https://www.netagirifiles.fun/disclaimer)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Data Sources & Attribution](#data-sources--attribution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts & Commands](#scripts--commands)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [SEO & Analytics](#seo--analytics)
- [Accessibility](#accessibility)
- [Testing & Verification](#testing--verification)
- [Project Conventions](#project-conventions)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security](#security)
- [Legal Notice](#legal-notice)
- [Acknowledgments](#acknowledgments)
- [License](#license)
- [Contact](#contact)

---

## About the Project

NetaGirifiles is a non-partisan, non-profit civic-transparency tool. It aggregates public information that candidates themselves declared on sworn affidavit (Form 26) to the Election Commission of India under Section 33A of the Representation of the People Act, 1951, and presents it — unaltered — in a form that is easier for citizens to read, browse, and share.

The site does not investigate, infer, or editorialize beyond what is already in the public record. Every number on every page traces back to a declaration made by the candidate themselves.

## Data Sources & Attribution

- **Primary source:** candidate affidavits submitted to the Election Commission of India.
- **Compilation:** [myneta.info](https://myneta.info), maintained by the Association for Democratic Reforms (ADR) and National Election Watch — a registered non-profit whose archive has been cited by Indian courts, journalists, and election monitors since 2002.
- **Classification:** where pages use the label "serious," that classification follows the public methodology used by ADR / National Election Watch.
- **This project:** only reorganizes and displays the above. No figures are computed or altered beyond aggregation and presentation.

## Features

- **~800 pre-rendered MP profile pages** — each showing the case counts and IPC sections the MP themselves declared, plus percentile comparisons against party / state / national cohorts.
- **Interactive bubble visualization** of declared affidavit data for the Lok Sabha, filterable by party, state, and case category.
- **State-level choropleth map of India**, rendered client-side via D3 + TopoJSON.
- **Dynamic Open Graph images** generated per profile for rich social previews.
- **End-to-end SEO surface** — `sitemap.xml`, `robots.txt`, per-route canonicals, OpenGraph + Twitter metadata, and JSON-LD structured data (`WebSite` + `SearchAction`, `Person`, `BreadcrumbList`).
- **Social sharing** — inline per-profile share row and a global floating action button (WhatsApp, X, Facebook, LinkedIn, copy-link).
- **Privacy-friendly analytics** via Microsoft Clarity. No ads, no data resale.
- **Accessibility first** — keyboard-navigable UI, ARIA live regions on interactive widgets, `prefers-reduced-motion` respected throughout.

## Tech Stack

| Layer        | Technology                                                 |
|--------------|------------------------------------------------------------|
| Web app      | Next.js 16 (App Router), React 19, TypeScript (strict)     |
| Styling      | Tailwind CSS v4 (`@theme` tokens)                          |
| Data fetching| TanStack Query (client), server components (server)        |
| Visuals      | D3.js v7, `topojson-client`                                |
| Validation   | Zod                                                        |
| Scraper      | Go 1.21+, `goquery`, `pgx`, `slog`                         |
| Database     | PostgreSQL 14+ (hosted on Supabase)                        |
| Object store | Supabase Storage (public bucket for short audio clips)     |
| Hosting      | Vercel (web), any Linux box / cron (scraper)               |
| Analytics    | Microsoft Clarity                                          |

## Architecture

```
                 ┌────────────────────────┐
                 │      myneta.info       │   (public ADR archive)
                 └──────────┬─────────────┘
                            │  HTTP (2 req/sec, polite)
                            ▼
                 ┌────────────────────────┐
                 │    Go scraper (CLI)    │   goquery → structs → pgx
                 └──────────┬─────────────┘
                            │  upsert on myneta_id
                            ▼
                 ┌────────────────────────┐
                 │  PostgreSQL (Supabase) │   parties, states,
                 │  + aggregate views     │   politicians, cases, ipc
                 └──────────┬─────────────┘
                            │  pooled pg (server-only)
                            ▼
                 ┌────────────────────────┐
                 │ Next.js App Router     │   SSG ~800 pages,
                 │ (Vercel, node runtime) │   ISR revalidate 24h,
                 └──────────┬─────────────┘   JSON-LD + OG images
                            │
                            ▼
                         Browser
```

## Repository Layout

```
neta-watch/
├── web/                     # Next.js 16 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (routes)/           # /, /lok-sabha, /map, /about, /disclaimer
│   │   │   ├── politician/[id]/    # dynamic profile + opengraph-image
│   │   │   ├── api/v1/             # REST endpoints (GET only, Node runtime)
│   │   │   ├── sitemap.ts          # MetadataRoute.Sitemap
│   │   │   ├── robots.ts           # MetadataRoute.Robots
│   │   │   └── layout.tsx          # global metadata, JSON-LD, analytics
│   │   ├── components/
│   │   │   ├── charts/             # BubbleChart, IndiaMap (D3, client)
│   │   │   ├── layout/             # Header, Footer
│   │   │   ├── politician/         # ProfileHeader, CaseBreakdown, ComparisonStats
│   │   │   └── ui/                 # FilterBar, RankingTable, ShareRow, ShareFab, DialogueBubble
│   │   ├── lib/
│   │   │   ├── db.ts               # pg Pool, server-only
│   │   │   ├── queries/            # typed query functions
│   │   │   ├── share.ts            # share URL builder
│   │   │   └── dialogues.ts        # audio-clip URL helper
│   │   ├── data/                   # static manifests
│   │   └── types/                  # shared interfaces
│   └── public/
│       └── india-states.json       # TopoJSON, bundled (never fetched externally)
│
├── scraper/                 # Go scraper
│   ├── cmd/scraper/                # main.go — CLI entrypoint
│   └── internal/
│       ├── fetcher/                # HTTP client + rate limit (2 req/sec)
│       ├── parser/                 # goquery HTML parsing
│       ├── models/                 # Politician, Case structs
│       └── store/                  # pgx upserts
│
└── db/
    ├── migrations/                 # 0001_init.sql, ...
    └── seed/                       # ipc_sections.sql
```

## Prerequisites

- **Node.js** ≥ 20 and **npm** ≥ 10
- **Go** ≥ 1.21
- **PostgreSQL** ≥ 14 (local) or a Supabase project
- **psql** command-line client
- A Supabase project (optional, for managed Postgres + object storage)

## Getting Started

```bash
git clone https://github.com/0xSamrat/netagiri-files.git
cd netagiri-files
```

### 1. Provision the database

```bash
export SUPABASE_DB_URL="postgresql://user:password@host:5432/dbname"

psql "$SUPABASE_DB_URL" -f db/migrations/0001_init.sql
psql "$SUPABASE_DB_URL" -f db/seed/ipc_sections.sql
```

Apply any additional migrations in `db/migrations/` in filename order.

### 2. Populate data via the scraper

```bash
cd scraper
go build ./...

# Parse without writing (safe validation run)
go run ./cmd/scraper -house=lok_sabha -dry-run

# Full run — please keep concurrency ≤ 5; the fetcher is hard-limited to 2 req/sec
go run ./cmd/scraper -house=lok_sabha -concurrency=5
```

Flags:

| Flag           | Default    | Description                               |
|----------------|------------|-------------------------------------------|
| `-house`       | `lok_sabha`| Which archive to traverse                 |
| `-concurrency` | `5`        | Worker goroutines (rate limit still applies) |
| `-dry-run`     | `false`    | Parse and log without DB writes           |

### 3. Run the web app

```bash
cd ../web
cp .env.local.example .env.local   # fill in values (see below)
npm install
npm run dev                         # http://localhost:3000
```

### 4. (Optional) Configure Supabase Storage

The audio-clip feature reads short `.mp3` files from a public bucket:

1. Create a **public** bucket named `dialogues` in the Supabase dashboard.
2. Upload your `.mp3` files (recommended: 64–96 kbps mono, ~5–15 s, loudness-normalized).
3. Register each file in [web/src/data/dialogues.ts](web/src/data/dialogues.ts).
4. Set `NEXT_PUBLIC_SUPABASE_STORAGE_URL` to the bucket's public URL prefix.

## Environment Variables

Copy [web/.env.local.example](web/.env.local.example) to `web/.env.local` and fill in:

| Variable                              | Scope   | Required | Description |
|---------------------------------------|---------|----------|-------------|
| `SUPABASE_DB_URL`                     | server  | ✅       | Postgres connection string used by [web/src/lib/db.ts](web/src/lib/db.ts) |
| `NEXT_PUBLIC_SUPABASE_STORAGE_URL`    | client  | ✅       | Public prefix of the `dialogues` bucket |
| `NEXT_PUBLIC_SITE_URL`                | client  | optional | Used only in local dev; production share links are pinned in [web/src/lib/share.ts](web/src/lib/share.ts) |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID`      | client  | optional | Enables Microsoft Clarity analytics |

> **Security:** only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. `SUPABASE_DB_URL` must remain server-side. Do not commit `.env.local`.

## Scripts & Commands

From `web/`:

| Command          | Purpose                                                        |
|------------------|----------------------------------------------------------------|
| `npm run dev`    | Start the dev server on `:3000`                                |
| `npm run build`  | Production build; pre-renders all profile pages at build time  |
| `npm run start`  | Serve the production build                                     |
| `npm run lint`   | Run ESLint; must pass before commit                            |

From `scraper/`:

| Command                          | Purpose                              |
|----------------------------------|--------------------------------------|
| `go build ./...`                 | Compile all packages                 |
| `go run ./cmd/scraper -dry-run`  | End-to-end parse without DB writes   |
| `go test ./...`                  | Run unit tests                       |

## Database Schema

Core tables:

| Table           | Purpose                                              |
|-----------------|------------------------------------------------------|
| `parties`       | Party master (name, short name, colour)              |
| `states`        | Indian state / UT master                             |
| `politicians`   | MP records; unique key = `myneta_id`                 |
| `criminal_cases`| One row per case declared on the affidavit          |
| `ipc_sections` | Seeded reference table of IPC section descriptions   |

Materialized / regular views for fast aggregates:

- `politician_summary` — per-MP totals used by profile pages
- `party_stats` — rollups used by the bubble chart
- `state_stats` — rollups used by the map page

Relationships:

```
politicians.party_id      → parties.id
politicians.state_id      → states.id
criminal_cases.politician_id → politicians.id
```

Upserts key on `politicians.myneta_id` (`ON CONFLICT ... DO UPDATE`).

## API Reference

All endpoints live under `/api/v1/` and are **GET-only, read-only, unauthenticated**. They pin `runtime = 'nodejs'` because the `pg` driver is not Edge-compatible. Input is validated with Zod; output projections are explicit (no `SELECT *`).

| Endpoint                 | Description                                       |
|--------------------------|---------------------------------------------------|
| `/api/v1/politicians`    | Paginated, filterable list of MPs                 |
| `/api/v1/politicians/:id`| Single MP with cases and comparison percentiles   |
| `/api/v1/parties`        | Party master list                                 |
| `/api/v1/states`         | State master list                                 |
| `/api/v1/stats`          | Top-level summary counts                          |
| `/api/v1/lok-sabha`      | Data backing the Lok Sabha overview               |
| `/api/v1/map`            | State-level aggregates for the choropleth         |
| `/api/v1/search`         | Name / constituency search                        |
| `/api/v1/ipc-sections`   | IPC section reference data                        |

## Deployment

### Web (Vercel)

1. Import the repo; set the **Root Directory** to `web/`.
2. Add the environment variables from the [Environment Variables](#environment-variables) section.
3. Trigger a deployment. `generateStaticParams` pre-renders every profile page at build time; ISR revalidates every 24 h (`export const revalidate = 86400`).
4. Configure the custom domain and let Vercel provision TLS.

### Scraper

The Go binary is a plain CLI. Run it manually, under `systemd` timers, or as a cron on any Linux host with outbound HTTPS and access to the Postgres URL:

```bash
0 3 * * 0  /usr/local/bin/scraper -house=lok_sabha -concurrency=5 >> /var/log/netagirifiles.log 2>&1
```

## SEO & Analytics

- `sitemap.xml` and `robots.txt` are generated at build time via the Next.js `MetadataRoute` API.
- Canonical URLs are set on every route.
- OpenGraph + Twitter Card metadata is defined globally and overridden per profile.
- JSON-LD: `WebSite` + `SearchAction` on the home page, `Person` + `BreadcrumbList` on each profile.
- Dynamic OG images are generated via `opengraph-image.tsx` routes using the Next.js `ImageResponse` API.
- Microsoft Clarity is loaded via `next/script` with `strategy="afterInteractive"` and disclosed in the public [disclaimer](https://www.netagirifiles.fun/disclaimer).

## Accessibility

- Semantic HTML; headings follow document outline.
- Keyboard focus rings are styled, never removed.
- Interactive widgets use ARIA roles and `aria-live` regions.
- All motion effects respect `prefers-reduced-motion`.
- Colour palette is validated for WCAG AA contrast on the dark theme.

## Testing & Verification

Before opening a PR, verify:

```bash
# Web
cd web
npm run lint
npm run build         # also catches SSR / client-boundary issues

# Scraper
cd ../scraper
go build ./...
go test ./...
go run ./cmd/scraper -dry-run
```

Manual checks:

1. Home, Lok Sabha, Map, and a representative profile page all load.
2. Filters update the URL (search params drive state for shareable links).
3. Share links resolve to the production domain.
4. Dev-tools → Rendering → `prefers-reduced-motion: reduce` removes animations cleanly.

## Project Conventions

**TypeScript**

- `strict: true`. No `any` — use `unknown` with type guards.
- Zod validates every API input.
- Prefer `interface` over `type` for object shapes.
- Async functions declare explicit return types.

**React / Next.js 16**

- Server components by default; `"use client"` only where it's needed.
- Client-side data fetching uses TanStack Query.
- Filter state lives in URL search params so links are shareable.
- This is **Next.js 16** — APIs differ from older documentation. See [web/AGENTS.md](web/AGENTS.md).

**Go**

- Explicit error handling — never `panic` in the hot path.
- Propagate `context.Context` for cancellation.
- Structured logging via `slog`.

**SQL**

- Always project columns explicitly.
- Parameterized queries only (no string concatenation).

**Guardrails**

- The legal disclaimer link appears in the `Footer` on every page.
- Scraper rate limit is fixed at 2 req/sec; please do not raise it.
- All politician data keys on `myneta_id`; upserts use `ON CONFLICT` to avoid duplicates.
- API routes must set `export const runtime = 'nodejs'`.
- The bundled TopoJSON at `public/india-states.json` is authoritative; do not fetch it externally.

## Roadmap

- Rajya Sabha coverage (parallel scraper target)
- State assembly data for selected states
- Advanced filtering (year elected, education, net-worth bands from affidavits)
- Per-IPC-section drill-down pages
- Downloadable CSV exports of public aggregates

Open an issue if you'd like to propose or champion one of these.

## Contributing

Contributions are welcome, particularly for:

- Data-quality improvements (mis-mapped party / state, missing affidavit entries upstream)
- Accessibility refinements
- Additional visualizations that preserve the project's neutral, non-partisan tone

Workflow:

1. Fork the repo and create a topic branch.
2. Make focused commits with clear messages.
3. Run the verification steps in [Testing & Verification](#testing--verification).
4. Open a pull request describing the motivation and any trade-offs.

Please do not submit changes that:

- Raise the scraper rate limit above 2 req/sec.
- Add editorial commentary, characterization, or claims beyond the source data.
- Introduce advertising, paid placements, or partisan styling.

## Security

If you believe you have found a security issue (e.g., SQL injection, SSRF, secret exposure), please **do not** open a public issue. Email **samrat.mukherjee2022@gmail.com** with a description and, where possible, a minimal reproduction. You will receive an acknowledgment within a reasonable time.

## Legal Notice

NetaGirifiles is an independent, non-partisan, non-profit civic-transparency project. It is not affiliated with, endorsed by, or funded by the Election Commission of India, the Association for Democratic Reforms, the Government of India, or any political party, candidate, or campaign.

- All figures on the site are drawn from affidavits **self-declared** by candidates to the Election Commission of India and compiled by [myneta.info](https://myneta.info) (ADR / National Election Watch).
- Declarations in an affidavit are **not** findings of guilt. Under Indian law, every person is presumed innocent until proven otherwise by a court of competent jurisdiction. Pending matters may be dismissed, quashed, withdrawn, compounded, or result in acquittal.
- Where the interface uses the label "serious," that label follows the methodology published by ADR / National Election Watch.
- The project is published in good faith, in the public interest, and in exercise of the voter's right to know — recognized by the Supreme Court of India in *Union of India v. Association for Democratic Reforms* (2002) 5 SCC 294 and subsequent decisions as flowing from Article 19(1)(a) of the Constitution of India.
- Party names, short names, and colours are used solely for identification under nominative fair use.
- Nothing on the site, in this repository, or in its commit history is intended as an allegation of wrongdoing against any individual.
- Corrections: if any specific entry is factually inaccurate (for example, an affidavit has been amended, or the upstream compilation has been corrected), email **samrat.mukherjee2022@gmail.com** with the supporting document and we will review and update the record.
- The complete notice, including governing-law and jurisdiction clauses, is available at [netagirifiles.fun/disclaimer](https://www.netagirifiles.fun/disclaimer).

## Acknowledgments

- **[Association for Democratic Reforms (ADR)](https://adrindia.org)** and **[National Election Watch](https://myneta.info)** — for two decades of patient, public-interest work compiling candidate affidavits that made this kind of tool possible.
- **Supreme Court of India** — for repeatedly affirming, across *Union of India v. ADR* (2002), *PUCL v. Union of India* (2003), *Public Interest Foundation v. Union of India* (2019), and *Rambabu Singh Thakur v. Sunil Arora* (2020), the voter's right to know.
- The maintainers of Next.js, React, Tailwind, D3, TanStack Query, pgx, and goquery.

## License

Source code is released under the **MIT License** — see [LICENSE](LICENSE).

The underlying affidavit data is public record, originating with the Election Commission of India and compiled by ADR / National Election Watch. Their terms govern reuse of that data.

## Contact

- **Corrections, takedown requests, legal notices:** samrat.mukherjee2022@gmail.com
- **Author:** [Samrat Mukherjee](https://www.linkedin.com/in/samrat-mukherjee00/) — [GitHub](https://github.com/0xSamrat) · [X / Twitter](https://x.com/0x_samrat)

---

<div align="center">
<sub>Built as a civic-transparency project. Every number on this site is something a candidate declared about themselves.</sub>
</div>
