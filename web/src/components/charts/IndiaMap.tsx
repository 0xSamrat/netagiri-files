"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { StateStat } from "@/types";

// Normalize both sides the same way for name-based join
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

export function IndiaMap({ stats, onStateClick, selectedState }: IndiaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [topo, setTopo] = useState<IndiaTopology | null>(null);

  const statsByName = useMemo(
    () => new Map<string, StateStat>(stats.map((s) => [normalizeName(s.name), s])),
    [stats]
  );

  // Load TopoJSON once
  useEffect(() => {
    fetch("/india-states.json")
      .then((r) => r.json())
      .then((d) => setTopo(d as IndiaTopology))
      .catch(() => setTopo(null));
  }, []);

  useEffect(() => {
    if (!topo || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = width * 1.15;
    svgRef.current.setAttribute("height", String(height));

    const features = topojson.feature(topo, topo.objects.states);

    const projection = d3.geoMercator().fitSize([width, height], features);
    const path = d3.geoPath().projection(projection);

    // Color scale: green (0%) → amber → red (100%)
    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([100, 0]); // reversed: high pct = red

    const noDataColor = "#e5e7eb";

    svg.selectAll("path").remove();

    svg
      .selectAll<SVGPathElement, GeoJSON.Feature>("path")
      .data((features as GeoJSON.FeatureCollection).features)
      .join("path")
      .attr("d", (f) => path(f) ?? "")
      .attr("fill", (f) => {
        const props = f.properties as StateProps;
        const stat = statsByName.get(normalizeName(props.st_nm));
        if (!stat || stat.pct_with_cases === null) return noDataColor;
        return colorScale(stat.pct_with_cases);
      })
      .attr("stroke", (f) => {
        const props = f.properties as StateProps;
        const stat = statsByName.get(normalizeName(props.st_nm));
        if (selectedState && stat && stat.id === selectedState.id) return "#1e40af";
        return "#fff";
      })
      .attr("stroke-width", (f) => {
        const props = f.properties as StateProps;
        const stat = statsByName.get(normalizeName(props.st_nm));
        if (selectedState && stat && stat.id === selectedState.id) return 2;
        return 0.5;
      })
      .style("cursor", "pointer")
      .on("mousemove", function (event: MouseEvent, f) {
        const props = f.properties as StateProps;
        const stat = statsByName.get(normalizeName(props.st_nm));
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          name: stat?.name ?? props.st_nm,
          pct: stat?.pct_with_cases ?? null,
          mps_with_cases: stat?.mps_with_cases ?? 0,
          total_mps: stat?.total_mps ?? 0,
        });
      })
      .on("mouseleave", function () {
        setTooltip(null);
      })
      .on("click", function (_event, f) {
        const props = f.properties as StateProps;
        const stat = statsByName.get(normalizeName(props.st_nm));
        onStateClick(stat ?? null);
      });
  }, [topo, stats, selectedState, statsByName, onStateClick]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef} className="w-full" />

      {/* Legend */}
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <span>0%</span>
        <div
          className="h-2 flex-1 rounded"
          style={{
            background: "linear-gradient(to right, #1a9850, #ffffbf, #d73027)",
          }}
        />
        <span>100%</span>
        <span className="ml-2">MPs with cases</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: tooltip.x + 12, top: Math.max(0, tooltip.y - 10) }}
        >
          <div className="font-semibold mb-0.5">{tooltip.name}</div>
          {tooltip.total_mps > 0 ? (
            <>
              <div>
                {tooltip.mps_with_cases}/{tooltip.total_mps} MPs with cases
              </div>
              <div className="text-gray-300">
                {tooltip.pct !== null ? `${tooltip.pct}%` : "—"}
              </div>
            </>
          ) : (
            <div className="text-gray-400">No data</div>
          )}
        </div>
      )}
    </div>
  );
}
