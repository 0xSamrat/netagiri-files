import { Suspense } from "react";
import type { Metadata } from "next";
import { listAllParties, listAllStates } from "@/lib/queries/stats";
import { PoliticiansView } from "@/components/ui/PoliticiansView";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const metadata: Metadata = {
  title: "NetaWatch — Lok Sabha Criminal Records",
  description:
    "Criminal cases self-declared by Lok Sabha MPs in their ECI affidavits.",
};

interface PageProps {
  searchParams: Promise<{
    party?: string;
    state?: string;
    crime_type?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const [parties, states] = await Promise.all([
    listAllParties("lok_sabha"),
    listAllStates("lok_sabha"),
  ]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
              Overview
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Lok Sabha 2024
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Criminal cases self-declared by Members of Parliament in their
              ECI election affidavits.
            </p>
          </div>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <PoliticiansView
            house="lok_sabha"
            parties={parties}
            states={states}
            initialParty={sp.party ?? ""}
            initialState={sp.state ?? ""}
            initialCrimeType={sp.crime_type ?? "all"}
            initialSort={sp.sort ?? "total_cases"}
            initialPage={Number(sp.page ?? 1)}
          />
        </Suspense>
      </div>
    </div>
  );
}
