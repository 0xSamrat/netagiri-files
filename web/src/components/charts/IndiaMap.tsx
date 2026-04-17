"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { StateStat } from "@/types";

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();
}

interface StateProps {
  st_nm: string;
  st_code: string;
}

interface IndiaTopology extends Topology {
  objects: {
    states: GeometryCollection<StateProps>;
    districts: GeometryCollection;
  };
}

interface Hex {
  x: number;
  y: number;
  stateName: string;
  stateStat: StateStat | null;
  jitter: number;
}

interface StateCard {
  x: number;
  y: number;
  stat: StateStat;
  side: "left" | "right";
}

interface TooltipState {
  x: number;
  y: number;
  name: string;
  pct: number | null;
  mps_with_cases: number;
  total_mps: number;
}

interface IndiaMapProps {
  stats: StateStat[];
  onStateClick: (stat: StateStat | null) => void;
  selectedState: StateStat | null;
}

const HEX_RADIUS = 3.8;
const HOT_STATE_COUNT = 6;
const CARD_COUNT = 5;

function hexPath(cx: number, cy: number, r: number): string {
  let p = "";
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const px = cx + r * Math.sin(a);
    const py = cy - r * Math.cos(a);
    p += (i === 0 ? "M" : "L") + px.toFixed(2) + "," + py.toFixed(2);
  }
  return p + "Z";
}

export function IndiaMap({ stats, onStateClick, selectedState }: IndiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [topo, setTopo] = useState<IndiaTopology | null>(null);
  const [width, setWidth] = useState(0);

  // Load topology once.
  useEffect(() => {
    fetch("/india-states.json")
      .then((r) => r.json())
      .then((d) => setTopo(d as IndiaTopology))
      .catch(() => setTopo(null));
  }, []);

  // Observe container width so the map is responsive.
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

  const statsByName = useMemo(
    () => new Map<string, StateStat>(stats.map((s) => [normalizeName(s.name), s])),
    [stats]
  );

  const hotStateNames = useMemo(() => {
    const sorted = [...stats]
      .filter((s) => s.pct_with_cases !== null && s.total_mps > 0)
      .sort((a, b) => (b.pct_with_cases ?? 0) - (a.pct_with_cases ?? 0))
      .slice(0, HOT_STATE_COUNT);
    return new Set(sorted.map((s) => normalizeName(s.name)));
  }, [stats]);

  // Compute hexes + cards. Pure derivation — no side effects.
  const { hexes, cards, height } = useMemo(() => {
    if (!topo || !width) {
      return { hexes: [] as Hex[], cards: [] as StateCard[], height: 0 };
    }
    const h = Math.round(width * 1.02);
    const features = topojson.feature(
      topo,
      topo.objects.states
    ) as unknown as GeoJSON.FeatureCollection;

    const projection = d3
      .geoMercator()
      .fitSize([width * 0.92, h * 0.92], features);
    const [tx, ty] = projection.translate();
    projection.translate([tx + width * 0.04, ty + h * 0.04]);

    const path = d3.geoPath().projection(projection);
    const bboxes = features.features.map((f) => d3.geoBounds(f));

    const result: Hex[] = [];
    const dx = HEX_RADIUS * Math.sqrt(3);
    const dy = HEX_RADIUS * 1.5;
    for (let row = 0; row * dy < h + HEX_RADIUS; row++) {
      for (let col = 0; col * dx < width + HEX_RADIUS; col++) {
        const x = col * dx + (row % 2 ? dx / 2 : 0);
        const y = row * dy + HEX_RADIUS;
        const inv = projection.invert?.([x, y]);
        if (!inv) continue;
        const [lon, lat] = inv;
        for (let i = 0; i < features.features.length; i++) {
          const [[wb, sb], [eb, nb]] = bboxes[i];
          if (lon < wb || lon > eb || lat < sb || lat > nb) continue;
          if (d3.geoContains(features.features[i], inv)) {
            const props = features.features[i].properties as StateProps;
            const stat = statsByName.get(normalizeName(props.st_nm)) ?? null;
            // Deterministic jitter for stable renders.
            const jitter = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1;
            result.push({
              x,
              y,
              stateName: props.st_nm,
              stateStat: stat,
              jitter,
            });
            break;
          }
        }
      }
    }

    const topForCards = [...stats]
      .filter((s) => s.mps_with_cases > 0)
      .sort((a, b) => b.mps_with_cases - a.mps_with_cases)
      .slice(0, CARD_COUNT);
    const cardData: StateCard[] = [];
    for (const s of topForCards) {
      const feat = features.features.find(
        (f) =>
          normalizeName((f.properties as StateProps).st_nm) ===
          normalizeName(s.name)
      );
      if (!feat) continue;
      const c = path.centroid(feat);
      if (!isFinite(c[0]) || !isFinite(c[1])) continue;
      cardData.push({
        x: c[0],
        y: c[1],
        stat: s,
        side: c[0] > width / 2 ? "right" : "left",
      });
    }

    return { hexes: result, cards: cardData, height: h };
  }, [topo, width, stats, statsByName]);

  // Draw / update the D3 layer based on computed hexes.
  useEffect(() => {
    if (!svgRef.current || hexes.length === 0 || !width) return;

    const svg = d3.select(svgRef.current);
    svgRef.current.setAttribute("height", String(height));
    svgRef.current.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svgRef.current.innerHTML = "";

    const defs = svg.append("defs");
    const pinkGlow = defs
      .append("filter")
      .attr("id", "pink-glow")
      .attr("x", "-100%")
      .attr("y", "-100%")
      .attr("width", "300%")
      .attr("height", "300%");
    pinkGlow
      .append("feGaussianBlur")
      .attr("stdDeviation", "2.2")
      .attr("result", "blur");
    const pinkMerge = pinkGlow.append("feMerge");
    pinkMerge.append("feMergeNode").attr("in", "blur");
    pinkMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const hexGroup = svg.append("g").attr("class", "hexes");

    hexGroup
      .selectAll("path")
      .data(hexes)
      .join("path")
      .attr("d", (h) => hexPath(h.x, h.y, HEX_RADIUS * 0.8))
      .attr("fill", (h) => {
        const norm = normalizeName(h.stateName);
        const isHot = hotStateNames.has(norm);
        const isSelected =
          selectedState && h.stateStat && h.stateStat.id === selectedState.id;
        if (isSelected) {
          return d3.interpolateRgb("#ff2d87", "#ffffff")(0.2 + h.jitter * 0.4);
        }
        if (isHot && h.jitter > 0.35) {
          return d3.interpolateRgb("#7a1644", "#ff2d87")(0.3 + h.jitter * 0.7);
        }
        if (isHot) {
          return d3.interpolateRgb("#1a1f3d", "#3d2547")(0.3 + h.jitter * 0.5);
        }
        return d3.interpolateRgb("#10152e", "#2a3356")(0.15 + h.jitter * 0.6);
      })
      .attr("filter", (h) => {
        const isHot = hotStateNames.has(normalizeName(h.stateName));
        return isHot && h.jitter > 0.7 ? "url(#pink-glow)" : null;
      })
      .style("cursor", "pointer")
      .on("mousemove", function (event: MouseEvent, h) {
        const rect = svgRef.current!.getBoundingClientRect();
        const stat = h.stateStat;
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          name: stat?.name ?? h.stateName,
          pct: stat?.pct_with_cases ?? null,
          mps_with_cases: stat?.mps_with_cases ?? 0,
          total_mps: stat?.total_mps ?? 0,
        });
      })
      .on("mouseleave", () => setTooltip(null))
      .on("click", (_e, h) => onStateClick(h.stateStat));
  }, [hexes, width, height, hotStateNames, selectedState, onStateClick]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden ring-1 ring-white/5"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #10152e 0%, #060814 70%)",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <svg ref={svgRef} className="relative block w-full" />

      {/* Floating stat cards */}
      {cards.map((c) => {
        const pct = c.stat.pct_with_cases ?? 0;
        const hot = pct >= 50;
        return (
          <div
            key={c.stat.id}
            className="pointer-events-none absolute hidden sm:flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0b0f23]/85 backdrop-blur-md px-3 py-2 shadow-2xl shadow-black/60 max-w-[180px]"
            style={{
              left: `${c.x}px`,
              top: `${c.y}px`,
              transform:
                c.side === "right"
                  ? "translate(16px, -50%)"
                  : "translate(calc(-100% - 16px), -50%)",
            }}
          >
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-extrabold text-white"
              style={{
                background: hot
                  ? "linear-gradient(135deg, #ff2d87 0%, #7a1644 100%)"
                  : "linear-gradient(135deg, #2a3356 0%, #10152e 100%)",
                boxShadow: hot
                  ? "0 0 16px rgba(255,45,135,0.55), inset 0 1px 0 rgba(255,255,255,0.25)"
                  : "0 0 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              {c.stat.code}
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-1 truncate">
                {c.stat.name}
              </span>
              <span className="text-lg font-bold text-white tabular-nums leading-none">
                {c.stat.mps_with_cases.toLocaleString()}
                <span className="text-xs text-slate-500 font-normal ml-0.5">
                  /{c.stat.total_mps}
                </span>
              </span>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-[10px] text-slate-400 pointer-events-none min-w-0">
        <span className="uppercase tracking-wider flex-shrink-0">low</span>
        <div
          className="h-1.5 flex-1 min-w-[40px] rounded-full"
          style={{
            background:
              "linear-gradient(to right, #10152e, #2a3356, #7a1644, #ff2d87)",
          }}
        />
        <span className="uppercase tracking-wider flex-shrink-0">high</span>
        <span className="ml-1 text-slate-500 truncate hidden sm:inline">
          % MPs with cases
        </span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg border border-white/10 bg-[#0b0f23]/95 backdrop-blur-md px-3 py-2 text-xs text-white shadow-xl max-w-[180px]"
          style={{
            left:
              tooltip.x > width - 200
                ? Math.max(8, tooltip.x - 190)
                : tooltip.x + 14,
            top: Math.max(8, tooltip.y - 10),
          }}
        >
          <div className="font-semibold mb-0.5">{tooltip.name}</div>
          {tooltip.total_mps > 0 ? (
            <>
              <div className="text-slate-200">
                {tooltip.mps_with_cases}/{tooltip.total_mps} MPs with cases
              </div>
              <div className="text-slate-400">
                {tooltip.pct !== null ? `${tooltip.pct}%` : "—"}
              </div>
            </>
          ) : (
            <div className="text-slate-500">No data</div>
          )}
        </div>
      )}
    </div>
  );
}
