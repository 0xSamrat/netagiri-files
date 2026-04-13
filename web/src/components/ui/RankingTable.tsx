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
      <div className="text-center text-gray-400 py-16 text-sm">
        No politicians found matching your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
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
        <tbody className="divide-y divide-gray-100">
          {politicians.map((p, i) => (
            <tr
              key={p.id}
              className="hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 text-gray-400 font-mono">
                {startRank + i}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/politician/${p.id}`}
                  className="font-medium text-gray-900 hover:text-indigo-600"
                >
                  {p.name}
                </Link>
                {p.is_convicted && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                    Convicted
                  </span>
                )}
                <div className="text-xs text-gray-400 md:hidden">
                  {p.party_short_name}
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: p.party_color
                      ? `${p.party_color}22`
                      : "#f3f4f6",
                    color: p.party_color ?? "#374151",
                  }}
                >
                  {p.party_short_name ?? "IND"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                {p.constituency ?? "—"}
              </td>
              <td className="px-4 py-3 text-right font-semibold">
                {p.total_cases > 0 ? (
                  <span className="text-orange-600">{p.total_cases}</span>
                ) : (
                  <span className="text-gray-300">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-right hidden sm:table-cell">
                {p.serious_cases > 0 ? (
                  <span className="text-red-600 font-semibold">
                    {p.serious_cases}
                  </span>
                ) : (
                  <span className="text-gray-300">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-gray-500 hidden lg:table-cell font-mono text-xs">
                {formatAssets(p.assets_inr)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
