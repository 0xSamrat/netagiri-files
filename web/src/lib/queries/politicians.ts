import "server-only";
import { db } from "@/lib/db";
import type {
  House,
  Paginated,
  PoliticianDetail,
  PoliticianSummary,
  CriminalCase,
} from "@/types";

export interface PoliticianListParams {
  house: House;
  party?: string;
  state?: string;
  crimeType?: "all" | "serious";
  sort?: "total_cases" | "serious_cases" | "assets" | "name";
  page: number;
  pageSize: number;
}

const SUMMARY_COLS = `
  id, myneta_id, name, photo_url, constituency, house,
  total_cases, serious_cases, is_convicted,
  assets_inr::text AS assets_inr,
  liabilities_inr::text AS liabilities_inr,
  education, affidavit_pdf_url,
  party_id, party_short_name, party_name, party_color,
  state_name, state_code
`;

export async function listPoliticians(
  p: PoliticianListParams,
): Promise<Paginated<PoliticianSummary>> {
  const where: string[] = ["house = $1"];
  const args: unknown[] = [p.house];
  let i = 2;

  if (p.party) {
    where.push(`party_short_name = $${i++}`);
    args.push(p.party);
  }
  if (p.state) {
    where.push(`state_code = $${i++}`);
    args.push(p.state);
  }
  if (p.crimeType === "serious") {
    where.push("serious_cases > 0");
  }

  const sortCol =
    p.sort === "serious_cases"
      ? "serious_cases DESC, total_cases DESC"
      : p.sort === "assets"
        ? "assets_inr DESC"
        : p.sort === "name"
          ? "name ASC"
          : "total_cases DESC, serious_cases DESC";

  const whereSQL = where.join(" AND ");
  const offset = (p.page - 1) * p.pageSize;

  const [rows, count] = await Promise.all([
    db.query<PoliticianSummary>(
      `SELECT ${SUMMARY_COLS}
       FROM politician_summary
       WHERE ${whereSQL}
       ORDER BY ${sortCol}
       LIMIT $${i++} OFFSET $${i++}`,
      [...args, p.pageSize, offset],
    ),
    db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM politician_summary WHERE ${whereSQL}`,
      args,
    ),
  ]);

  return {
    data: rows.rows,
    page: p.page,
    page_size: p.pageSize,
    total: parseInt(count.rows[0]?.count ?? "0", 10),
  };
}

export async function getBubbleData(house: House): Promise<PoliticianSummary[]> {
  const { rows } = await db.query<PoliticianSummary>(
    `SELECT ${SUMMARY_COLS}
     FROM politician_summary
     WHERE house = $1 AND total_cases > 0
     ORDER BY total_cases DESC`,
    [house],
  );
  return rows;
}

export async function getPoliticianById(
  id: number,
): Promise<PoliticianDetail | null> {
  const { rows } = await db.query(
    `SELECT ps.*,
            ps.assets_inr::text       AS assets_inr,
            ps.liabilities_inr::text  AS liabilities_inr,
            p.age
     FROM politician_summary ps
     JOIN politicians p ON p.id = ps.id
     WHERE ps.id = $1`,
    [id],
  );
  if (rows.length === 0) return null;
  const base = rows[0];

  const cases = await db.query<CriminalCase>(
    `SELECT id, ipc_section, description, is_serious, case_status
     FROM criminal_cases
     WHERE politician_id = $1
     ORDER BY is_serious DESC, ipc_section`,
    [id],
  );

  const pct = await db.query<{
    p_party: string | null;
    p_state: string | null;
    p_national: string | null;
  }>(
    `WITH me AS (
       SELECT total_cases, party_id, state_id, house FROM politicians WHERE id = $1
     )
     SELECT
       ROUND(100.0 * (SELECT COUNT(*) FROM politicians p, me
                      WHERE p.party_id = me.party_id AND p.house = me.house
                      AND p.total_cases <= me.total_cases)
             / NULLIF((SELECT COUNT(*) FROM politicians p, me
                       WHERE p.party_id = me.party_id AND p.house = me.house), 0), 1)::text AS p_party,
       ROUND(100.0 * (SELECT COUNT(*) FROM politicians p, me
                      WHERE p.state_id = me.state_id AND p.house = me.house
                      AND p.total_cases <= me.total_cases)
             / NULLIF((SELECT COUNT(*) FROM politicians p, me
                       WHERE p.state_id = me.state_id AND p.house = me.house), 0), 1)::text AS p_state,
       ROUND(100.0 * (SELECT COUNT(*) FROM politicians p, me
                      WHERE p.house = me.house AND p.total_cases <= me.total_cases)
             / NULLIF((SELECT COUNT(*) FROM politicians p, me
                       WHERE p.house = me.house), 0), 1)::text AS p_national`,
    [id],
  );

  const row = pct.rows[0];
  return {
    ...(base as PoliticianSummary),
    age: base.age ?? null,
    cases: cases.rows,
    percentile_party: row?.p_party ? parseFloat(row.p_party) : null,
    percentile_state: row?.p_state ? parseFloat(row.p_state) : null,
    percentile_national: row?.p_national ? parseFloat(row.p_national) : null,
  };
}

export async function listAllPoliticianIds(): Promise<number[]> {
  const { rows } = await db.query<{ id: number }>(
    `SELECT id FROM politicians ORDER BY id`,
  );
  return rows.map((r) => r.id);
}

export async function searchPoliticians(
  q: string,
  limit = 20,
): Promise<PoliticianSummary[]> {
  const { rows } = await db.query<PoliticianSummary>(
    `SELECT ${SUMMARY_COLS}
     FROM politician_summary
     WHERE name ILIKE $1 OR constituency ILIKE $1
     ORDER BY total_cases DESC
     LIMIT $2`,
    [`%${q}%`, limit],
  );
  return rows;
}
