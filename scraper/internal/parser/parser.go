// Package parser extracts politicians from myneta.info HTML.
//
// Two entry points:
//   - ParseListPage returns every unique candidate link on a winners list page.
//   - ParseCandidatePage returns a fully populated Politician from a candidate
//     detail page.
//
// Selectors are grounded in the live markup observed on LokSabha2024 pages —
// see the project plan for source URLs. The parser is deliberately lenient:
// missing fields become zero values rather than errors, so one malformed
// detail page does not abort a full crawl.
package parser

import (
	"bytes"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"

	"github.com/samratmukherjee/netawatch/scraper/internal/models"
)

// seriousIPC is the set of "serious" IPC sections flagged by ADR's methodology.
// Kept in sync with db/seed/ipc_sections.sql.
var seriousIPC = map[string]bool{
	"302":  true, // murder
	"307":  true, // attempt to murder
	"376":  true, // rape
	"354":  true, // assault on woman
	"363":  true, // kidnapping
	"420":  true, // cheating
	"498A": true, // cruelty by husband
	"395":  true, // dacoity
	"153A": true, // promoting enmity
}

var (
	candidateIDRE = regexp.MustCompile(`candidate_id=(\d+)`)
	// "AHMEDNAGAR  (MAHARASHTRA)" → constituency, state
	constStateRE = regexp.MustCompile(`^\s*(.+?)\s*\(([^)]+)\)\s*$`)
	// Inside case rows: IPC Section-188, IPC Sections 498A / 420 etc.
	ipcSectionRE = regexp.MustCompile(`(?i)IPC\s*Section[s]?[-\s]*([\dA-Za-z,\s/]+)`)
	// For splitting multiple sections: "188, 341", "498A/506"
	ipcSplitRE = regexp.MustCompile(`[,\s/]+`)
	// Money strings like "Rs 1,78,81,176" — strip everything non-digit.
	nonDigitRE = regexp.MustCompile(`[^\d]`)
	// "Number of Criminal Cases: <span style='font-weight:bold'>2</span>"
	totalCasesRE = regexp.MustCompile(`Number of Criminal Cases:\s*<span[^>]*>\s*(\d+)\s*</span>`)
)

// ParseListPage is kept for interface compatibility but is no longer used.
// Lok Sabha 2024 list pages render their tables via obfuscated JavaScript,
// so we now discover candidates via constituency pages instead.
// Returns an empty slice without error.
func ParseListPage(_ []byte, _ string) ([]models.CandidateRef, error) {
	return nil, nil
}

// ParseConstituencyPage extracts the winner's candidate ref from a static
// constituency candidates page (?action=show_candidates&constituency_id=N).
// Each constituency has exactly one winner, marked with "Winner" in the row.
func ParseConstituencyPage(body []byte, basePath string) (models.CandidateRef, bool) {
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(body))
	if err != nil {
		return models.CandidateRef{}, false
	}

	var found models.CandidateRef
	doc.Find(`a[href*="candidate.php?candidate_id="]`).Each(func(_ int, s *goquery.Selection) {
		if found.MyNetaID != 0 {
			return // already found
		}
		// The winner row contains a <font color=green> sibling with "Winner"
		parent := s.Parent()
		if !strings.Contains(parent.Text(), "Winner") {
			return
		}
		href, ok := s.Attr("href")
		if !ok {
			return
		}
		m := candidateIDRE.FindStringSubmatch(href)
		if len(m) < 2 {
			return
		}
		id, err := strconv.Atoi(m[1])
		if err != nil || id == 0 {
			return
		}
		found = models.CandidateRef{
			MyNetaID: id,
			URL:      fmt.Sprintf("%s/candidate.php?candidate_id=%d", strings.TrimRight(basePath, "/"), id),
		}
	})

	return found, found.MyNetaID != 0
}

// ParseCandidatePage extracts a Politician from a candidate detail page.
// sourceURL is stored as AffidavitPDFURL so the frontend can link back to
// myneta.info (ADR does not expose direct ECI PDF links).
func ParseCandidatePage(body []byte, id int, house models.House, sourceURL string) (*models.Politician, error) {
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("parse candidate html: %w", err)
	}

	p := &models.Politician{
		MyNetaID:        id,
		House:           house,
		AffidavitPDFURL: sourceURL,
		ElectionYear:    2024,
	}

	// Name: first <h2> inside the profile card. Strip "(Winner)" suffix.
	nameText := strings.TrimSpace(doc.Find("h2").First().Text())
	p.Name = cleanName(nameText)

	// Constituency + state: first <h5> reads "CONSTITUENCY  (STATE)".
	h5 := strings.TrimSpace(doc.Find("h5").First().Text())
	if m := constStateRE.FindStringSubmatch(h5); len(m) == 3 {
		p.Constituency = titleCase(strings.TrimSpace(m[1]))
		p.StateName = titleCase(strings.TrimSpace(m[2]))
	}

	// Photo: first <img alt="profile image">.
	if src, ok := doc.Find(`img[alt='profile image']`).First().Attr("src"); ok {
		p.PhotoURL = strings.TrimSpace(src)
	}

	// Key/value pairs: each "<b>Party:</b>" sits inside a leaf <div>. We grab
	// the parent div's direct text (excluding nested elements) as the value.
	doc.Find("b").Each(func(_ int, b *goquery.Selection) {
		label := strings.TrimSuffix(strings.TrimSpace(b.Text()), ":")
		parent := b.Parent()
		// Clone parent, drop nested <b>, read remaining text.
		clone := parent.Clone()
		clone.Find("b").Remove()
		val := strings.TrimSpace(clone.Text())
		switch label {
		case "Party":
			if p.PartyFullName == "" && val != "" {
				p.PartyFullName = val
				p.PartyShortName = shortenParty(val)
			}
		case "Age":
			if p.Age == 0 && val != "" {
				fields := strings.Fields(val)
				if len(fields) > 0 {
					if n, err := strconv.Atoi(fields[0]); err == nil {
						p.Age = n
					}
				}
			}
		}
	})

	// Total criminal cases: "Number of Criminal Cases: <span ...>2</span>".
	// Match via regex on the raw HTML — DOM traversal picks up wrapper divs.
	if m := totalCasesRE.FindSubmatch(body); len(m) == 2 {
		if v, err := strconv.Atoi(string(m[1])); err == nil {
			p.TotalCases = v
		}
	}

	// Assets + liabilities: rows "Assets:" / "Liabilities:" with <b>Rs ...</b>.
	doc.Find("tr").Each(func(_ int, s *goquery.Selection) {
		cells := s.Find("td")
		if cells.Length() < 2 {
			return
		}
		label := strings.TrimSpace(cells.Eq(0).Text())
		value := strings.TrimSpace(cells.Eq(1).Find("b").First().Text())
		switch {
		case strings.HasPrefix(label, "Assets"):
			if p.AssetsINR == 0 {
				p.AssetsINR = parseMoney(value)
			}
		case strings.HasPrefix(label, "Liabilities"):
			if p.LiabilitiesINR == 0 {
				p.LiabilitiesINR = parseMoney(value)
			}
		}
	})

	// Education: div holding the "Educational Details" heading.
	doc.Find("div").EachWithBreak(func(_ int, s *goquery.Selection) bool {
		if s.Find("h3").First().Text() != "Educational Details" {
			return true
		}
		full := strings.TrimSpace(s.Text())
		// Drop the heading itself, keep the remainder.
		full = strings.TrimSpace(strings.TrimPrefix(full, "Educational Details"))
		full = strings.ReplaceAll(full, "\n", " ")
		full = strings.Join(strings.Fields(full), " ")
		// First line usually "Category: Graduate"; keep it concise.
		if cat := extractCategory(full); cat != "" {
			p.Education = cat
		} else {
			p.Education = truncate(full, 120)
		}
		return false
	})

	// Criminal cases: parse the "Cases where Pending" and "Cases where
	// Convicted" tables. Each <tr> after the header becomes one CriminalCase.
	p.Cases, p.IsConvicted = extractCases(doc)
	if p.TotalCases == 0 {
		p.TotalCases = len(p.Cases)
	}
	for _, c := range p.Cases {
		if c.IsSerious {
			p.SeriousCases++
		}
	}

	return p, nil
}

// extractCases walks both pending and convicted case tables.
func extractCases(doc *goquery.Document) ([]models.CriminalCase, bool) {
	var cases []models.CriminalCase
	var convicted bool

	doc.Find("table#cases").Each(func(tableIdx int, tbl *goquery.Selection) {
		// Header row defines column layout. Pending has 11 cols including
		// FIR No; convicted has 10 (no FIR No). We locate IPC column by
		// matching header text rather than hard-coding an index.
		headers := tbl.Find("tr").First().Find("td")
		ipcCol := -1
		headers.Each(func(i int, td *goquery.Selection) {
			if strings.Contains(strings.ToLower(td.Text()), "ipc sections applicable") {
				ipcCol = i
			}
		})
		if ipcCol < 0 {
			return
		}

		tbl.Find("tr").Each(func(rowIdx int, row *goquery.Selection) {
			if rowIdx == 0 {
				return
			}
			cells := row.Find("td")
			if cells.Length() < ipcCol+1 {
				return
			}
			// "No Cases" placeholder row has a single colspan cell.
			if cells.Length() == 1 {
				return
			}
			ipcRaw := strings.TrimSpace(cells.Eq(ipcCol).Text())
			if ipcRaw == "" {
				return
			}
			sections := splitIPCSections(ipcRaw)
			if len(sections) == 0 {
				return
			}
			// One DB row per distinct section — easier to filter by crime type.
			isConvictedTable := tableIdx == 1
			for _, sec := range sections {
				cases = append(cases, models.CriminalCase{
					IPCSection:  sec,
					Description: "",
					IsSerious:   seriousIPC[sec],
				})
				if isConvictedTable {
					convicted = true
				}
			}
		})
	})

	return cases, convicted
}

// splitIPCSections turns "188, 341" or "498A/506" into ["188","341"] etc.
func splitIPCSections(raw string) []string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}
	parts := ipcSplitRE.Split(raw, -1)
	var out []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		// Filter out obvious junk — must start with a digit.
		if !isDigit(p[0]) {
			continue
		}
		out = append(out, p)
	}
	return out
}

func isDigit(b byte) bool { return b >= '0' && b <= '9' }

// cleanName strips "(Winner)" and collapses whitespace.
func cleanName(s string) string {
	s = strings.ReplaceAll(s, "(Winner)", "")
	s = strings.Join(strings.Fields(s), " ")
	return titleCase(s)
}

// parseMoney pulls a rupee integer out of "Rs 1,78,81,176" style strings.
func parseMoney(s string) int64 {
	digits := nonDigitRE.ReplaceAllString(s, "")
	if digits == "" {
		return 0
	}
	n, err := strconv.ParseInt(digits, 10, 64)
	if err != nil {
		return 0
	}
	return n
}

// titleCase lowercases an ALL-CAPS string and re-capitalises each word.
// Leaves already-mixed-case strings alone.
func titleCase(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return ""
	}
	if s != strings.ToUpper(s) {
		return s
	}
	words := strings.Fields(strings.ToLower(s))
	for i, w := range words {
		if len(w) == 0 {
			continue
		}
		words[i] = strings.ToUpper(w[:1]) + w[1:]
	}
	return strings.Join(words, " ")
}

// extractCategory pulls "Graduate" out of "Category: Graduate B.A. From...".
func extractCategory(full string) string {
	const prefix = "Category:"
	i := strings.Index(full, prefix)
	if i < 0 {
		return ""
	}
	rest := strings.TrimSpace(full[i+len(prefix):])
	// Take everything up to the next double space or period.
	for _, sep := range []string{"  ", ". ", " B.", " M.", " Ph."} {
		if j := strings.Index(rest, sep); j > 0 {
			return strings.TrimSpace(rest[:j])
		}
	}
	return truncate(rest, 60)
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return strings.TrimSpace(s[:n])
}

// shortenParty maps a full party name to its short form when obvious.
// Falls back to an acronym of capitalised words.
var partyShortMap = map[string]string{
	"Bharatiya Janata Party":                               "BJP",
	"Indian National Congress":                             "INC",
	"All India Trinamool Congress":                         "AITC",
	"Samajwadi Party":                                      "SP",
	"Dravida Munnetra Kazhagam":                            "DMK",
	"Telugu Desam":                                         "TDP",
	"Janata Dal (United)":                                  "JD(U)",
	"Shiv Sena (Uddhav Balasaheb Thackrey)":                "SHS(UBT)",
	"Shiv Sena":                                            "SHS",
	"Nationalist Congress Party":                           "NCP",
	"Nationalist Congress Party – Sharadchandra Pawar":     "NCP(SP)",
	"Rashtriya Janata Dal":                                 "RJD",
	"Communist Party of India  (Marxist)":                  "CPI(M)",
	"Communist Party of India":                             "CPI",
	"Aam Aadmi Party":                                      "AAP",
	"Yuvajana Sramika Rythu Congress Party":                "YSRCP",
	"Biju Janata Dal":                                      "BJD",
	"All India Majlis-E-Ittehadul Muslimeen":               "AIMIM",
	"Jammu & Kashmir National Conference":                  "JKNC",
	"Indian Union Muslim League":                           "IUML",
}

func shortenParty(full string) string {
	full = strings.TrimSpace(full)
	if short, ok := partyShortMap[full]; ok {
		return short
	}
	// Fallback: acronym from capital letters + opening letters.
	var b strings.Builder
	for _, word := range strings.Fields(full) {
		if word == "" {
			continue
		}
		r := word[0]
		if r >= 'A' && r <= 'Z' {
			b.WriteByte(r)
		}
	}
	if b.Len() >= 2 && b.Len() <= 8 {
		return b.String()
	}
	return truncate(full, 16)
}
