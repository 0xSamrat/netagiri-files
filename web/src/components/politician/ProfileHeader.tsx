"use client";

import Image from "next/image";
import Link from "next/link";
import type { PoliticianDetail } from "@/types";

function formatAssets(raw: string): string {
  const n = Number(raw || "0");
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

interface ProfileHeaderProps {
  politician: PoliticianDetail;
}

export function ProfileHeader({ politician: p }: ProfileHeaderProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b0f23] p-6 flex flex-col sm:flex-row gap-6 backdrop-blur-md">
      <div className="flex-shrink-0">
        {p.photo_url ? (
          <Image
            src={p.photo_url}
            alt={p.name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border border-white/10"
            unoptimized
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl text-slate-400 font-bold">
            {p.name[0]}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-white truncate">{p.name}</h1>
          {p.is_convicted && (
            <span className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
              Convicted
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-sm mb-4">
          {p.party_short_name && (
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
              style={{
                backgroundColor: p.party_color
                  ? `${p.party_color}22`
                  : "rgba(255,255,255,0.05)",
                color: p.party_color ?? "#cbd5e1",
                borderColor: p.party_color
                  ? `${p.party_color}55`
                  : "rgba(255,255,255,0.08)",
              }}
            >
              {p.party_name ?? p.party_short_name}
            </span>
          )}
          <Link
            href="/"
            className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 hover:border-[#ff2d87]/40 hover:text-[#ff2d87] transition-colors"
          >
            Lok Sabha
          </Link>
          {p.state_name && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400">
              {p.state_name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Constituency" value={p.constituency ?? "—"} />
          <Stat
            label="Criminal Cases"
            value={String(p.total_cases)}
            highlight={p.total_cases > 0}
          />
          <Stat
            label="Serious Cases"
            value={String(p.serious_cases)}
            highlight={p.serious_cases > 0}
          />
          <Stat label="Assets" value={formatAssets(p.assets_inr)} />
        </div>
      </div>

      {p.affidavit_pdf_url && (
        <div className="flex-shrink-0 self-start">
          <a
            href={p.affidavit_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-3 py-2 rounded-full border border-[#ff2d87]/30 text-[#ff2d87] hover:bg-[#ff2d87]/10 transition-colors font-semibold"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Affidavit
          </a>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg px-3 py-2 bg-white/[0.03] border border-white/5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-0.5">
        {label}
      </div>
      <div
        className={`text-sm font-semibold truncate tabular-nums ${
          highlight ? "text-[#ff2d87]" : "text-slate-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
