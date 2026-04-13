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
  title: "Rajya Sabha — NetaWatch",
  description:
    "Criminal records of Rajya Sabha MPs declared in ECI affidavits.",
};

export default async function RajyaSabhaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const [parties, states] = await Promise.all([
    listAllParties("rajya_sabha"),
    listAllStates("rajya_sabha"),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rajya Sabha</h1>
        <p className="text-sm text-gray-500 mt-1">
          Criminal cases self-declared by Members of Parliament in ECI
          affidavits
        </p>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <PoliticiansView
          house="rajya_sabha"
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
