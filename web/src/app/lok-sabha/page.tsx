import { Suspense } from "react";
import { listAllParties, listAllStates } from "@/lib/queries/stats";
import { PoliticiansView } from "@/components/ui/PoliticiansView";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface PageProps {
  searchParams: Promise<{
    party?: string;
    state?: string;
    crime_type?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Lok Sabha — NetaWatch",
  description: "Criminal records of Lok Sabha MPs declared in ECI affidavits.",
};

export default async function LokSabhaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const [parties, states] = await Promise.all([
    listAllParties("lok_sabha"),
    listAllStates("lok_sabha"),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lok Sabha</h1>
        <p className="text-sm text-gray-500 mt-1">
          Criminal cases self-declared by Members of Parliament in ECI
          affidavits (2024 General Election)
        </p>
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
  );
}
