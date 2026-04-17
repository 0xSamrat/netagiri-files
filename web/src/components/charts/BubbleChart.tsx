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

const DESKTOP_HEIGHT = 680;
const MOBILE_HEIGHT = 520;
const MOBILE_BREAKPOINT = 640;
const MOBILE_MAX_BUBBLES = 10;
const INSIDE_LABEL_MIN_R = 40;

// Brand-aligned palette — pink-led, harmonizes with #0b0f23 + #ff2d87
const NEON_PALETTE = [
  "#ff2d87", // brand pink (largest bubble)
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // rose-red
  "#3b82f6", // blue
  "#ec4899", // pink-400
  "#14b8a6", // teal
  "#a855f7", // purple
  "#eab308", // yellow
  "#f97316", // orange
  "#22d3ee", // sky
  "#84cc16", // lime
  "#d946ef", // fuchsia
  "#6366f1", // indigo
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

  const height = width < MOBILE_BREAKPOINT ? MOBILE_HEIGHT : DESKTOP_HEIGHT;

  const laidOut = useMemo(() => {
    if (!width || bubbles.length === 0) {
      return [] as (PartyBubble & { r: number })[];
    }
    const isMobile = width < MOBILE_BREAKPOINT;
    const h = isMobile ? MOBILE_HEIGHT : DESKTOP_HEIGHT;
    const sorted = [...bubbles].sort((a, b) => b.totalCases - a.totalCases);
    const visible =
      isMobile && sorted.length > MOBILE_MAX_BUBBLES
        ? (() => {
            const top = sorted.slice(0, MOBILE_MAX_BUBBLES - 1);
            const rest = sorted.slice(MOBILE_MAX_BUBBLES - 1);
            const others: PartyBubble = {
              party: "Others",
              partyName: "Others",
              count: rest.reduce((s, r) => s + r.count, 0),
              totalCases: rest.reduce((s, r) => s + r.totalCases, 0),
              color: "#475569",
            };
            return [...top, others];
          })()
        : sorted;
    const maxCases = d3.max(visible, (d) => d.totalCases) ?? 1;
    const scale = d3
      .scaleSqrt()
      .domain([0, maxCases])
      .range([
        Math.max(isMobile ? 22 : 20, width * (isMobile ? 0.05 : 0.025)),
        Math.min(isMobile ? 72 : 130, width * (isMobile ? 0.2 : 0.115)),
      ]);

    const nodes = visible.map((b) => ({ ...b }));
    const cx = width / 2;
    const cy = h / 2;
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
    for (let i = 0; i < 320; i++) {
      sim.tick();
      for (const n of nodes as (PartyBubble & { x: number; y: number })[]) {
        const r = scale(n.totalCases);
        n.x = Math.max(r + 4, Math.min(width - r - 4, n.x));
        n.y = Math.max(r + 4, Math.min(h - r - 4, n.y));
      }
    }

    return nodes.map((n) => ({
      ...n,
      r: scale(n.totalCases),
    })) as (PartyBubble & { r: number })[];
  }, [bubbles, width]);

  useEffect(() => {
    if (!svgRef.current || !width || laidOut.length === 0) return;
    const svg = d3.select(svgRef.current);
    svgRef.current.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svgRef.current.innerHTML = "";

    const cx = width / 2;
    const cy = height / 2;

    const defs = svg.append("defs");

    // Per-bubble sphere + halo gradients
    laidOut.forEach((d, i) => {
      const [r, g, b] = hexToRgb(d.color);

      // Halo gradient: neon at the rim, fades to 0 with distance.
      // Bubble radius sits at 50% of the halo circle, so the sphere surface
      // is where the glow is hottest and it falls off outward.
      const halo = defs
        .append("radialGradient")
        .attr("id", `halo-${i}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      halo
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d.color)
        .attr("stop-opacity", 0);
      halo
        .append("stop")
        .attr("offset", "48%")
        .attr("stop-color", d.color)
        .attr("stop-opacity", 0.32);
      halo
        .append("stop")
        .attr("offset", "55%")
        .attr("stop-color", d.color)
        .attr("stop-opacity", 0.22);
      halo
        .append("stop")
        .attr("offset", "72%")
        .attr("stop-color", d.color)
        .attr("stop-opacity", 0.05);
      halo
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d.color)
        .attr("stop-opacity", 0);

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

    // Neon halo with radial falloff (no Gaussian blur — gradient IS the falloff)
    const halo = svg
      .append("g")
      .selectAll("circle")
      .data(laidOut)
      .join("circle")
      .attr("r", (d) => d.r * 1.55)
      .attr("fill", (_d, i) => `url(#halo-${i})`)
      .attr("opacity", (d) =>
        selectedParty && selectedParty !== d.party ? 0.15 : 1,
      )
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
      .attr("y", (d) => -d.r * 0.12)
      .attr("fill", "#ffffff")
      .attr("font-weight", "700")
      .attr("letter-spacing", "0.04em")
      .attr("font-size", (d) =>
        Math.max(11, Math.min(d.r * 0.24, 16)).toFixed(1),
      )
      .style(
        "text-shadow",
        "0 1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)",
      )
      .attr("pointer-events", "none")
      .text((d) => d.party);

    bigNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", (d) => d.r * 0.22)
      .attr("fill", "#ffffff")
      .attr("font-weight", "800")
      .attr("font-size", (d) =>
        Math.max(16, Math.min(d.r * 0.44, 28)).toFixed(1),
      )
      .style(
        "text-shadow",
        "0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)",
      )
      .attr("pointer-events", "none")
      .text((d) => d.totalCases.toLocaleString());

    bigNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", (d) => d.r * 0.5)
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("font-weight", "600")
      .attr("font-size", (d) =>
        Math.max(8, Math.min(d.r * 0.15, 11)).toFixed(1),
      )
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.1em")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.9)")
      .attr("pointer-events", "none")
      .text("cases");

    node
      .filter((d) => d.r < INSIDE_LABEL_MIN_R && d.r >= 20)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .attr("font-weight", "700")
      .attr("font-size", (d) =>
        Math.max(10, Math.min(d.r * 0.45, 13)).toFixed(1),
      )
      .style(
        "text-shadow",
        "0 1px 2px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.7)",
      )
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
      .style("background", "rgba(11,15,35,0.96)")
      .style("color", "#fff")
      .style("border", "1px solid rgba(255,255,255,0.08)")
      .style("padding", "10px 14px")
      .style("border-radius", "12px")
      .style("font-size", "12px")
      .style("backdrop-filter", "blur(8px)")
      .style("box-shadow", "0 8px 32px rgba(0,0,0,0.6)")
      .style("pointer-events", "none")
      .style("opacity", "0")
      .style("z-index", "1000")
      .style("transition", "opacity 0.15s");

    node
      .on("mousemove", (event: MouseEvent, d) => {
        const pct =
          d.count > 0 ? (d.totalCases / d.count).toFixed(1) : "0";
        tooltip
          .style("opacity", "1")
          .style("left", `${event.clientX + 14}px`)
          .style("top", `${event.clientY - 30}px`)
          .html(
            `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
               <span style="height:8px;width:8px;border-radius:999px;background:${d.color};box-shadow:0 0 8px ${d.color}"></span>
               <strong style="font-size:13px">${d.partyName}</strong>
             </div>
             <div style="color:#cbd5e1;font-size:11px;line-height:1.6">
               <div><span style="color:#64748b">MPs:</span> <strong style="color:#fff">${d.count}</strong></div>
               <div><span style="color:#64748b">Total cases:</span> <strong style="color:#ff2d87">${d.totalCases}</strong></div>
               <div><span style="color:#64748b">Avg / MP:</span> <strong style="color:#fff">${pct}</strong></div>
             </div>`,
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
  }, [laidOut, width, height, selectedParty, onPartyClick]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden ring-1 ring-white/5"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #111736 0%, #0a0e22 45%, #060814 90%)",
      }}
    >
      <div className="pointer-events-none absolute top-4 left-5 flex items-center gap-2 z-10">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff2d87] animate-pulse" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
          Criminal cases by party
        </span>
      </div>
      <div className="pointer-events-none absolute top-4 right-5 z-10 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        Click a bubble to filter
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
        style={{ height }}
      />
    </div>
  );
}
