package parser

import (
	"os"
	"testing"

	"github.com/samratmukherjee/netawatch/scraper/internal/models"
)

func TestParseListPage(t *testing.T) {
	body, err := os.ReadFile("testdata_list.html")
	if err != nil {
		t.Fatal(err)
	}
	refs, err := ParseListPage(body, "https://www.myneta.info/LokSabha2024")
	if err != nil {
		t.Fatal(err)
	}
	if len(refs) != 485 {
		t.Errorf("expected 485 unique refs, got %d", len(refs))
	}
	for _, r := range refs[:3] {
		if r.MyNetaID == 0 || r.URL == "" {
			t.Errorf("incomplete ref: %+v", r)
		}
	}
}

func TestParseCandidatePage(t *testing.T) {
	body, err := os.ReadFile("testdata_candidate.html")
	if err != nil {
		t.Fatal(err)
	}
	p, err := ParseCandidatePage(body, 5328, models.HouseLokSabha,
		"https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=5328")
	if err != nil {
		t.Fatal(err)
	}

	checks := []struct {
		field string
		got   any
		want  any
	}{
		{"MyNetaID", p.MyNetaID, 5328},
		{"House", p.House, models.HouseLokSabha},
		{"PartyShortName", p.PartyShortName, "NCP(SP)"},
		{"Age", p.Age, 44},
		{"TotalCases", p.TotalCases, 2},
		{"AssetsINR", p.AssetsINR, int64(4554561)},
		{"LiabilitiesINR", p.LiabilitiesINR, int64(17881176)},
	}
	for _, c := range checks {
		if c.got != c.want {
			t.Errorf("%s: got %v, want %v", c.field, c.got, c.want)
		}
	}

	if p.Name == "" {
		t.Error("Name empty")
	}
	if p.Constituency == "" {
		t.Error("Constituency empty")
	}
	if p.StateName == "" {
		t.Error("StateName empty")
	}
	if p.PhotoURL == "" {
		t.Error("PhotoURL empty")
	}
	if p.Education == "" {
		t.Error("Education empty")
	}
	if len(p.Cases) == 0 {
		t.Error("no cases parsed")
	}
	if p.IsConvicted {
		t.Error("should not be convicted (convicted table shows No Cases)")
	}

	t.Logf("parsed: %+v", p)
	for i, c := range p.Cases {
		t.Logf("case[%d]: %+v", i, c)
	}
}
