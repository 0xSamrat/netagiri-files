# NetaWatch: Indian Politician Criminal Cases Transparency Platform

## Quick Summary for Claude Code

**Project**: Civic transparency platform visualizing criminal cases declared by Indian MPs in election affidavits.

**Tech Stack**:
- Frontend: React + Vite + TypeScript + Tailwind CSS + D3.js
- Backend: Go + Gin
- Database: PostgreSQL on Supabase
- Scraper: Go with goroutines (manual execution, not cron)
- Hosting: Cloudflare Pages (frontend) + Render free tier (backend)

**Data Source**: Scrape myneta.info (public domain ECI affidavit data)

**Constraint**: 100% free hosting with custom domain support

---

## Project Context

### What We're Building
A website where Indian citizens can:
1. See how many criminal cases their politician (MP) has declared
2. Compare politicians by party, state, and crime severity
3. View India map showing which states have highest % of politicians with cases
4. Click individual politicians to see detailed case breakdown

### Why It's Legal
- Data comes from self-sworn affidavits filed with Election Commission of India
- Supreme Court mandated this disclosure in 2002-2003
- ADR/MyNeta.info has been publishing this data legally since 2002
- All data is public domain

### Data Size (Important for DB choice)
- Lok Sabha MPs: 543
- Rajya Sabha MPs: ~245
- Total politicians: ~800
- Criminal cases records: ~2,000
- **Total data: ~5 MB** (Supabase 500MB free tier is 100x sufficient)

---

## Core Features (3 Main Views)

### View 1: Lok Sabha Section (`/lok-sabha`)
- **Bubble Chart**: Party-wise distribution using D3.js
  - Bubble size = number of MPs with cases from that party
  - Bubble color = party color
  - Click bubble to filter ranking table
- **Filter Bar**: 
  - Party dropdown (BJP, INC, SP, TMC, etc.)
  - State dropdown (all 28 states + 8 UTs)
  - Crime type (All cases / Serious cases only)
- **Ranking Table**: Sortable, paginated list of MPs
  - Columns: Rank, Name, Party, Constituency, Cases, Serious Cases, Assets
  - Default sort: by total cases descending
  - Click row → navigate to individual politician page
- **Pagination**: 20 items per page

### View 2: Rajya Sabha Section (`/rajya-sabha`)
- Identical structure to Lok Sabha
- ~245 current members
- Reuse all components from Lok Sabha view

### View 3: India Map Heatmap (`/map`)
- **Choropleth Map**: D3.js with TopoJSON
  - Color intensity = percentage of MPs with cases from that state
  - Hover shows tooltip with state name and stats
  - Click state opens detail panel
- **Toggle Filters**:
  - Lok Sabha only / Rajya Sabha only / Both
  - All cases / Serious cases only
- **State Detail Panel** (slide-in on click):
  - State name and statistics
  - Top 5 MPs by cases from that state
  - "View all MPs from [State]" button

### Individual Politician Page (`/politician/:id`)
- **Profile Header**: Name, Photo, Party, Constituency, State, House
- **Stats Cards Row**: Total cases, Serious cases, Convicted status, Assets
- **Case Breakdown**: Visual bar chart by IPC section with descriptions
- **Comparison Section**: 
  - "More cases than X% of MPs from same party"
  - Comparison with state and national averages
- **Source Link**: Button to view original affidavit PDF on ECI website

### Homepage (`/`)
- Key stats cards (total MPs with cases for LS, RS, serious cases, convicted)
- "Find Your MP" search box (search by name or constituency)
- Quick navigation cards to the 3 main views
- Footer with About, Methodology, Disclaimer links

### Additional Pages
- `/about` - About the project and mission
- `/methodology` - How data is collected, what "criminal case" means
- `/disclaimer` - Legal disclaimer (very important)
- `/search` - Search results page

---

## Technical Specifications

### Frontend: React + Vite

**Framework & Tools**:
- React 18 with Vite (NOT Next.js)
- TypeScript
- Tailwind CSS for styling
- D3.js for visualizations (bubble chart, choropleth map)
- TanStack Query (React Query) for API data fetching
- React Router v6 for routing

**Why Vite instead of Next.js**:
- Cloudflare Pages works best with static sites
- Data changes rarely (only after elections) - no SSR needed
- All ~800 politician pages can be pre-built as static HTML
- Simpler build process

**Hosting**: Cloudflare Pages
- Unlimited bandwidth (free)
- Free custom domain + SSL
- Global CDN

### Backend: Go API

**Framework & Tools**:
- Go 1.21+
- Gin for HTTP routing
- sqlc for type-safe database queries
- Standard library for JSON handling

**Hosting**: Render free tier
- Note: Spins down after 15 min inactivity (cold starts acceptable for civic project)
- Alternative: Railway ($5 free credit/month)

**API Endpoints Needed**:
```
GET /api/v1/stats/overview
GET /api/v1/stats/lok-sabha
GET /api/v1/stats/rajya-sabha

GET /api/v1/lok-sabha/bubble-data
GET /api/v1/lok-sabha/politicians?party=&state=&crime_type=&sort=&page=

GET /api/v1/rajya-sabha/bubble-data
GET /api/v1/rajya-sabha/politicians?party=&state=&crime_type=&sort=&page=

GET /api/v1/politicians/:id

GET /api/v1/map/state-stats?house=&crime_type=
GET /api/v1/map/state/:code/politicians

GET /api/v1/search?q=

GET /api/v1/parties
GET /api/v1/states
GET /api/v1/ipc-sections
```

### Database: Supabase (PostgreSQL)

**Why Supabase**:
- 500 MB free tier (we need ~5 MB)
- PostgreSQL is ideal for relational data (politicians → cases → parties)
- Free tier pauses after 7 days inactivity (solve with weekly GitHub Action ping)

**Tables Needed**:
- `parties` - Political parties (id, name, short_name, color_hex)
- `states` - Indian states and UTs (id, name, code, type)
- `politicians` - Main table (id, myneta_id, name, party_id, constituency, state_id, house, total_cases, serious_cases, is_convicted, assets_inr, education, affidavit_pdf_url)
- `criminal_cases` - Individual cases (id, politician_id, ipc_section, description, is_serious, court_name, case_status)
- `ipc_sections` - Reference table (section, title, description, is_serious)

**Useful Views**:
- `politician_summary` - Joins politician with party and state names
- `party_stats` - Aggregates cases by party
- `state_stats` - Aggregates cases by state (for map)

### Scraper: Go with Concurrency

**Purpose**: Scrape myneta.info to populate database

**Key Requirements**:
- Written in Go (not Python)
- Use goroutines and channels for concurrent scraping
- Rate limiting (2 requests/second to be respectful)
- Manual execution only (not a cron job - run when needed)
- Direct insert to Supabase PostgreSQL

**Data Source URLs**:
- Lok Sabha list: `myneta.info/LokSabha2024/index.php?action=summary&subAction=winner_crime&sort=criminal`
- Individual candidate: `myneta.info/LokSabha2024/candidate.php?candidate_id={ID}`
- Rajya Sabha: `myneta.info/rajyasabha/`

**Data to Extract per Politician**:
- Name, Party, Constituency, State
- Number of criminal cases
- Individual IPC sections charged under
- Assets declared
- Education
- Link to original affidavit

---

## Hosting Architecture

```
CLOUDFLARE PAGES          RENDER (Free)           SUPABASE
┌─────────────────┐      ┌─────────────────┐     ┌─────────────────┐
│ React + Vite    │ API  │ Go Backend      │     │ PostgreSQL      │
│ Static Build    │─────▶│ Gin Router      │────▶│ 500 MB Free     │
│ D3.js Charts    │      │                 │     │ ~5 MB Used      │
│                 │      └─────────────────┘     └─────────────────┘
│ Domain:         │
│ netawatch.in    │      LOCAL (Manual Run)
│ (FREE SSL)      │      ┌─────────────────┐
└─────────────────┘      │ Go Scraper      │────▶ Supabase
                         │ (goroutines)    │
                         └─────────────────┘
```

**Keep Supabase Alive**: 
- GitHub Action that pings database weekly to prevent pause

---

## Data Entities

### Politician
- id, myneta_id (for deduplication)
- name, photo_url
- party_id (foreign key)
- constituency, state_id (foreign key)
- house: "lok_sabha" | "rajya_sabha"
- total_cases, serious_cases
- is_convicted (boolean)
- assets_inr (bigint)
- education
- affidavit_pdf_url
- election_year

### Criminal Case
- id, politician_id (foreign key)
- ipc_section (e.g., "302", "307", "376")
- description
- is_serious (boolean)
- court_name
- case_status: "pending" | "convicted" | "acquitted"

### Party
- id, name, short_name, color_hex

### State
- id, name, code, type ("state" | "ut")

### IPC Section (Reference)
- section (primary key)
- title, description
- is_serious (boolean)

**Serious IPC Sections** (for filtering):
- 302 (Murder)
- 307 (Attempt to Murder)
- 376 (Rape)
- 354 (Assault on Woman)
- 363 (Kidnapping)
- 420 (Cheating)
- 498A (Cruelty to Woman)
- 395 (Dacoity)
- 153A (Promoting Enmity)

---

## UI Components Needed

### Charts (D3.js)
1. **BubbleChart** - Force-directed bubble chart for party distribution
2. **IndiaMap** - Choropleth map with TopoJSON
3. **CaseBreakdownChart** - Horizontal bar chart for IPC section breakdown

### UI Components
1. **StatsCard** - Display single metric (number + label)
2. **FilterBar** - Dropdowns for party, state, crime type
3. **RankingTable** - Sortable, paginated table with click navigation
4. **PoliticianCard** - Row in ranking table
5. **SearchBox** - Search input with debounce
6. **Pagination** - Page navigation
7. **LoadingSpinner** - Loading state

### Layout Components
1. **Header** - Navigation bar
2. **Footer** - Links + disclaimer
3. **Layout** - Wrapper with header/footer

### Politician Page Components
1. **ProfileHeader** - Name, photo, party, constituency
2. **CaseBreakdown** - IPC section chart + list
3. **ComparisonStats** - vs party avg, state avg

---

## Important Legal Disclaimer

Must be included on every page footer and `/disclaimer` page:

```
DISCLAIMER

1. All information is sourced from self-sworn affidavits filed with 
   the Election Commission of India (ECI).

2. "Criminal cases" refers to cases DECLARED by candidates themselves. 
   These are pending cases unless marked as "convicted."

3. Pending cases do NOT imply guilt. Every person is presumed innocent 
   until proven guilty by a court of law.

4. We do not modify any information from source data. For official 
   records, refer to ECI's affidavit archive.

5. This is a civic transparency initiative, not affiliated with any 
   political party or government body.

6. Data updated after each major election. Last updated: [DATE]

Source: Association for Democratic Reforms (ADR) / MyNeta.info
Original data: Election Commission of India
```

---

## Development Phases

### Phase 1: Setup & Database
- Initialize Go backend project structure
- Set up Supabase project and create all tables
- Initialize React + Vite frontend project
- Configure Tailwind CSS

### Phase 2: Scraper
- Build Go scraper with goroutines for concurrent fetching
- Parse MyNeta HTML pages
- Insert data into Supabase
- Run scraper to populate Lok Sabha data

### Phase 3: Backend API
- Implement all API endpoints
- Add CORS for frontend
- Test with sample data

### Phase 4: Frontend - Lok Sabha View
- Build bubble chart component
- Build filter bar
- Build ranking table with pagination
- Connect to API

### Phase 5: Individual Politician Page
- Build profile header
- Build case breakdown chart
- Build comparison stats
- Link to original affidavit

### Phase 6: Rajya Sabha View
- Scrape Rajya Sabha data
- Reuse Lok Sabha components

### Phase 7: India Map
- Build choropleth map with D3 + TopoJSON
- Add state detail panel
- Add toggle filters

### Phase 8: Homepage & Polish
- Build homepage with stats and search
- Add About, Methodology, Disclaimer pages
- SEO optimization (meta tags, OG images)
- Mobile responsiveness

### Phase 9: Deployment
- Deploy frontend to Cloudflare Pages
- Deploy backend to Render
- Configure custom domain
- Set up GitHub Action to keep Supabase alive

---

## File Structure

### Backend (Go)
```
backend/
├── cmd/server/main.go
├── internal/
│   ├── config/
│   ├── database/
│   ├── handlers/
│   ├── middleware/
│   ├── models/
│   └── repository/
├── go.mod
└── Dockerfile
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   ├── layout/
│   │   ├── ui/
│   │   └── politician/
│   ├── pages/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── india-states.json
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### Scraper (Go)
```
scraper/
├── cmd/scraper/main.go
├── internal/
│   ├── fetcher/
│   ├── parser/
│   ├── models/
│   └── store/
└── go.mod
```

---

## Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend framework | React + Vite | Cloudflare Pages works best with static sites |
| Backend language | Go | User preference, good for concurrent scraper |
| Database | PostgreSQL (Supabase) | Relational data, free tier sufficient |
| Scraper approach | Go + goroutines | Concurrent scraping, same language as backend |
| Hosting (frontend) | Cloudflare Pages | Unlimited bandwidth, free custom domain |
| Hosting (backend) | Render free tier | Free, cold starts acceptable |
| Visualization | D3.js | Best for custom charts and maps |

---

## Success Criteria

- [ ] All 543 Lok Sabha MPs loaded with case data
- [ ] All ~245 Rajya Sabha MPs loaded with case data
- [ ] Bubble chart shows party-wise distribution
- [ ] India map shows state-wise percentages
- [ ] Individual politician pages with case breakdown
- [ ] Search by name and constituency works
- [ ] Mobile responsive
- [ ] Loads under 3 seconds
- [ ] Legal disclaimer present on all pages
- [ ] Custom domain configured (e.g., netawatch.in)
