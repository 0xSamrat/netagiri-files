"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { StatsRail } from "@/components/ui/StatsRail";
import { FilterBar } from "@/components/ui/FilterBar";
import { RankingTable } from "@/components/ui/RankingTable";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { usePoliticians, useBubbleData } from "@/components/hooks/usePoliticians";
import type { House } from "@/types";

interface PoliticiansViewProps {
  house: House;
  parties: { short_name: string; name: string }[];
  states: { code: string; name: string }[];
  initialParty: string;
  initialState: string;
  initialCrimeType: string;
  initialSort: string;
  initialPage: number;
}

export function PoliticiansView({
  house,
  parties,
  states,
  initialParty,
  initialState,
  initialCrimeType,
  initialSort,
  initialPage,
}: PoliticiansViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const party = searchParams.get("party") ?? initialParty;
  const state = searchParams.get("state") ?? initialState;
  const crimeType = searchParams.get("crime_type") ?? initialCrimeType;
  const sort = searchParams.get("sort") ?? initialSort;
  const page = Number(searchParams.get("page") ?? initialPage);

  const setPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(p));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handlePartyClick = useCallback(
    (clickedParty: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("party") === clickedParty) {
        params.delete("party");
      } else {
        params.set("party", clickedParty);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const { data: bubbleData } = useBubbleData(house);
  const { data, isLoading, isError } = usePoliticians({
    house,
    party: party || undefined,
    state: state || undefined,
    crimeType: crimeType || undefined,
    sort: sort || undefined,
    page,
  });

  const pageSize = 20;
  const startRank = (page - 1) * pageSize + 1;

  const allBubble = bubbleData ?? [];
  const totalMps = allBubble.length;
  const mpsWithCases = allBubble.filter((p) => p.total_cases > 0).length;
  const totalCases = allBubble.reduce((s, p) => s + p.total_cases, 0);

  return (
    <div className="space-y-6">
      {/* Hero dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left rail */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <StatsRail
            data={allBubble}
            onPartyClick={handlePartyClick}
            selectedParty={party || undefined}
          />
        </aside>

        {/* Main stage */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-4">
          <BubbleChart
            data={allBubble}
            onPartyClick={handlePartyClick}
            selectedParty={party || undefined}
          />
          {/* Bottom 3 stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Total MPs" value={totalMps} accent="#60a5fa" />
            <StatBox
              label="With Cases"
              value={mpsWithCases}
              accent="#f59e0b"
            />
            <StatBox
              label="Total Cases"
              value={totalCases}
              accent="#f43f5e"
            />
          </div>
        </section>
      </div>

      {/* Filters + table */}
      <div className="space-y-4">
        <FilterBar
          house={house}
          parties={parties}
          states={states}
          currentParty={party}
          currentState={state}
          currentCrimeType={crimeType || "all"}
          currentSort={sort || "total_cases"}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <div className="text-center text-rose-400 py-8 text-sm">
            Failed to load data. Please try again.
          </div>
        ) : (
          <>
            <div className="text-[11px] text-slate-500 px-1 uppercase tracking-wider">
              {data?.total ?? 0} politicians found
            </div>
            <RankingTable
              politicians={data?.data ?? []}
              startRank={startRank}
            />
            <Pagination
              page={page}
              total={data?.total ?? 0}
              pageSize={pageSize}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/5 bg-[#0a0f24]/80 backdrop-blur-md px-5 py-4 relative overflow-hidden"
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 32px ${accent}10`,
      }}
    >
      <div
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
          {label}
        </div>
        <div
          className="text-3xl font-bold tabular-nums mt-1"
          style={{ color: accent }}
        >
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
