"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { CriminalCase } from "@/types";

interface CaseBreakdownProps {
  cases: CriminalCase[];
  totalCases: number;
}

interface SectionCount {
  section: string;
  count: number;
  serious: boolean;
}

export function CaseBreakdown({ cases, totalCases }: CaseBreakdownProps) {
  const chartRef = useRef<SVGSVGElement>(null);

  const bySection = new Map<string, SectionCount>();
  for (const c of cases) {
    const sec = c.ipc_section ?? "Unknown";
    const existing = bySection.get(sec);
    if (existing) {
      existing.count++;
    } else {
      bySection.set(sec, { section: sec, count: 1, serious: c.is_serious });
    }
  }
  const sections: SectionCount[] = [...bySection.values()].sort(
    (a, b) => b.count - a.count,
  );

  useEffect(() => {
    if (!chartRef.current || sections.length === 0) return;
    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 8, right: 40, bottom: 8, left: 90 };
    const rowH = 28;
    const width = chartRef.current.clientWidth || 400;
    const height = sections.length * rowH + margin.top + margin.bottom;

    svg.attr("height", height);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(sections, (d) => d.count) ?? 1])
      .range([0, width - margin.left - margin.right]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const row = g
      .selectAll(".row")
      .data(sections)
      .join("g")
      .attr("class", "row")
      .attr("transform", (_, i) => `translate(0,${i * rowH})`);

    row
      .append("text")
      .attr("x", -6)
      .attr("y", rowH / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size", 11)
      .attr("fill", (d) => (d.serious ? "#ff2d87" : "#94a3b8"))
      .attr("font-weight", (d) => (d.serious ? "600" : "400"))
      .text((d) => `IPC ${d.section}`);

    row
      .append("rect")
      .attr("y", 6)
      .attr("height", rowH - 12)
      .attr("rx", 3)
      .attr("width", (d) => x(d.count))
      .attr("fill", (d) => (d.serious ? "#ff2d87" : "#334155"))
      .attr("opacity", (d) => (d.serious ? 0.85 : 0.7));

    row
      .append("text")
      .attr("x", (d) => x(d.count) + 4)
      .attr("y", rowH / 2)
      .attr("dy", "0.35em")
      .attr("font-size", 11)
      .attr("fill", "#64748b")
      .text((d) => d.count);
  }, [sections]);

  if (totalCases === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#0b0f23] p-6 backdrop-blur-md">
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-4">
          Declared Cases
        </h2>
        <p className="text-sm text-slate-500 text-center py-8">
          No cases declared in affidavit.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b0f23] p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em]">
          Declared Cases
        </span>
        <span className="text-[10px] text-slate-600 uppercase tracking-[0.14em]">
          {totalCases} declared
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Aggregated by IPC section from the ECI affidavit
        {cases.some((c) => c.is_serious) && (
          <span className="ml-2 text-[#ff2d87] font-medium">
            · Pink = serious
          </span>
        )}
      </p>

      {sections.length > 0 && (
        <svg
          ref={chartRef}
          className="w-full mb-6"
          style={{ overflow: "visible" }}
        />
      )}

      <div className="space-y-2">
        {cases.map((c, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-lg p-3 text-sm border ${
              c.is_serious
                ? "bg-[#ff2d87]/5 border-[#ff2d87]/15"
                : "bg-white/[0.03] border-white/5"
            }`}
          >
            <span
              className={`flex-shrink-0 font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${
                c.is_serious
                  ? "bg-[#ff2d87]/15 text-[#ff2d87] border-[#ff2d87]/25"
                  : "bg-white/5 text-slate-300 border-white/10"
              }`}
            >
              {c.ipc_section ?? "—"}
            </span>
            <div className="min-w-0">
              <div className="text-slate-300">
                {c.description || "No description provided"}
              </div>
              <div className="flex gap-2 mt-1">
                {c.is_serious && (
                  <span className="text-[10px] text-[#ff2d87] font-medium uppercase tracking-wider">
                    Serious
                  </span>
                )}
                <span
                  className={`text-[10px] capitalize uppercase tracking-wider ${
                    c.case_status === "convicted"
                      ? "text-rose-300 font-semibold"
                      : "text-slate-600"
                  }`}
                >
                  {c.case_status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
