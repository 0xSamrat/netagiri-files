"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { PoliticianSummary } from "@/types";

interface BubbleChartProps {
  data: PoliticianSummary[];
  onPartyClick?: (partyShortName: string) => void;
  selectedParty?: string;
}

interface PartyBubble {
  party: string;
  partyName: string;
  count: number;
  totalCases: number;
  color: string;
  x?: number;
  y?: number;
}

const HEIGHT = 680;
const INSIDE_LABEL_MIN_R = 40;

// Gamified neon palette — each bubble gets a distinct color
const NEON_PALETTE = [
  "#ff1493", // hot pink
  "#00f5ff", // cyan
  "#bf00ff", // neon purple
  "#39ff14", // neon green
  "#ff6b00", // neon orange
  "#00b3ff", // electric blue
  "#ffe600", // neon yellow
  "#ff0055", // crimson
  "#00ff88", // mint
  "#c800ff", // violet
  "#ff3b3b", // neon red
  "#00ffd5", // aqua
  "#ff9500", // tangerine
  "#a0ff00", // lime
  "#ff00aa", // magenta
  "#4d6bff", // cobalt
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = parseInt(h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function BubbleChart({
  data,
  onPartyClick,
  selectedParty,
}: BubbleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);

  const bubbles = useMemo<PartyBubble[]>(() => {
    const m = new Map<
      string,
      { party: string; partyName: string; count: number; totalCases: number }
    >();
    for (const p of data) {
      const key = p.party_short_name ?? "IND";
      const cur = m.get(key);
      if (cur) {
        cur.count++;
        cur.totalCases += p.total_cases;
      } else {
        m.set(key, {
          party: key,
          partyName: p.party_name ?? key,
          count: 1,
          totalCases: p.total_cases,
        });
      }
    }
    const arr = Array.from(m.values()).sort(
      (a, b) => b.totalCases - a.totalCases,
    );
    return arr.map((b, i) => ({
      ...b,
      color: NEON_PALETTE[i % NEON_PALETTE.length],
    }));
  }, [data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const laidOut = useMemo(() => {
    if (!width || bubbles.length === 0) {
      return [] as (PartyBubble & { r: number })[];
    }
    const maxCases = d3.max(bubbles, (d) => d.totalCases) ?? 1;
    const scale = d3
      .scaleSqrt()
      .domain([0, maxCases])
      .range([Math.max(20, width * 0.025), Math.min(130, width * 0.115)]);

    const nodes = bubbles.map((b) => ({ ...b }));
    const cx = width / 2;
    const cy = HEIGHT / 2;
    const sim = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force("charge", d3.forceManyBody().strength(8))
      .force("center", d3.forceCenter(cx, cy))
      .force("x", d3.forceX(cx).strength(0.05))
      .force("y", d3.forceY(cy).strength(0.06))
      .force(
        "collision",
        d3
          .forceCollide()
          .strength(1)
          .radius(
            (d) => scale((d as unknown as PartyBubble).totalCases) + 14,
          ),
      )
      .stop();
    for (let i = 0; i < 320; i++) sim.tick();

    return nodes.map((n) => ({
      ...n,
      r: scale(n.totalCases),
    })) as (PartyBubble & { r: number })[];
  }, [bubbles, width]);

  useEffect(() => {
    if (!svgRef.current || !width || laidOut.length === 0) return;
    const svg = d3.select(svgRef.current);
    svgRef.current.setAttribute("viewBox", `0 0 ${width} ${HEIGHT}`);
    svgRef.current.innerHTML = "";

    const cx = width / 2;
    const cy = HEIGHT / 2;

    const defs = svg.append("defs");

    // Per-bubble bloom filters + sphere gradients
    laidOut.forEach((d, i) => {
      const [r, g, b] = hexToRgb(d.color);

      // Bloom filter (colored glow)
      const f = defs
        .append("filter")
        .attr("id", `bloom-${i}`)
        .attr("x", "-150%")
        .attr("y", "-150%")
        .attr("width", "400%")
        .attr("height", "400%");
      f.append("feGaussianBlur")
        .attr("stdDeviation", "14")
        .attr("result", "blur");
      const merge = f.append("feMerge");
      merge.append("feMergeNode").attr("in", "blur");
      merge.append("feMergeNode").attr("in", "SourceGraphic");

      // Volumetric gradient: dark core → neon rim
      const grad = defs
        .append("radialGradient")
        .attr("id", `grad-${i}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "55%");
      grad
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#04020a")
        .attr("stop-opacity", 0.95);
      grad
        .append("stop")
        .attr("offset", "38%")
        .attr("stop-color", `rgba(${r * 0.2},${g * 0.2},${b * 0.2},0.8)`)
        .attr("stop-opacity", 0.8);
      grad
        .append("stop")
        .attr("offset", "72%")
        .attr("stop-color", `rgba(${r * 0.8},${g * 0.8},${b * 0.8},0.92)`);
      grad
        .append("stop")
        .attr("offset", "93%")
        .attr("stop-color", d.color)
        .attr("stop-opacity", 1);
      grad
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d.color)
        .attr("stop-opacity", 1);
    });

    // Subtle orbit guides
    const maxR = d3.max(laidOut, (d) => d.r) ?? 0;
    const ringR = maxR * 3;
    svg
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", ringR)
      .attr("fill", "none")
      .attr("stroke", "rgba(120,150,255,0.08)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2 10");

    // Neon halo (colored bloom per bubble)
    const halo = svg
      .append("g")
      .selectAll("circle")
      .data(laidOut)
      .join("circle")
      .attr("r", (d) => d.r + 10)
      .attr("fill", (d) => d.color)
      .attr("opacity", (d) =>
        selectedParty && selectedParty !== d.party ? 0.05 : 0.35,
      )
      .attr("filter", (_d, i) => `url(#bloom-${i})`)
      .attr("pointer-events", "none");

    const node = svg
      .selectAll("g.bubble")
      .data(laidOut)
      .join("g")
      .attr("class", "bubble")
      .attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
      .style("cursor", "pointer")
      .on("click", (_e, d) => onPartyClick?.(d.party));

    // Sphere body
    node
      .append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", (_d, i) => `url(#grad-${i})`)
      .attr("opacity", (d) =>
        selectedParty && selectedParty !== d.party ? 0.3 : 1,
      )
      .attr("stroke", (d) =>
        selectedParty === d.party ? "#ffffff" : d.color,
      )
      .attr("stroke-width", (d) => (selectedParty === d.party ? 2.5 : 1.5))
      .attr("stroke-opacity", 0.9);

    // Inside labels
    const bigNodes = node.filter((d) => d.r >= INSIDE_LABEL_MIN_R);

    bigNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", (d) => -d.r * 0.08)
      .attr("fill", (d) => d.color)
      .attr("font-weight", "700")
      .attr("font-size", (d) =>
        Math.max(11, Math.min(d.r * 0.26, 15)).toFixed(1),
      )
      .style("text-shadow", (d) => `0 0 8px ${d.color}, 0 1px 3px #000`)
      .attr("pointer-events", "none")
      .text((d) => d.party);

    bigNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", (d) => d.r * 0.24)
      .attr("fill", "#ffffff")
      .attr("font-weight", "800")
      .attr("font-size", (d) =>
        Math.max(13, Math.min(d.r * 0.4, 24)).toFixed(1),
      )
      .style("text-shadow", (d) => `0 0 10px ${d.color}, 0 1px 4px #000`)
      .attr("pointer-events", "none")
      .text((d) => `${d.totalCases}`);

    node
      .filter((d) => d.r < INSIDE_LABEL_MIN_R && d.r >= 20)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", (d) => d.color)
      .attr("font-weight", "700")
      .attr("font-size", (d) =>
        Math.max(9, Math.min(d.r * 0.5, 13)).toFixed(1),
      )
      .style("text-shadow", (d) => `0 0 6px ${d.color}, 0 1px 2px #000`)
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
      .style("background", "rgba(5,5,15,0.95)")
      .style("color", "#fff")
      .style("border", "1px solid rgba(255,255,255,0.1)")
      .style("padding", "8px 12px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", "0")
      .style("z-index", "1000");

    node
      .on("mousemove", (event: MouseEvent, d) => {
        tooltip
          .style("opacity", "1")
          .style("left", `${event.clientX + 14}px`)
          .style("top", `${event.clientY - 30}px`)
          .html(
            `<strong>${d.partyName}</strong><br/>${d.count} MP${d.count !== 1 ? "s" : ""} · ${d.totalCases} case${d.totalCases !== 1 ? "s" : ""}`,
          );
      })
      .on("mouseleave", () => tooltip.style("opacity", "0"));

    // Slow drift animation
    const basePos = laidOut.map((d) => ({ x: d.x ?? 0, y: d.y ?? 0 }));
    const offset = (i: number, t: number) => ({
      dx: Math.sin(t * 0.45 + i * 1.3) * 4,
      dy: Math.cos(t * 0.38 + i * 0.9) * 4,
    });
    const timer = d3.timer((elapsed) => {
      const t = elapsed / 1000;
      node.attr("transform", (d, i) => {
        const { dx, dy } = offset(i, t);
        return `translate(${basePos[i].x + dx},${basePos[i].y + dy})`;
      });
      halo.attr("transform", (d, i) => {
        const { dx, dy } = offset(i, t);
        return `translate(${basePos[i].x + dx},${basePos[i].y + dy})`;
      });
    });

    return () => {
      timer.stop();
      tooltip.remove();
    };
  }, [laidOut, width, selectedParty, onPartyClick]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden ring-1 ring-white/5"
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, #0e0520 0%, #050310 45%, #020208 90%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-10">
        <div className="text-center">
          <div
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{ color: "rgba(180,190,230,0.07)" }}
          >
            Criminal Cases
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(148,163,184,0.6) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <svg
        ref={svgRef}
        className="relative block w-full"
        style={{ height: HEIGHT }}
      />
    </div>
  );
}
