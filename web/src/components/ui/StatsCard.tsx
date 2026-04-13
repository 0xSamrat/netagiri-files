interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function StatsCard({ label, value, sub, accent }: StatsCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-1 ${
        accent ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-2xl font-bold ${accent ? "text-red-600" : "text-gray-900"}`}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}
