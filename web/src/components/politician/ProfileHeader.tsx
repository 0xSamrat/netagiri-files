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

function houseLabel(): string {
  return "Lok Sabha";
}

function houseHref(): string {
  return "/lok-sabha";
}

interface ProfileHeaderProps {
  politician: PoliticianDetail;
}

export function ProfileHeader({ politician: p }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-6">
      {/* Photo */}
      <div className="flex-shrink-0">
        {p.photo_url ? (
          <Image
            src={p.photo_url}
            alt={p.name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border border-gray-200"
            unoptimized
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl text-gray-400 font-bold">
            {p.name[0]}
          </div>
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{p.name}</h1>
          {p.is_convicted && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              Convicted
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-sm mb-4">
          {/* Party chip */}
          {p.party_short_name && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: p.party_color ? `${p.party_color}22` : "#f3f4f6",
                color: p.party_color ?? "#374151",
              }}
            >
              {p.party_name ?? p.party_short_name}
            </span>
          )}
          {/* House chip */}
          <Link
            href={houseHref()}
            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            {houseLabel()}
          </Link>
          {/* State */}
          {p.state_name && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {p.state_name}
            </span>
          )}
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Constituency" value={p.constituency ?? "—"} />
          <Stat label="Criminal Cases" value={String(p.total_cases)} highlight={p.total_cases > 0} />
          <Stat label="Serious Cases" value={String(p.serious_cases)} highlight={p.serious_cases > 0} />
          <Stat label="Assets" value={formatAssets(p.assets_inr)} />
        </div>
      </div>

      {/* Affidavit link */}
      {p.affidavit_pdf_url && (
        <div className="flex-shrink-0 self-start">
          <a
            href={p.affidavit_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Affidavit
          </a>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold truncate ${highlight ? "text-orange-600" : "text-gray-800"}`}>
        {value}
      </div>
    </div>
  );
}
