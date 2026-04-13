// Package store writes scraped politicians into Postgres using pgx.
//
// All writes go through a single goroutine that holds this Store, so the
// internal lookup caches (partyCache, stateCache) need no locking.
package store

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/samratmukherjee/netawatch/scraper/internal/models"
)

// Store holds a pgx pool plus lookup caches for party / state IDs.
type Store struct {
	pool        *pgxpool.Pool
	partyCache  map[string]int // short_name -> id
	stateCache  map[string]int // code        -> id
}

// New opens a pgxpool against the given connection string and warms caches.
func New(ctx context.Context, dsn string) (*Store, error) {
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("pgxpool new: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping: %w", err)
	}
	return &Store{
		pool:       pool,
		partyCache: make(map[string]int),
		stateCache: make(map[string]int),
	}, nil
}

// Close releases the pool.
func (s *Store) Close() {
	s.pool.Close()
}

// UpsertPolitician writes a single politician plus its cases in one transaction.
// On conflict by myneta_id, the row is updated and its cases are replaced.
func (s *Store) UpsertPolitician(ctx context.Context, p *models.Politician) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin: %w", err)
	}
	defer tx.Rollback(ctx)

	partyID, err := s.ensureParty(ctx, tx, p.PartyShortName, p.PartyFullName)
	if err != nil {
		return fmt.Errorf("ensure party: %w", err)
	}
	stateID, err := s.ensureState(ctx, tx, p.StateCode, p.StateName)
	if err != nil {
		return fmt.Errorf("ensure state: %w", err)
	}

	var politicianID int
	err = tx.QueryRow(ctx, `
		INSERT INTO politicians (
			myneta_id, name, photo_url, party_id, constituency, state_id,
			house, total_cases, serious_cases, is_convicted,
			assets_inr, liabilities_inr, education, age,
			affidavit_pdf_url, election_year, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9, $10,
			$11, $12, $13, $14,
			$15, $16, NOW()
		)
		ON CONFLICT (myneta_id) DO UPDATE SET
			name              = EXCLUDED.name,
			photo_url         = EXCLUDED.photo_url,
			party_id          = EXCLUDED.party_id,
			constituency      = EXCLUDED.constituency,
			state_id          = EXCLUDED.state_id,
			house             = EXCLUDED.house,
			total_cases       = EXCLUDED.total_cases,
			serious_cases     = EXCLUDED.serious_cases,
			is_convicted      = EXCLUDED.is_convicted,
			assets_inr        = EXCLUDED.assets_inr,
			liabilities_inr   = EXCLUDED.liabilities_inr,
			education         = EXCLUDED.education,
			age               = EXCLUDED.age,
			affidavit_pdf_url = EXCLUDED.affidavit_pdf_url,
			election_year     = EXCLUDED.election_year,
			updated_at        = NOW()
		RETURNING id
	`,
		p.MyNetaID, p.Name, nullIfEmpty(p.PhotoURL), nullIfZero(partyID),
		nullIfEmpty(p.Constituency), nullIfZero(stateID),
		string(p.House), p.TotalCases, p.SeriousCases, p.IsConvicted,
		p.AssetsINR, p.LiabilitiesINR, nullIfEmpty(p.Education), nullIfZero(p.Age),
		nullIfEmpty(p.AffidavitPDFURL), nullIfZero(p.ElectionYear),
	).Scan(&politicianID)
	if err != nil {
		return fmt.Errorf("upsert politician: %w", err)
	}

	// Replace cases — simpler and idempotent.
	if _, err := tx.Exec(ctx, `DELETE FROM criminal_cases WHERE politician_id = $1`, politicianID); err != nil {
		return fmt.Errorf("delete old cases: %w", err)
	}
	for _, c := range p.Cases {
		if _, err := tx.Exec(ctx, `
			INSERT INTO criminal_cases (politician_id, ipc_section, description, is_serious)
			VALUES ($1, $2, $3, $4)
		`, politicianID, nullIfEmpty(c.IPCSection), nullIfEmpty(c.Description), c.IsSerious); err != nil {
			return fmt.Errorf("insert case: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	return nil
}

func (s *Store) ensureParty(ctx context.Context, tx pgx.Tx, shortName, fullName string) (int, error) {
	shortName = strings.TrimSpace(shortName)
	if shortName == "" {
		return 0, nil
	}
	if id, ok := s.partyCache[shortName]; ok {
		return id, nil
	}
	name := strings.TrimSpace(fullName)
	if name == "" {
		name = shortName
	}
	var id int
	err := tx.QueryRow(ctx, `
		INSERT INTO parties (name, short_name)
		VALUES ($1, $2)
		ON CONFLICT (short_name) DO UPDATE SET name = EXCLUDED.name
		RETURNING id
	`, name, shortName).Scan(&id)
	if err != nil {
		return 0, err
	}
	s.partyCache[shortName] = id
	return id, nil
}

func (s *Store) ensureState(ctx context.Context, tx pgx.Tx, code, name string) (int, error) {
	code = strings.TrimSpace(strings.ToUpper(code))
	name = strings.TrimSpace(name)
	if code == "" && name == "" {
		return 0, nil
	}
	if code == "" {
		code = deriveStateCode(name)
	}
	if id, ok := s.stateCache[code]; ok {
		return id, nil
	}
	if name == "" {
		name = code
	}
	var id int
	err := tx.QueryRow(ctx, `
		INSERT INTO states (name, code)
		VALUES ($1, $2)
		ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
		RETURNING id
	`, name, code).Scan(&id)
	if err != nil {
		return 0, err
	}
	s.stateCache[code] = id
	return id, nil
}

// deriveStateCode builds a short code from a full state name when the source
// does not supply one. Example: "Uttar Pradesh" -> "UP".
func deriveStateCode(name string) string {
	fields := strings.Fields(name)
	if len(fields) == 0 {
		return ""
	}
	if len(fields) == 1 {
		if len(fields[0]) >= 3 {
			return strings.ToUpper(fields[0][:3])
		}
		return strings.ToUpper(fields[0])
	}
	var b strings.Builder
	for _, f := range fields {
		if f == "" {
			continue
		}
		b.WriteByte(f[0])
	}
	code := strings.ToUpper(b.String())
	if len(code) > 5 {
		code = code[:5]
	}
	return code
}

func nullIfEmpty(s string) any {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return s
}

func nullIfZero(n int) any {
	if n == 0 {
		return nil
	}
	return n
}
