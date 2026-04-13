import "server-only";
import { db } from "@/lib/db";
import type { House, OverviewStats, PartyStat, StateStat } from "@/types";

export async function getOverviewStats(): Promise<OverviewStats> {
  const { rows } = await db.query<OverviewStats>(
    `SELECT
       COUNT(*) FILTER (WHERE total_cases > 0) AS lok_sabha_with_cases,
       SUM(serious_cases) AS total_serious_cases,
       COUNT(*) FILTER (WHERE is_convicted = true) AS total_convicted
     FROM politician_summary`,
  );
  const r = rows[0];
  return {
    lok_sabha_with_cases: Number(r.lok_sabha_with_cases),
    total_serious_cases: Number(r.total_serious_cases),
    total_convicted: Number(r.total_convicted),
  };
}

export async function getPartyStats(house: House): Promise<PartyStat[]> {
  const { rows } = await db.query<PartyStat>(
    `SELECT id, name, short_name, color_hex, house,
            total_mps, mps_with_cases, mps_with_serious_cases, total_cases_sum
     FROM party_stats
     WHERE house = $1
     ORDER BY mps_with_cases DESC`,
    [house],
  );
  return rows;
}

export async function getStateStats(house: House): Promise<StateStat[]> {
  const { rows } = await db.query<StateStat>(
    `SELECT id, name, code, house,
            total_mps, mps_with_cases, mps_with_serious_cases, pct_with_cases
     FROM state_stats
     WHERE house = $1
     ORDER BY pct_with_cases DESC NULLS LAST`,
    [house],
  );
  return rows;
}

export async function listAllParties(
  house: House,
): Promise<{ id: number; short_name: string; name: string }[]> {
  const { rows } = await db.query<{
    id: number;
    short_name: string;
    name: string;
  }>(
    `SELECT id, short_name, name
     FROM parties
     WHERE id IN (SELECT DISTINCT party_id FROM politicians WHERE house = $1 AND party_id IS NOT NULL)
     ORDER BY short_name`,
    [house],
  );
  return rows;
}

export async function listAllStates(
  house: House,
): Promise<{ id: number; code: string; name: string }[]> {
  const { rows } = await db.query<{ id: number; code: string; name: string }>(
    `SELECT id, code, name
     FROM states
     WHERE id IN (SELECT DISTINCT state_id FROM politicians WHERE house = $1 AND state_id IS NOT NULL)
     ORDER BY name`,
    [house],
  );
  return rows;
}

export async function listIpcSections(): Promise<
  { section: string; description: string; is_serious: boolean }[]
> {
  const { rows } = await db.query<{
    section: string;
    description: string;
    is_serious: boolean;
  }>(
    `SELECT section, description, is_serious FROM ipc_sections ORDER BY is_serious DESC, section`,
  );
  return rows;
}
