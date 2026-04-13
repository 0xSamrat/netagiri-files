package models

// House is the legislative house a politician belongs to.
type House string

const (
	HouseLokSabha   House = "lok_sabha"
	HouseRajyaSabha House = "rajya_sabha"
)

// Politician is the canonical scraped record. Keyed on MyNetaID for upsert.
type Politician struct {
	MyNetaID        int
	Name            string
	PhotoURL        string
	PartyShortName  string
	PartyFullName   string
	Constituency    string
	StateName       string
	StateCode       string
	House           House
	TotalCases      int
	SeriousCases    int
	IsConvicted     bool
	AssetsINR       int64
	LiabilitiesINR  int64
	Education       string
	Age             int
	AffidavitPDFURL string
	ElectionYear    int
	Cases           []CriminalCase
}

// CriminalCase is one declared charge against a politician.
type CriminalCase struct {
	IPCSection  string
	Description string
	IsSerious   bool
}

// CandidateRef is a lightweight row from the list page used to drive workers.
type CandidateRef struct {
	MyNetaID int
	URL      string
}
