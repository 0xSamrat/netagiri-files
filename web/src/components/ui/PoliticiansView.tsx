"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { BubbleChart } from "@/components/charts/BubbleChart";
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

  return (
    <div className="space-y-4">
      {/* Bubble chart */}
      <BubbleChart
        data={bubbleData ?? []}
        onPartyClick={handlePartyClick}
        selectedParty={party || undefined}
      />

      {/* Filters */}
      <FilterBar
        house={house}
        parties={parties}
        states={states}
        currentParty={party}
        currentState={state}
        currentCrimeType={crimeType || "all"}
        currentSort={sort || "total_cases"}
      />

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center text-red-500 py-8 text-sm">
          Failed to load data. Please try again.
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-400 px-1">
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
  );
}
