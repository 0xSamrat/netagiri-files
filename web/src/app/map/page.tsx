import type { Metadata } from "next";
import { getStateStats } from "@/lib/queries/stats";
import { StatsCard } from "@/components/ui/StatsCard";
import { MapView } from "./MapView";

export const metadata: Metadata = {
  title: "India Map — NetaGirifiles",
  description:
    "Hex-grid map showing the percentage of Lok Sabha MPs with declared criminal cases, by state.",
};

export const revalidate = 86400;

export default async function MapPage() {
  const stats = await getStateStats("lok_sabha");

  const totalMps = stats.reduce((sum, s) => sum + Number(s.total_mps), 0);
  const totalWithCases = stats.reduce(
    (sum, s) => sum + Number(s.mps_with_cases),
    0,
  );
  const nationalPct =
    totalMps > 0 ? Math.round((totalWithCases / totalMps) * 100) : 0;

  const topState = [...stats]
    .filter((s) => s.pct_with_cases !== null && s.total_mps >= 5)
    .sort((a, b) => (b.pct_with_cases ?? 0) - (a.pct_with_cases ?? 0))[0];

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
              Geography
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">India Map</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Percentage of elected Lok Sabha MPs (2024) who have declared
              criminal cases in their ECI affidavit. Click a state for details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatsCard
            label="States Covered"
            value={stats.length}
            sub={`${totalMps} MPs total`}
          />
          <StatsCard
            label="MPs with Cases"
            value={totalWithCases}
            accent
            sub="declared in affidavits"
          />
          <StatsCard
            label="National Average"
            value={`${nationalPct}%`}
            accent
            sub="of Lok Sabha MPs"
          />
          <StatsCard
            label="Highest State"
            value={topState ? `${topState.pct_with_cases}%` : "—"}
            sub={topState?.name ?? "—"}
          />
        </div>

        <MapView stats={stats} />
      </div>
    </div>
  );
}
