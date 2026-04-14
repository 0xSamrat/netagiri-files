"use client";

import Link from "next/link";
import type { PoliticianSummary } from "@/types";

function formatAssets(raw: string): string {
  const n = Number(raw || "0");
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

interface RankingTableProps {
  politicians: PoliticianSummary[];
  startRank: number;
}

export function RankingTable({ politicians, startRank }: RankingTableProps) {
  if (politicians.length === 0) {
    return (
      <div className="text-center text-slate-500 py-16 text-sm rounded-2xl border border-white/5 bg-[#0b0f23]">
        No politicians found matching your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0b0f23] backdrop-blur-md">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-[10px] uppercase tracking-[0.18em] border-b border-white/5">
            <th className="px-4 py-3 text-left w-12">#</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Party</th>
            <th className="px-4 py-3 text-left hidden lg:table-cell">
              Constituency
            </th>
            <th className="px-4 py-3 text-right">Cases</th>
            <th className="px-4 py-3 text-right hidden sm:table-cell">
              Serious
            </th>
            <th className="px-4 py-3 text-right hidden lg:table-cell">
              Assets
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {politicians.map((p, i) => (
            <tr
              key={p.id}
              className="hover:bg-white/5 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 text-slate-600 font-mono">
                {startRank + i}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/politician/${p.id}`}
                  className="font-medium text-slate-100 hover:text-[#ff2d87]"
                >
                  {p.name}
                </Link>
                {p.is_convicted && (
                  <span className="ml-2 text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/20 px-1.5 py-0.5 rounded font-medium">
                    Convicted
                  </span>
                )}
                <div className="text-[10px] text-slate-500 md:hidden">
                  {p.party_short_name}
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border"
                  style={{
                    backgroundColor: p.party_color
                      ? `${p.party_color}22`
                      : "rgba(255,255,255,0.05)",
                    color: p.party_color ?? "#cbd5e1",
                    borderColor: p.party_color
                      ? `${p.party_color}55`
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  {p.party_short_name ?? "IND"}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">
                {p.constituency ?? "—"}
              </td>
              <td className="px-4 py-3 text-right font-semibold">
                {p.total_cases > 0 ? (
                  <span className="text-[#ff2d87]">{p.total_cases}</span>
                ) : (
                  <span className="text-slate-700">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-right hidden sm:table-cell">
                {p.serious_cases > 0 ? (
                  <span className="text-rose-400 font-semibold">
                    {p.serious_cases}
                  </span>
                ) : (
                  <span className="text-slate-700">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-slate-500 hidden lg:table-cell font-mono text-xs">
                {formatAssets(p.assets_inr)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
