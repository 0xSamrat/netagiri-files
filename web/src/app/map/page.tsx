import type { Metadata } from "next";
import { getStateStats } from "@/lib/queries/stats";
import { MapView } from "./MapView";

export const metadata: Metadata = {
  title: "India Map — NetaWatch",
  description:
    "Choropleth map showing the percentage of Lok Sabha MPs with declared criminal cases, by state.",
};

export default async function MapPage() {
  const stats = await getStateStats("lok_sabha");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">India Map</h1>
        <p className="text-sm text-gray-500 mt-1">
          Percentage of elected Lok Sabha MPs (2024) who have declared criminal
          cases in their ECI affidavit. Click a state for details.
        </p>
      </div>
      <MapView stats={stats} />
    </div>
  );
}
