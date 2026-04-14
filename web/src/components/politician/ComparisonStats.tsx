"use client";

interface ComparisonStatsProps {
  percentileParty: number | null;
  percentileState: number | null;
  percentileNational: number | null;
  partyName: string | null;
  stateName: string | null;
  totalCases: number;
}

function PercentileBar({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  if (value === null) return null;

  // Higher percentile = more cases than peers. Escalate from slate → pink.
  const intensity = Math.min(1, Math.max(0, value / 100));
  const fillColor = `rgba(255, 45, 135, ${0.25 + intensity * 0.65})`;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
        <span className="text-sm font-bold text-white tabular-nums">
          {value.toFixed(0)}
          <span className="text-[10px] font-normal text-slate-500 ml-0.5">
            th pct
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${value}%`,
            background: fillColor,
            boxShadow: value >= 70 ? `0 0 8px ${fillColor}` : undefined,
          }}
        />
      </div>
    </div>
  );
}

export function ComparisonStats({
  percentileParty,
  percentileState,
  percentileNational,
  partyName,
  stateName,
  totalCases,
}: ComparisonStatsProps) {
  const hasAny =
    percentileParty !== null ||
    percentileState !== null ||
    percentileNational !== null;

  if (!hasAny) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b0f23] p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.24em]">
          How They Compare
        </span>
        <span className="text-[9px] text-slate-600 uppercase tracking-wider">
          by cases
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Higher percentile = more declared cases than peers
      </p>

      {totalCases === 0 && (
        <p className="text-xs text-slate-500 mb-4">
          0 cases declared — ranked in the lower percentile across all groups.
        </p>
      )}

      <div className="space-y-4">
        <PercentileBar
          label={`vs ${partyName ?? "party"}`}
          value={percentileParty}
        />
        <PercentileBar
          label={`vs ${stateName ?? "state"}`}
          value={percentileState}
        />
        <PercentileBar label="vs national" value={percentileNational} />
      </div>
    </div>
  );
}
