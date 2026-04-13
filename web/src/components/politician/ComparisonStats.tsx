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

  // High percentile = more cases than peers = bad
  const color =
    value >= 90
      ? "bg-red-500"
      : value >= 70
        ? "bg-orange-400"
        : value >= 40
          ? "bg-yellow-400"
          : "bg-green-400";

  const textColor =
    value >= 90
      ? "text-red-700"
      : value >= 70
        ? "text-orange-700"
        : value >= 40
          ? "text-yellow-700"
          : "text-green-700";

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>
          {value.toFixed(0)}
          <span className="text-xs font-normal">th percentile</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">
        How They Compare
      </h2>
      <p className="text-xs text-gray-400 mb-5">
        Percentile rank by total criminal cases declared —{" "}
        <strong>higher = more cases than peers</strong>
      </p>

      {totalCases === 0 && (
        <p className="text-sm text-gray-500 mb-4">
          This MP declared 0 criminal cases — ranked in the lower percentile
          across all groups.
        </p>
      )}

      <div className="space-y-4">
        <PercentileBar
          label={`vs ${partyName ?? "party"} MPs`}
          value={percentileParty}
        />
        <PercentileBar
          label={`vs ${stateName ?? "state"} MPs`}
          value={percentileState}
        />
        <PercentileBar label="vs all MPs nationally" value={percentileNational} />
      </div>
    </div>
  );
}
