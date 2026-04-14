"use client";

import { useState } from "react";
import { IndiaMap } from "@/components/charts/IndiaMap";
import { StateDetailPanel } from "@/components/ui/StateDetailPanel";
import type { StateStat } from "@/types";

interface MapViewProps {
  stats: StateStat[];
}

export function MapView({ stats }: MapViewProps) {
  const [selected, setSelected] = useState<StateStat | null>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Map */}
      <div className="flex-1 min-w-0">
        <IndiaMap
          stats={stats}
          onStateClick={setSelected}
          selectedState={selected}
        />
      </div>

      {/* Side panel */}
      <div className="lg:w-80 flex-shrink-0">
        {selected ? (
          <StateDetailPanel
            stat={selected}
            onClose={() => setSelected(null)}
          />
        ) : (
          <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            Click a state on the map to see details
          </div>
        )}
      </div>
    </div>
  );
}
