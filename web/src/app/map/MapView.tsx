"use client";

import { useEffect, useState } from "react";
import { IndiaMap } from "@/components/charts/IndiaMap";
import { StateDetailPanel } from "@/components/ui/StateDetailPanel";
import type { StateStat } from "@/types";

interface MapViewProps {
  stats: StateStat[];
}

export function MapView({ stats }: MapViewProps) {
  const [selected, setSelected] = useState<StateStat | null>(null);

  // Lock body scroll when the mobile sheet is open
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (selected && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selected]);

  // Esc to close on mobile
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    if (selected) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

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

      {/* Desktop side panel */}
      <div className="hidden lg:block lg:w-80 flex-shrink-0">
        {selected ? (
          <StateDetailPanel
            stat={selected}
            onClose={() => setSelected(null)}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-500">
            Click a state on the map to see details
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close state details"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#060814] shadow-[0_-20px_60px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom duration-200 pb-[env(safe-area-inset-bottom)]">
            <div className="sticky top-0 flex justify-center pt-3 pb-2 bg-gradient-to-b from-[#060814] to-transparent">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <div className="px-4 pb-6">
              <StateDetailPanel
                stat={selected}
                onClose={() => setSelected(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
