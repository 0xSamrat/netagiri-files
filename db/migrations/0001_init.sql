-- NetaWatch schema (initial)

-- Required before any index using gin_trgm_ops
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(50) NOT NULL UNIQUE,
    color_hex VARCHAR(7) DEFAULT '#808080'
);

CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(5) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL DEFAULT 'state' CHECK (type IN ('state', 'ut'))
);

CREATE TABLE IF NOT EXISTS politicians (
    id SERIAL PRIMARY KEY,
    myneta_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    photo_url TEXT,
    party_id INTEGER REFERENCES parties(id),
    constituency VARCHAR(200),
    state_id INTEGER REFERENCES states(id),
    house VARCHAR(20) NOT NULL CHECK (house IN ('lok_sabha', 'rajya_sabha')),
    total_cases INTEGER NOT NULL DEFAULT 0,
    serious_cases INTEGER NOT NULL DEFAULT 0,
    is_convicted BOOLEAN NOT NULL DEFAULT FALSE,
    assets_inr BIGINT NOT NULL DEFAULT 0,
    liabilities_inr BIGINT NOT NULL DEFAULT 0,
    education VARCHAR(200),
    age INTEGER,
    affidavit_pdf_url TEXT,
    election_year INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS criminal_cases (
    id SERIAL PRIMARY KEY,
    politician_id INTEGER NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    ipc_section VARCHAR(50),
    description TEXT,
    is_serious BOOLEAN NOT NULL DEFAULT FALSE,
    court_name VARCHAR(200),
    case_status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (case_status IN ('pending', 'convicted', 'acquitted'))
);

CREATE TABLE IF NOT EXISTS ipc_sections (
    section VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_serious BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_politicians_house ON politicians(house);
CREATE INDEX IF NOT EXISTS idx_politicians_party ON politicians(party_id);
CREATE INDEX IF NOT EXISTS idx_politicians_state ON politicians(state_id);
CREATE INDEX IF NOT EXISTS idx_politicians_total_cases ON politicians(total_cases DESC);
CREATE INDEX IF NOT EXISTS idx_politicians_name_ilike ON politicians USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cases_politician ON criminal_cases(politician_id);

-- Views

CREATE OR REPLACE VIEW politician_summary AS
SELECT
    p.id,
    p.myneta_id,
    p.name,
    p.photo_url,
    p.constituency,
    p.house,
    p.total_cases,
    p.serious_cases,
    p.is_convicted,
    p.assets_inr,
    p.liabilities_inr,
    p.education,
    p.affidavit_pdf_url,
    pa.id         AS party_id,
    pa.short_name AS party_short_name,
    pa.name       AS party_name,
    pa.color_hex  AS party_color,
    s.id          AS state_id_join,
    s.name        AS state_name,
    s.code        AS state_code
FROM politicians p
LEFT JOIN parties pa ON p.party_id = pa.id
LEFT JOIN states s ON p.state_id = s.id;

CREATE OR REPLACE VIEW party_stats AS
SELECT
    pa.id,
    pa.name,
    pa.short_name,
    pa.color_hex,
    p.house,
    COUNT(*) AS total_mps,
    COUNT(*) FILTER (WHERE p.total_cases > 0) AS mps_with_cases,
    COUNT(*) FILTER (WHERE p.serious_cases > 0) AS mps_with_serious_cases,
    COALESCE(SUM(p.total_cases), 0) AS total_cases_sum
FROM parties pa
JOIN politicians p ON pa.id = p.party_id
GROUP BY pa.id, p.house;

CREATE OR REPLACE VIEW state_stats AS
SELECT
    s.id,
    s.name,
    s.code,
    p.house,
    COUNT(*) AS total_mps,
    COUNT(*) FILTER (WHERE p.total_cases > 0) AS mps_with_cases,
    COUNT(*) FILTER (WHERE p.serious_cases > 0) AS mps_with_serious_cases,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE p.total_cases > 0)
        / NULLIF(COUNT(*), 0),
        1
    ) AS pct_with_cases
FROM states s
JOIN politicians p ON s.id = p.state_id
GROUP BY s.id, p.house;
