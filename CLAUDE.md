# CLAUDE.md

NetaWatch: civic transparency platform showing criminal cases declared by Indian MPs in their ECI election affidavits. Data from myneta.info (public domain).

## Stack

- **Web**: Next.js 14 App Router + TypeScript + Tailwind + D3.js + TanStack Query
- **Scraper**: Go 1.21+ with goroutines + goquery
- **DB**: Supabase Postgres
- **Hosting**: Vercel

## Commands

```bash
# Web (from web/)
npm run dev                    # :3000
npm run build                  # Pre-renders ~800 politician pages
npm run lint                   # Must pass before commit

# Scraper (from scraper/)
go run ./cmd/scraper -house=lok_sabha -concurrency=5
go run ./cmd/scraper -dry-run  # Parse without DB write

# DB
psql $SUPABASE_DB_URL -f db/migrations/0001_init.sql
psql $SUPABASE_DB_URL -f db/seed/ipc_sections.sql
```

## Directory Map

```
web/src/
├── app/
│   ├── api/v1/           # REST endpoints (GET only)
│   ├── lok-sabha/        # Bubble chart + ranking table
│   ├── map/              # D3 choropleth
│   └── politician/[id]/  # Individual detail page
├── components/
│   ├── charts/           # BubbleChart.tsx, IndiaMap.tsx (D3, client)
│   └── ui/               # FilterBar, RankingTable, StatsCard
├── lib/
│   ├── db.ts             # Postgres pool (server-only)
│   └── queries/          # Typed query functions
└── types/                # Shared interfaces

scraper/
├── cmd/scraper/          # main.go with -house, -concurrency, -dry-run flags
└── internal/
    ├── fetcher/          # HTTP + rate limiting (2 req/sec)
    ├── parser/           # goquery HTML parsing
    ├── models/           # Politician, Case structs
    └── store/            # pgx upserts
```

## Code Style

**TypeScript**:
- Strict mode, no `any` — use `unknown` + type guards
- Zod for all API input validation
- Prefer interfaces over types
- Async functions end with explicit return types

**React**:
- Server components by default
- `'use client'` only for D3 charts, filters, interactive UI
- TanStack Query for client data fetching
- URL search params for filter state (shareable links)

**Go**:
- Explicit error handling, never `panic`
- Context propagation for cancellation
- Structured logging with `slog`

**SQL**:
- Always use projection, never `SELECT *`
- Parameterized queries only (no string concatenation)

## Critical Rules

**IMPORTANT**: Legal disclaimer MUST appear in Footer on EVERY page. Text in `PLAN.md` § Disclaimer.

**IMPORTANT**: Scraper rate limit is 2 req/sec. Do not increase — respect myneta.info.

**IMPORTANT**: All politician data keys on `myneta_id`. Use upsert (`ON CONFLICT`) to avoid duplicates.

**IMPORTANT**: API routes need `export const runtime = 'nodejs'` — pg driver doesn't work in Edge.

- `generateStaticParams` on `politician/[id]` — pre-render all ~800 pages at build
- Module-level Postgres pool in `db.ts` — prevents connection leaks in serverless
- D3 charts must handle empty data gracefully (loading/error states)
- TopoJSON file at `public/india-states.json` — don't fetch externally

## Verification

Before completing any task:
1. `npm run lint` passes
2. `npm run build` succeeds (catches SSR/client boundary issues)
3. Manual browser test of the changed feature
4. For scraper changes: `go build ./...` + `-dry-run` test

## Detailed Docs

Read the relevant doc before working on that area:
- `PLAN.md` — 9-phase implementation roadmap with file paths and verify steps

## DB Schema (quick ref)

Tables: `parties`, `states`, `politicians`, `criminal_cases`, `ipc_sections`
Views: `politician_summary`, `party_stats`, `state_stats`

Key relationships:
- `politicians.party_id` → `parties.id`
- `politicians.state_id` → `states.id`
- `criminal_cases.politician_id` → `politicians.id`
- Unique constraint on `politicians.myneta_id`