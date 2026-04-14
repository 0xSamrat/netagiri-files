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
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{stat.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {stat.total_mps} Lok Sabha MP{stat.total_mps !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none mt-0.5"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg px-2 py-2">
          <div className="text-lg font-bold text-gray-900">{stat.total_mps}</div>
          <div className="text-xs text-gray-500">Total MPs</div>
        </div>
        <div className="bg-orange-50 rounded-lg px-2 py-2">
          <div className="text-lg font-bold text-orange-600">
            {stat.mps_with_cases}
          </div>
          <div className="text-xs text-gray-500">With Cases</div>
        </div>
        <div className="bg-red-50 rounded-lg px-2 py-2">
          <div className="text-lg font-bold text-red-600">
            {stat.pct_with_cases !== null ? `${stat.pct_with_cases}%` : "—"}
          </div>
          <div className="text-xs text-gray-500">% With Cases</div>
        </div>
      </div>

      {/* Top MPs */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Top MPs by criminal cases
        </p>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : politicians.length === 0 ? (
          <p className="text-sm text-gray-400">No data</p>
        ) : (
          <ul className="space-y-1">
            {politicians.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/politician/${p.myneta_id}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600">
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {p.party_short_name ?? "IND"} · {p.constituency ?? "—"}
                    </div>
                  </div>
                  {p.total_cases > 0 && (
                    <span className="flex-shrink-0 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      {p.total_cases} case{p.total_cases !== 1 ? "s" : ""}
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
        href={`/lok-sabha?state=${stat.code}`}
        className="block text-center text-xs text-indigo-600 hover:text-indigo-800 font-medium pt-1"
      >
        View all MPs from {stat.name} →
      </Link>
    </div>
  );
}
