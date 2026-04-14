"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StateStat, PoliticianSummary, Paginated } from "@/types";

interface StateDetailPanelProps {
  stat: StateStat;
  onClose: () => void;
}

export function StateDetailPanel({ stat, onClose }: StateDetailPanelProps) {
  const [politicians, setPoliticians] = useState<PoliticianSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/v1/map/state/${encodeURIComponent(stat.code)}/politicians?page_size=5`
    )
      .then((r) => r.json())
      .then((d: Paginated<PoliticianSummary>) => {
        if (!cancelled) {
          setPoliticians(d.data ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPoliticians([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [stat.code]);

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b0f23] backdrop-blur-md p-5 space-y-4 shadow-xl shadow-black/40">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">{stat.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {stat.total_mps} Lok Sabha MP{stat.total_mps !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 text-lg leading-none mt-0.5"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg px-2 py-2 bg-white/5 border border-white/5">
          <div className="text-lg font-bold text-white">{stat.total_mps}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Total
          </div>
        </div>
        <div className="rounded-lg px-2 py-2 bg-[#ff2d87]/10 border border-[#ff2d87]/20">
          <div className="text-lg font-bold text-[#ff2d87] tabular-nums">
            {stat.mps_with_cases}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            With Cases
          </div>
        </div>
        <div className="rounded-lg px-2 py-2 bg-[#ff2d87]/10 border border-[#ff2d87]/20">
          <div className="text-lg font-bold text-[#ff2d87] tabular-nums">
            {stat.pct_with_cases !== null ? `${stat.pct_with_cases}%` : "—"}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            % Cases
          </div>
        </div>
      </div>

      {/* Top MPs */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Top MPs by criminal cases
        </p>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : politicians.length === 0 ? (
          <p className="text-sm text-slate-500">No data</p>
        ) : (
          <ul className="space-y-1">
            {politicians.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/politician/${p.myneta_id}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-white/5 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate group-hover:text-[#ff2d87]">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {p.party_short_name ?? "IND"} · {p.constituency ?? "—"}
                    </div>
                  </div>
                  {p.total_cases > 0 && (
                    <span className="flex-shrink-0 text-[10px] font-semibold text-[#ff2d87] bg-[#ff2d87]/10 border border-[#ff2d87]/20 px-2 py-0.5 rounded-full tabular-nums">
                      {p.total_cases}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* View all link */}
      <Link
        href={`/?state=${stat.code}`}
        className="block text-center text-xs text-[#ff2d87] hover:text-white font-medium pt-1"
      >
        View all MPs from {stat.name} →
      </Link>
    </div>
  );
}
