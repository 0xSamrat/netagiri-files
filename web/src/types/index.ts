export type House = "lok_sabha" | "rajya_sabha";

export interface PoliticianSummary {
  id: number;
  myneta_id: number;
  name: string;
  photo_url: string | null;
  constituency: string | null;
  house: House;
  total_cases: number;
  serious_cases: number;
  is_convicted: boolean;
  assets_inr: string;
  liabilities_inr: string;
  education: string | null;
  affidavit_pdf_url: string | null;
  party_id: number | null;
  party_short_name: string | null;
  party_name: string | null;
  party_color: string | null;
  state_name: string | null;
  state_code: string | null;
}

export interface CriminalCase {
  id: number;
  ipc_section: string | null;
  description: string | null;
  is_serious: boolean;
  case_status: "pending" | "convicted" | "acquitted";
}

export interface PoliticianDetail extends PoliticianSummary {
  age: number | null;
  cases: CriminalCase[];
  percentile_party: number | null;
  percentile_state: number | null;
  percentile_national: number | null;
}

export interface PartyStat {
  id: number;
  name: string;
  short_name: string;
  color_hex: string;
  house: House;
  total_mps: number;
  mps_with_cases: number;
  mps_with_serious_cases: number;
  total_cases_sum: number;
}

export interface StateStat {
  id: number;
  name: string;
  code: string;
  house: House;
  total_mps: number;
  mps_with_cases: number;
  mps_with_serious_cases: number;
  pct_with_cases: number | null;
}

export interface OverviewStats {
  lok_sabha_with_cases: number;
  rajya_sabha_with_cases: number;
  total_serious_cases: number;
  total_convicted: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
}
