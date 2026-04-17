interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function StatsCard({ label, value, sub, accent }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b0f23] p-5 flex flex-col gap-1 backdrop-blur-md">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em]">
        {label}
      </span>
      <span
        className={`text-2xl font-bold tabular-nums ${
          accent ? "text-[#ff2d87]" : "text-white"
        }`}
      >
        {value}
      </span>
      {sub && <span className="text-[10px] text-slate-500">{sub}</span>}
    </div>
  );
}
