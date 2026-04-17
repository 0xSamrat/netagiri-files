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

const DONUT_SIZE = 180;

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
    .innerRadius(DONUT_SIZE / 2 - 26)
    .outerRadius(DONUT_SIZE / 2 - 4)
    .padAngle(0.02)
    .cornerRadius(3);

  const maxBarCases = top[0]?.totalCases ?? 1;

  return (
    <div className="space-y-4">
      {/* Donut card */}
      <div className="rounded-3xl border border-white/5 bg-[#0b0f23] p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
            Statistics
          </span>
          <span className="text-[10px] text-slate-600 uppercase tracking-[0.14em]">
            Lok Sabha
          </span>
        </div>

        <div className="relative flex items-center justify-center">
          <svg width={DONUT_SIZE} height={DONUT_SIZE}>
            <g transform={`translate(${DONUT_SIZE / 2},${DONUT_SIZE / 2})`}>
              {arcs.map((a, i) => (
                <path
                  key={i}
                  d={arcGen(a) ?? ""}
                  fill={a.data.color}
                  opacity={
                    selectedParty && selectedParty !== a.data.party ? 0.25 : 0.95
                  }
                  stroke="#0b0f23"
                  strokeWidth={2}
                  style={{ cursor: "pointer" }}
                  onClick={() => onPartyClick?.(a.data.party)}
                />
              ))}
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              Total cases
            </span>
            <span className="text-2xl font-bold text-white tabular-nums">
              {totals.totalCases.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {totals.withCases}/{totals.totalMps} MPs
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
          {donutData.map((d) => (
            <button
              key={d.party}
              onClick={() => onPartyClick?.(d.party)}
              className="flex items-center gap-1.5 text-left text-slate-400 hover:text-white transition-colors"
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: d.color }}
              />
              <span className="truncate">{d.party}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top parties bars */}
      <div className="rounded-3xl border border-white/5 bg-[#0b0f23] p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
            Top parties
          </span>
          <span className="text-[10px] text-slate-600 uppercase tracking-[0.14em]">
            by cases
          </span>
        </div>
        <ul className="space-y-3">
          {top.map((p) => {
            const pct = maxBarCases > 0 ? (p.totalCases / maxBarCases) * 100 : 0;
            const isSel = selectedParty === p.party;
            return (
              <li key={p.party}>
                <button
                  onClick={() => onPartyClick?.(p.party)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span
                      className={`font-semibold ${isSel ? "text-white" : "text-slate-300 group-hover:text-white"}`}
                    >
                      {p.party}
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      {p.totalCases}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${p.color}, ${p.color}aa)`,
                        boxShadow: `0 0 8px ${p.color}66`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    {p.count} MP{p.count !== 1 ? "s" : ""}
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
