"use client";

import { useMemo } from "react";
import * as d3 from "d3";
import type { PoliticianSummary } from "@/types";

interface StatsRailProps {
  data: PoliticianSummary[];
  onPartyClick?: (shortName: string) => void;
  selectedParty?: string;
}

interface PartyAgg {
  party: string;
  color: string;
  count: number;
  totalCases: number;
}

const DONUT_SIZE = 200;

export function StatsRail({
  data,
  onPartyClick,
  selectedParty,
}: StatsRailProps) {
  const { parties, totals } = useMemo(() => {
    const m = new Map<string, PartyAgg>();
    let totalMps = 0;
    let withCases = 0;
    let totalCases = 0;
    for (const p of data) {
      totalMps++;
      if (p.total_cases > 0) withCases++;
      totalCases += p.total_cases;
      const key = p.party_short_name ?? "IND";
      const cur = m.get(key);
      if (cur) {
        cur.count++;
        cur.totalCases += p.total_cases;
      } else {
        m.set(key, {
          party: key,
          color: p.party_color ?? "#6366f1",
          count: 1,
          totalCases: p.total_cases,
        });
      }
    }
    const sorted = Array.from(m.values()).sort(
      (a, b) => b.totalCases - a.totalCases,
    );
    return {
      parties: sorted,
      totals: { totalMps, withCases, totalCases },
    };
  }, [data]);

  const top = parties.slice(0, 5);
  const rest = parties.slice(5);
  const restTotal = rest.reduce((s, p) => s + p.totalCases, 0);
  const donutData: PartyAgg[] =
    restTotal > 0
      ? [
          ...top,
          {
            party: "Others",
            color: "#475569",
            count: rest.reduce((s, p) => s + p.count, 0),
            totalCases: restTotal,
          },
        ]
      : top;

  const pie = d3
    .pie<PartyAgg>()
    .value((d) => d.totalCases)
    .sort(null);
  const arcs = pie(donutData);
  const arcGen = d3
    .arc<d3.PieArcDatum<PartyAgg>>()
    .innerRadius(DONUT_SIZE / 2 - 28)
    .outerRadius(DONUT_SIZE / 2 - 6)
    .padAngle(0.015)
    .cornerRadius(4);

  const totalTopCases = top.reduce((s, p) => s + p.totalCases, 0) || 1;
  const withCasesPct =
    totals.totalMps > 0
      ? Math.round((totals.withCases / totals.totalMps) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Statistics / donut card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#0b0f23] to-[#080b1d] p-5 backdrop-blur-md">
        <div
          className="pointer-events-none absolute -top-24 -right-20 h-48 w-48 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,45,135,0.18) 0%, rgba(255,45,135,0) 70%)",
          }}
        />

        <div className="flex items-center justify-between mb-1 relative">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#ff2d87] font-semibold">
            Statistics
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-[0.14em]">
            Lok Sabha
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mb-3 relative">
          Criminal case distribution by party
        </div>

        <div className="relative flex items-center justify-center">
          <svg width={DONUT_SIZE} height={DONUT_SIZE} className="overflow-visible">
            <g transform={`translate(${DONUT_SIZE / 2},${DONUT_SIZE / 2})`}>
              {arcs.map((a, i) => {
                const dim = selectedParty && selectedParty !== a.data.party;
                return (
                  <path
                    key={i}
                    d={arcGen(a) ?? ""}
                    fill={a.data.color}
                    opacity={dim ? 0.2 : 0.95}
                    stroke="#0b0f23"
                    strokeWidth={2}
                    style={{
                      cursor: "pointer",
                      transition: "opacity 0.2s",
                      filter: dim
                        ? "none"
                        : `drop-shadow(0 0 6px ${a.data.color}55)`,
                    }}
                    onClick={() => onPartyClick?.(a.data.party)}
                  />
                );
              })}
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
              Total cases
            </span>
            <span className="text-3xl font-bold text-white tabular-nums leading-none mt-1">
              {totals.totalCases.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#ff2d87] font-semibold mt-1.5 tabular-nums">
              {withCasesPct}%
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">
              MPs with cases
            </span>
          </div>
        </div>

        {/* Summary pills */}
        <div className="mt-4 grid grid-cols-2 gap-2 relative">
          <div className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
              MPs
            </div>
            <div className="text-base font-bold text-white tabular-nums">
              {totals.totalMps}
            </div>
          </div>
          <div className="rounded-xl bg-[#ff2d87]/10 border border-[#ff2d87]/20 px-3 py-2">
            <div className="text-[9px] uppercase tracking-wider text-[#ff2d87]/80 font-semibold">
              Flagged
            </div>
            <div className="text-base font-bold text-[#ff2d87] tabular-nums">
              {totals.withCases}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] relative">
          {donutData.map((d) => {
            const pct = Math.round((d.totalCases / totals.totalCases) * 100);
            const isSel = selectedParty === d.party;
            return (
              <button
                key={d.party}
                onClick={() => onPartyClick?.(d.party)}
                className={`flex items-center gap-1.5 text-left min-w-0 transition-colors ${
                  isSel ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: d.color, boxShadow: `0 0 6px ${d.color}` }}
                />
                <span className="truncate flex-1">{d.party}</span>
                <span className="tabular-nums text-slate-500">{pct}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top parties card */}
      <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0b0f23] to-[#080b1d] p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#ff2d87] font-semibold">
            Top Parties
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-[0.14em]">
            by cases
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mb-4">
          Click a party to filter the list
        </div>
        <ul className="space-y-3">
          {top.map((p, idx) => {
            const pct = totalTopCases > 0 ? (p.totalCases / totalTopCases) * 100 : 0;
            const isSel = selectedParty === p.party;
            return (
              <li key={p.party}>
                <button
                  onClick={() => onPartyClick?.(p.party)}
                  className={`w-full text-left group rounded-xl px-2.5 py-2 -mx-2.5 transition-colors ${
                    isSel ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-lg text-[10px] font-bold tabular-nums"
                      style={{
                        background: isSel ? p.color : `${p.color}22`,
                        color: isSel ? "#0b0f23" : p.color,
                        boxShadow: isSel ? `0 0 10px ${p.color}88` : "none",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span
                          className={`text-[12px] font-semibold truncate ${
                            isSel ? "text-white" : "text-slate-200 group-hover:text-white"
                          }`}
                        >
                          {p.party}
                        </span>
                        <span className="text-[11px] font-bold text-white tabular-nums flex-shrink-0">
                          {p.totalCases}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${p.color}, ${p.color}cc)`,
                            boxShadow: `0 0 10px ${p.color}66`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                        <span>
                          {p.count} MP{p.count !== 1 ? "s" : ""}
                        </span>
                        <span className="tabular-nums">
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
