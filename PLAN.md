# NetaWatch — Implementation Plan

> **This is a living document.** Update Progress, Decision Log, and Discoveries as work proceeds.

## Quick Reference

| Phase | Status | Est. Time |
|-------|--------|-----------|
| 1. Scaffold | ⬜ Not started | 45 min |
| 2. Database | ⬜ Not started | 30 min |
| 3. Scraper | ⬜ Not started | 2 hr |
| 4. API Routes | ⬜ Not started | 1.5 hr |
| 5. Lok Sabha View | ⬜ Not started | 2 hr |
| 6. Politician Page | ⬜ Not started | 1.5 hr |
| 7. India Map | ⬜ Not started | 1.5 hr |
| 8. Homepage & Polish | ⬜ Not started | 1.5 hr |
| 9. Deployment | ⬜ Not started | 30 min |

Status: ⬜ Not started | 🔄 In progress | ✅ Complete | ⏸️ Blocked

---

## Progress

<!-- Update this section as you complete tasks -->

_No progress yet._

---

## Decision Log

<!-- Record decisions and their rationale here -->

| Date | Decision | Rationale |
|------|----------|-----------|
| — | Next.js over Go+React | Unified deployment on Vercel; no separate backend service needed |
| — | Supabase over self-hosted PG | Free tier sufficient (500MB >> 5MB data); managed backups |
| — | D3.js over Chart.js | Need custom choropleth + force-directed bubble chart |
| — | TanStack Query over SWR | Better devtools, prefetching, mutation support |

---

## Non-Goals (Explicitly Out of Scope)

- ❌ User authentication / accounts
- ❌ User-submitted data or crowdsourcing
- ❌ Real-time updates / WebSockets
- ❌ Mobile app (web-only)
- ❌ State assembly data (Lok Sabha only)
- ❌ Historical election data (current term only)
- ❌ Automated scraper scheduling (manual run only)
- ❌ Multi-language support (English only for MVP)

---

## Surprises & Discoveries

<!-- Document unexpected findings during implementation -->

_None yet._

---

## Phase 1 — Scaffold (45 min)

### 1.1 Next.js App (20 min)

```bash
cd neta-watch
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd web
npm install @tanstack/react-query d3 @types/d3 topojson-client @types/topojson-client pg zod
```

**Files created**: `web/` with App Router structure

**Verify**: `npm run dev` → localhost:3000 shows Next.js welcome page

### 1.2 Go Scraper Init (15 min)

```bash
cd neta-watch
mkdir -p scraper/cmd/scraper scraper/internal/{fetcher,parser,models,store}
cd scraper
go mod init github.com/[username]/netawatch/scraper
go get github.com/PuerkitoBio/goquery github.com/jackc/pgx/v5 golang.org/x/time/rate
```

Create `scraper/cmd/scraper/main.go`:
```go
package main

import (
    "flag"
    "fmt"
)

func main() {
    house := flag.String("house", "lok_sabha", "lok_sabha or rajya_sabha")
    concurrency := flag.Int("concurrency", 5, "number of workers")
    dryRun := flag.Bool("dry-run", false, "parse without DB insert")
    flag.Parse()
    
    fmt.Printf("Scraping %s with %d workers (dry-run: %v)\n", *house, *concurrency, *dryRun)
}
```

**Verify**: `go build ./...` succeeds

### 1.3 Environment Files (10 min)

Create `web/.env.local.example`:
```
SUPABASE_DB_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Create `scraper/.env.example`:
```
SUPABASE_DB_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
```

**Verify**: Files exist, `.gitignore` includes `.env.local`

---

## Phase 2 — Database (30 min)

### 2.1 Create Supabase Project (5 min)

1. Go to supabase.com → New Project
2. Copy connection string to `.env.local` and `scraper/.env`

### 2.2 Migration Script (20 min)

Create `db/migrations/0001_init.sql`:

```sql
-- Parties
CREATE TABLE parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(20) NOT NULL UNIQUE,
    color_hex VARCHAR(7) DEFAULT '#808080'
);

-- States
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(5) NOT NULL UNIQUE,
    type VARCHAR(20) DEFAULT 'state' CHECK (type IN ('state', 'ut'))
);

-- Politicians
CREATE TABLE politicians (
    id SERIAL PRIMARY KEY,
    myneta_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    photo_url TEXT,
    party_id INTEGER REFERENCES parties(id),
    constituency VARCHAR(200),
    state_id INTEGER REFERENCES states(id),
    house VARCHAR(20) NOT NULL CHECK (house IN ('lok_sabha', 'rajya_sabha')),
    total_cases INTEGER DEFAULT 0,
    serious_cases INTEGER DEFAULT 0,
    is_convicted BOOLEAN DEFAULT FALSE,
    assets_inr BIGINT DEFAULT 0,
    liabilities_inr BIGINT DEFAULT 0,
    education VARCHAR(200),
    age INTEGER,
    affidavit_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criminal Cases
CREATE TABLE criminal_cases (
    id SERIAL PRIMARY KEY,
    politician_id INTEGER REFERENCES politicians(id) ON DELETE CASCADE,
    ipc_section VARCHAR(50),
    description TEXT,
    is_serious BOOLEAN DEFAULT FALSE,
    court_name VARCHAR(200),
    case_status VARCHAR(50) DEFAULT 'pending'
);

-- IPC Sections Reference
CREATE TABLE ipc_sections (
    section VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_serious BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_politicians_house ON politicians(house);
CREATE INDEX idx_politicians_party ON politicians(party_id);
CREATE INDEX idx_politicians_state ON politicians(state_id);
CREATE INDEX idx_politicians_cases ON politicians(total_cases DESC);
CREATE INDEX idx_cases_politician ON criminal_cases(politician_id);

-- Views
CREATE VIEW politician_summary AS
SELECT 
    p.id, p.myneta_id, p.name, p.photo_url, p.constituency, p.house,
    p.total_cases, p.serious_cases, p.is_convicted, p.assets_inr,
    p.education, p.affidavit_pdf_url,
    pa.short_name AS party, pa.color_hex AS party_color,
    s.name AS state_name, s.code AS state_code
FROM politicians p
LEFT JOIN parties pa ON p.party_id = pa.id
LEFT JOIN states s ON p.state_id = s.id;

CREATE VIEW party_stats AS
SELECT 
    pa.id, pa.name, pa.short_name, pa.color_hex, p.house,
    COUNT(*) AS total_mps,
    COUNT(*) FILTER (WHERE p.total_cases > 0) AS mps_with_cases,
    SUM(p.total_cases) AS total_cases
FROM parties pa
JOIN politicians p ON pa.id = p.party_id
GROUP BY pa.id, p.house;

CREATE VIEW state_stats AS
SELECT 
    s.id, s.name, s.code, p.house,
    COUNT(*) AS total_mps,
    COUNT(*) FILTER (WHERE p.total_cases > 0) AS mps_with_cases,
    ROUND(100.0 * COUNT(*) FILTER (WHERE p.total_cases > 0) / NULLIF(COUNT(*), 0), 1) AS pct_with_cases
FROM states s
JOIN politicians p ON s.id = p.state_id
GROUP BY s.id, p.house;
```

### 2.3 Seed Data (5 min)

Create `db/seed/ipc_sections.sql`:

```sql
INSERT INTO ipc_sections (section, title, is_serious) VALUES
('302', 'Murder', true),
('307', 'Attempt to Murder', true),
('376', 'Rape', true),
('354', 'Assault on Woman', true),
('363', 'Kidnapping', true),
('420', 'Cheating', true),
('498A', 'Cruelty to Woman', true),
('395', 'Dacoity', true),
('153A', 'Promoting Enmity', true),
('506', 'Criminal Intimidation', false),
('147', 'Rioting', false),
('323', 'Voluntarily Causing Hurt', false),
('341', 'Wrongful Restraint', false)
ON CONFLICT (section) DO NOTHING;
```

**Run**:
```bash
psql $SUPABASE_DB_URL -f db/migrations/0001_init.sql
psql $SUPABASE_DB_URL -f db/seed/ipc_sections.sql
```

**Verify**: 
```bash
psql $SUPABASE_DB_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
# Should list: parties, states, politicians, criminal_cases, ipc_sections
```

---

## Phase 3 — Scraper (2 hr)

### 3.1 Rate-Limited Fetcher (30 min)

Create `scraper/internal/fetcher/fetcher.go`:

```go
package fetcher

import (
    "context"
    "fmt"
    "io"
    "net/http"
    "time"

    "golang.org/x/time/rate"
)

var (
    limiter = rate.NewLimiter(rate.Every(500*time.Millisecond), 1) // 2 req/sec
    client  = &http.Client{Timeout: 30 * time.Second}
)

func Fetch(ctx context.Context, url string) ([]byte, error) {
    if err := limiter.Wait(ctx); err != nil {
        return nil, err
    }
    
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    req.Header.Set("User-Agent", "NetaWatch-Scraper/1.0 (civic transparency)")
    
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != 200 {
        return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
    }
    
    return io.ReadAll(resp.Body)
}
```

**Verify**: Unit test fetches a known URL

### 3.2 HTML Parser (45 min)

Create `scraper/internal/parser/parser.go`:

```go
package parser

import (
    "strings"
    "github.com/PuerkitoBio/goquery"
)

type Politician struct {
    MyNetaID     int
    Name         string
    Party        string
    Constituency string
    State        string
    TotalCases   int
    SeriousCases int
    AssetsINR    int64
    Education    string
    AffidavitURL string
    Cases        []CriminalCase
}

type CriminalCase struct {
    IPCSection string
    IsSerious  bool
}

func ParseCandidatePage(html []byte) (*Politician, error) {
    doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(html)))
    if err != nil {
        return nil, err
    }
    
    p := &Politician{}
    // Parse name from h2
    p.Name = strings.TrimSpace(doc.Find("h2").First().Text())
    // ... rest of parsing logic
    
    return p, nil
}
```

**Verify**: Parse a saved HTML file, check fields match source

### 3.3 Worker Pool & DB Writer (45 min)

Update `scraper/cmd/scraper/main.go` with:
- Fan-out: fetch list page → extract candidate IDs
- N goroutines fetch candidate pages concurrently
- Single writer goroutine does pgx upserts

Pattern:
```go
jobs := make(chan int, len(candidateIDs))
results := make(chan *Politician, len(candidateIDs))

// Start N workers
for i := 0; i < *concurrency; i++ {
    go worker(ctx, jobs, results)
}

// Single DB writer
go dbWriter(ctx, results, db)
```

**Verify**: 
```bash
go run ./cmd/scraper -house=lok_sabha -dry-run
# Prints ~543 parsed politicians without DB insert

go run ./cmd/scraper -house=lok_sabha -concurrency=5
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM politicians WHERE house='lok_sabha'"
# Should return ~543
```

---

## Phase 4 — API Routes (1.5 hr)

### 4.1 Database Connection (15 min)

Create `web/src/lib/db.ts`:

```typescript
import { Pool } from 'pg';

// Module-level pool (survives hot reload)
const globalForPg = globalThis as unknown as { pool: Pool | undefined };

export const pool = globalForPg.pool ?? new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  max: 10,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pool = pool;
}

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const { rows } = await pool.query(sql, params);
  return rows as T[];
}
```

### 4.2 Query Functions (30 min)

Create `web/src/lib/queries/stats.ts`:

```typescript
import { query } from '../db';

export async function getOverviewStats() {
  const [ls] = await query<{total: number, with_cases: number}>(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE total_cases > 0) as with_cases
    FROM politicians WHERE house = 'lok_sabha'
  `);
  
  const [rs] = await query<{total: number, with_cases: number}>(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE total_cases > 0) as with_cases
    FROM politicians WHERE house = 'rajya_sabha'
  `);
  
  return { lok_sabha: ls, rajya_sabha: rs };
}
```

Create similar files for: `politicians.ts`, `parties.ts`, `map.ts`, `search.ts`

### 4.3 Route Handlers (45 min)

Create `web/src/app/api/v1/stats/overview/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getOverviewStats } from '@/lib/queries/stats';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET() {
  try {
    const stats = await getOverviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
```

Create remaining routes:
- `api/v1/stats/lok-sabha/route.ts`
- `api/v1/lok-sabha/bubble-data/route.ts`
- `api/v1/lok-sabha/politicians/route.ts` (with Zod validation for query params)
- `api/v1/politicians/[id]/route.ts`
- `api/v1/map/state-stats/route.ts`
- `api/v1/map/state/[code]/politicians/route.ts`
- `api/v1/search/route.ts`
- `api/v1/parties/route.ts`
- `api/v1/states/route.ts`

**Verify**:
```bash
npm run dev
curl http://localhost:3000/api/v1/stats/overview
# Returns: {"lok_sabha":{"total":543,"with_cases":251},...}

curl "http://localhost:3000/api/v1/lok-sabha/politicians?page=1"
# Returns 20 politicians sorted by total_cases DESC
```

---

## Phase 5 — Lok Sabha View (2 hr)

### 5.1 TanStack Query Setup (15 min)

Create `web/src/providers/QueryProvider.tsx`:

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

Wrap in `web/src/app/layout.tsx`

### 5.2 Bubble Chart (45 min)

Create `web/src/components/charts/BubbleChart.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BubbleData {
  party_id: number;
  short_name: string;
  color_hex: string;
  mps_with_cases: number;
}

export function BubbleChart({ 
  data, 
  onPartyClick 
}: { 
  data: BubbleData[];
  onPartyClick?: (partyId: number | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    const svg = d3.select(svgRef.current);
    // ... D3 force simulation code
  }, [data]);

  return <svg ref={svgRef} className="w-full h-[400px]" />;
}
```

### 5.3 Filter Bar & Table (45 min)

Create:
- `web/src/components/ui/FilterBar.tsx`
- `web/src/components/ui/RankingTable.tsx`
- `web/src/components/ui/Pagination.tsx`
- `web/src/components/ui/StatsCard.tsx`

### 5.4 Lok Sabha Page (15 min)

Create `web/src/app/lok-sabha/page.tsx`:

```tsx
import { BubbleChart } from '@/components/charts/BubbleChart';
import { FilterBar } from '@/components/ui/FilterBar';
import { RankingTable } from '@/components/ui/RankingTable';
// ... compose components, use URL search params for filter state
```

**Verify**:
- `/lok-sabha` loads
- Bubble chart shows parties
- Clicking bubble filters table
- Pagination works
- Clicking row navigates to `/politician/[id]`

---

## Phase 6 — Politician Page (1.5 hr)

### 6.1 Components (45 min)

Create:
- `web/src/components/politician/ProfileHeader.tsx`
- `web/src/components/politician/CaseBreakdown.tsx` (D3 horizontal bar chart)
- `web/src/components/politician/ComparisonStats.tsx`

### 6.2 Page with Static Generation (45 min)

Create `web/src/app/politician/[id]/page.tsx`:

```tsx
import { getPoliticianById, getAllPoliticianIds } from '@/lib/queries/politicians';

export async function generateStaticParams() {
  const ids = await getAllPoliticianIds();
  return ids.map((id) => ({ id: String(id) }));
}

export default async function PoliticianPage({ params }: { params: { id: string } }) {
  const politician = await getPoliticianById(Number(params.id));
  // ... render components
}
```

**Verify**:
- Navigate from table → politician page loads
- Case breakdown matches DB
- Affidavit PDF link works
- `npm run build` generates ~800 static pages

---

## Phase 7 — India Map (1.5 hr)

### 8.1 TopoJSON File (10 min)

Download India states TopoJSON and place at `web/public/india-states.json`

### 8.2 Map Component (1 hr)

Create `web/src/components/charts/IndiaMap.tsx`:

```tsx
'use client';

import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export function IndiaMap({ 
  data, 
  onStateClick 
}: { 
  data: StateStats[];
  onStateClick?: (code: string | null) => void;
}) {
  // D3 choropleth with color scale by pct_with_cases
}
```

### 8.3 Map Page (20 min)

Create `web/src/app/map/page.tsx`:
- Toggle bar: house (LS/RS/Both) × crime_type (All/Serious)
- Choropleth map
- Click state → slide-in detail panel with top 5 MPs

**Verify**:
- Map renders all 36 states/UTs
- Hover shows tooltip
- Click Maharashtra → panel with top MPs
- Toggle "serious only" → colors update

---

## Phase 8 — Homepage & Polish (1.5 hr)

### 9.1 Homepage (30 min)

Create `web/src/app/page.tsx`:
- 4 StatsCards
- SearchBox (debounced)
- 2 navigation cards to LS/Map

### 9.2 Static Pages (20 min)

Create:
- `web/src/app/about/page.tsx`
- `web/src/app/methodology/page.tsx`
- `web/src/app/disclaimer/page.tsx`

### 9.3 Layout & Footer (20 min)

Create `web/src/components/layout/Footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="border-t py-8 text-sm text-gray-600">
      <p className="font-semibold mb-2">Disclaimer</p>
      <p>
        All information is sourced from self-sworn affidavits filed with the 
        Election Commission of India. "Criminal cases" refers to cases declared 
        by candidates; pending cases do NOT imply guilt.
      </p>
      <div className="mt-4 flex gap-4">
        <a href="/about">About</a>
        <a href="/methodology">Methodology</a>
        <a href="/disclaimer">Disclaimer</a>
      </div>
      <p className="mt-4">Source: ADR/MyNeta.info • ECI Affidavit Archive</p>
    </footer>
  );
}
```

**IMPORTANT**: Footer with disclaimer MUST render on every page via root layout.

### 9.4 SEO & Responsive (20 min)

- Add `metadata` exports to each route
- Create `web/src/app/sitemap.ts`
- Add `web/public/robots.txt`
- Tailwind responsive pass (375px mobile)

**Verify**:
- Lighthouse mobile score ≥ 90
- All routes responsive
- Disclaimer visible on every page

---

## Phase 9 — Deployment (30 min)

### 10.1 Vercel Setup (15 min)

1. Push repo to GitHub
2. Import to Vercel, set root = `neta-watch/web/`
3. Add env vars: `SUPABASE_DB_URL`, `NEXT_PUBLIC_SITE_URL`
4. Deploy

### 10.2 Custom Domain (10 min)

Add domain in Vercel → Update DNS → Verify SSL

### 10.3 Supabase Keep-Alive (5 min)

Create `.github/workflows/supabase-ping.yml`:

```yaml
name: Keep Supabase Alive
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          PGPASSWORD=${{ secrets.SUPABASE_PASSWORD }} psql \
            -h ${{ secrets.SUPABASE_HOST }} \
            -U postgres -d postgres -c "SELECT 1"
```

**Verify**:
- Production site loads at custom domain
- All routes functional
- API routes respond
- GitHub Action runs successfully

---

## End-to-End Checklist

Before marking project complete:

- [ ] `SELECT COUNT(*) FROM politicians` returns ~545
- [ ] Homepage shows correct stats
- [ ] Search finds "Modi" and "Rahul"
- [ ] Lok Sabha bubble chart interactive
- [ ] Politician detail shows case breakdown
- [ ] Map choropleth colors correctly
- [ ] Map click shows state panel
- [ ] Disclaimer visible on EVERY page footer
- [ ] `npm run build` succeeds (no SSR errors)
- [ ] Lighthouse mobile ≥ 90
- [ ] Custom domain has valid SSL
- [ ] Supabase ping workflow green

---

## Appendix: Disclaimer Text

Use this exact text in Footer and `/disclaimer` page:

> **Disclaimer**
>
> 1. All information is sourced from self-sworn affidavits filed with the Election Commission of India (ECI) as per Supreme Court directives.
>
> 2. "Criminal cases" refers to cases declared by candidates themselves. These are pending cases unless marked as "convicted."
>
> 3. Pending cases do NOT imply guilt. Every person is presumed innocent until proven guilty by a court of law.
>
> 4. We do not modify any information from source data. For official records, refer to ECI's affidavit archive.
>
> 5. This is a civic transparency initiative, not affiliated with any political party or government body.
>
> **Source**: Association for Democratic Reforms (ADR) / MyNeta.info  
> **Original data**: Election Commission of India