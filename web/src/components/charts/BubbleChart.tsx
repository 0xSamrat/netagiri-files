"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { PoliticianSummary } from "@/types";

interface BubbleChartProps {
  data: PoliticianSummary[];
  onPartyClick?: (partyShortName: string) => void;
  selectedParty?: string;
}

interface PartyBubble {
  party: string;
  color: string;
  count: number;
  totalCases: number;
}

export function BubbleChart({
  data,
  onPartyClick,
  selectedParty,
}: BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Aggregate by party
    const partyMap = new Map<string, PartyBubble>();
    for (const p of data) {
      const key = p.party_short_name ?? "IND";
      const existing = partyMap.get(key);
      if (existing) {
        existing.count++;
        existing.totalCases += p.total_cases;
      } else {
        partyMap.set(key, {
          party: key,
          color: p.party_color ?? "#6b7280",
          count: 1,
          totalCases: p.total_cases,
        });
      }
    }

    const bubbles = Array.from(partyMap.values());

    const el = svgRef.current;
    const width = el.clientWidth || 600;
    const height = 340;

    d3.select(el).selectAll("*").remove();

    const svg = d3
      .select(el)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(bubbles, (d) => d.totalCases) ?? 1])
      .range([14, 60]);

    const simulation = d3
      .forceSimulation(bubbles as d3.SimulationNodeDatum[])
      .force("charge", d3.forceManyBody().strength(5))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) => sizeScale((d as unknown as PartyBubble).totalCases) + 2),
      )
      .stop();

    // Run enough ticks synchronously for stable layout
    for (let i = 0; i < 120; i++) simulation.tick();

    const node = svg
      .selectAll("g")
      .data(bubbles as (PartyBubble & d3.SimulationNodeDatum)[])
      .join("g")
      .attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
      .style("cursor", "pointer")
      .on("click", (_event, d) => onPartyClick?.(d.party));

    node
      .append("circle")
      .attr("r", (d) => sizeScale(d.totalCases))
      .attr("fill", (d) =>
        selectedParty && selectedParty !== d.party
          ? `${d.color}44`
          : `${d.color}cc`,
      )
      .attr("stroke", (d) =>
        selectedParty === d.party ? d.color : "transparent",
      )
      .attr("stroke-width", 2);

    node
      .filter((d) => sizeScale(d.totalCases) > 22)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .attr("font-size", (d) => Math.min(sizeScale(d.totalCases) / 2.5, 13))
      .attr("font-weight", "600")
      .attr("pointer-events", "none")
      .text((d) => d.party);

    // Tooltip
    const tooltip = d3
      .select("body")
      .selectAll<HTMLDivElement, unknown>("#bubble-tooltip")
      .data([null])
      .join("div")
      .attr("id", "bubble-tooltip")
      .style("position", "fixed")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", "0")
      .style("z-index", "1000");

    node
      .on("mousemove", (event: MouseEvent, d) => {
        tooltip
          .style("opacity", "1")
          .style("left", `${event.clientX + 12}px`)
          .style("top", `${event.clientY - 28}px`)
          .html(
            `<strong>${d.party}</strong><br/>${d.count} MP${d.count !== 1 ? "s" : ""} · ${d.totalCases} case${d.totalCases !== 1 ? "s" : ""}`,
          );
      })
      .on("mouseleave", () => tooltip.style("opacity", "0"));

    return () => {
      tooltip.remove();
      simulation.stop();
    };
  }, [data, selectedParty, onPartyClick]);

  if (data.length === 0) {
    return (
      <div className="h-[340px] flex items-center justify-center text-gray-300 text-sm">
        No data to display
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden">
      <svg ref={svgRef} className="w-full" style={{ height: 340 }} />
    </div>
  );
}
