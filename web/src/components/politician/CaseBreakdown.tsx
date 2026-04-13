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

  // Aggregate by IPC section
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

    // Label
    row
      .append("text")
      .attr("x", -6)
      .attr("y", rowH / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size", 11)
      .attr("fill", (d) => (d.serious ? "#dc2626" : "#374151"))
      .attr("font-weight", (d) => (d.serious ? "600" : "400"))
      .text((d) => `IPC ${d.section}`);

    // Bar
    row
      .append("rect")
      .attr("y", 6)
      .attr("height", rowH - 12)
      .attr("rx", 3)
      .attr("width", (d) => x(d.count))
      .attr("fill", (d) => (d.serious ? "#fca5a5" : "#a5b4fc"));

    // Count label
    row
      .append("text")
      .attr("x", (d) => x(d.count) + 4)
      .attr("y", rowH / 2)
      .attr("dy", "0.35em")
      .attr("font-size", 11)
      .attr("fill", "#6b7280")
      .text((d) => d.count);
  }, [sections]);

  if (totalCases === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Criminal Cases
        </h2>
        <p className="text-sm text-gray-400 text-center py-8">
          No criminal cases declared in affidavit.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">
        Criminal Cases
      </h2>
      <p className="text-xs text-gray-400 mb-5">
        {totalCases} case{totalCases !== 1 ? "s" : ""} declared in ECI
        affidavit
        {cases.some((c) => c.is_serious) && (
          <span className="ml-2 text-red-500 font-medium">
            · Red = serious IPC section
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

      {/* Detailed list */}
      <div className="space-y-2">
        {cases.map((c, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-lg p-3 text-sm ${
              c.is_serious ? "bg-red-50" : "bg-gray-50"
            }`}
          >
            <span
              className={`flex-shrink-0 font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                c.is_serious
                  ? "bg-red-100 text-red-700"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {c.ipc_section ?? "—"}
            </span>
            <div className="min-w-0">
              <div className="text-gray-700">
                {c.description || "No description provided"}
              </div>
              <div className="flex gap-2 mt-1">
                {c.is_serious && (
                  <span className="text-xs text-red-600 font-medium">
                    Serious offence
                  </span>
                )}
                <span
                  className={`text-xs capitalize ${
                    c.case_status === "convicted"
                      ? "text-red-600 font-medium"
                      : "text-gray-400"
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
