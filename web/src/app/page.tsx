import Link from "next/link";
import type { Metadata } from "next";
import { getPartyStats, getStateStats } from "@/lib/queries/stats";

export const metadata: Metadata = {
  title: "NetaGirifiles — The public record behind your elected MP",
  description:
    "Explore cases Lok Sabha MPs declared in their ECI affidavits — by party, by state, or by person.",
  alternates: { canonical: "/" },
};

export const revalidate = 86400;

export default async function HomePage() {
  const [partyStats, stateStats] = await Promise.all([
    getPartyStats("lok_sabha"),
    getStateStats("lok_sabha"),
  ]);

  const totalMps = stateStats.reduce((s, x) => s + Number(x.total_mps), 0);
  const mpsWithCases = stateStats.reduce(
    (s, x) => s + Number(x.mps_with_cases),
    0,
  );
  const nationalPct =
    totalMps > 0 ? Math.round((mpsWithCases / totalMps) * 100) : 0;
  const totalCases = partyStats.reduce(
    (s, x) => s + Number(x.total_cases_sum ?? 0),
    0,
  );

  const topParties = [...partyStats]
    .sort(
      (a, b) => Number(b.total_cases_sum ?? 0) - Number(a.total_cases_sum ?? 0),
    )
    .slice(0, 5);
  const topPartyMax = Math.max(
    1,
    ...topParties.map((p) => Number(p.total_cases_sum ?? 0)),
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(255,45,135,0.18) 0%, rgba(255,45,135,0) 55%), radial-gradient(ellipse at 85% 30%, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0) 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(148,163,184,0.6) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff2d87]/30 bg-[#ff2d87]/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff2d87] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff2d87] font-semibold">
              Civic Transparency · Lok Sabha 2024
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mt-4 leading-tight max-w-3xl">
            The <span className="text-[#ff2d87]">public record</span> behind
            your elected MP.
          </h1>
          <p
            className="relative text-sm sm:text-base mt-4 max-w-2xl leading-relaxed"
            style={{ color: "#e2e8f0" }}
          >
            NetaGirifiles aggregates the cases that India&apos;s Members of
            Parliament <span className="text-white font-semibold">declared on oath</span> in
            their Election Commission affidavits. Explore by party, by state,
            or by individual — the data is public, we just make it easier to
            see.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/lok-sabha"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff2d87] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#ff2d87]/90 transition-colors shadow-[0_0_24px_rgba(255,45,135,0.35)]"
            >
              Explore Lok Sabha
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 text-white text-sm font-semibold px-5 py-2.5 hover:bg-white/10 transition-colors"
            >
              View India Map
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              Source: myneta.info (public domain ECI affidavits)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              Declarations, not convictions
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Headline stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <HeadlineStat label="MPs" value={totalMps.toLocaleString()} />
          <HeadlineStat
            label="With Cases"
            value={mpsWithCases.toLocaleString()}
            accent
          />
          <HeadlineStat label="% With Cases" value={`${nationalPct}%`} accent />
          <HeadlineStat
            label="Total Cases"
            value={totalCases.toLocaleString()}
          />
        </section>

        {/* How it works */}
        <section>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold mb-3">
            How to use NetaGirifiles
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <HowItem
              step="01"
              title="Browse by party"
              body="Each bubble is a party. Click to filter the MP list."
              href="/lok-sabha"
              cta="Open chart"
            />
            <HowItem
              step="02"
              title="See the map"
              body="Which states elect the most MPs with cases?"
              href="/map"
              cta="Open map"
            />
            <HowItem
              step="03"
              title="Dig into an MP"
              body="Open any politician for their full declared case list."
              href="/lok-sabha"
              cta="Find an MP"
            />
          </div>
        </section>

        {/* Top parties teaser */}
        <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0b0f23] to-[#080b1d] p-5 sm:p-6">
          <div className="flex items-end justify-between flex-wrap gap-2 mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#ff2d87] font-semibold">
                Top Parties
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                Most declared cases
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                A teaser from the full Lok Sabha view
              </div>
            </div>
            <Link
              href="/lok-sabha"
              className="text-[12px] font-semibold text-[#ff2d87] hover:text-white transition-colors"
            >
              See full breakdown →
            </Link>
          </div>
          <ul className="space-y-3">
            {topParties.map((p, idx) => {
              const cases = Number(p.total_cases_sum ?? 0);
              const pct = (cases / topPartyMax) * 100;
              const color = p.color_hex ?? "#ff2d87";
              return (
                <li key={p.id}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-lg text-[10px] font-bold tabular-nums"
                      style={{ background: `${color}22`, color }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-slate-200 truncate">
                          {p.short_name ?? p.name}
                        </span>
                        <span className="text-[12px] font-bold text-white tabular-nums flex-shrink-0">
                          {cases.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                            boxShadow: `0 0 10px ${color}66`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function HeadlineStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b0f23] p-5 min-w-0">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] truncate">
        {label}
      </div>
      <div
        className={`text-2xl sm:text-3xl font-bold tabular-nums mt-1 truncate ${
          accent ? "text-[#ff2d87]" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function HowItem({
  step,
  title,
  body,
  href,
  cta,
}: {
  step: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-white/5 bg-[#0b0f23]/60 backdrop-blur-md p-4 hover:border-[#ff2d87]/30 hover:bg-[#0b0f23] transition-colors"
    >
      <div className="text-[10px] font-bold text-[#ff2d87] tracking-[0.2em]">
        {step}
      </div>
      <div className="text-sm font-semibold text-white mt-1">{title}</div>
      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
        {body}
      </div>
      <div className="text-[11px] font-semibold text-[#ff2d87] mt-3 group-hover:translate-x-0.5 transition-transform">
        {cta} →
      </div>
    </Link>
  );
}
