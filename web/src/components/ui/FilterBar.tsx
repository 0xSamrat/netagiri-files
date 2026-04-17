"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { House } from "@/types";

interface FilterBarProps {
  house: House;
  parties: { short_name: string; name: string }[];
  states: { code: string; name: string }[];
  currentParty: string;
  currentState: string;
  currentCrimeType: string;
  currentSort: string;
}

const SELECT_CLS =
  "w-full min-w-0 text-[13px] sm:text-xs rounded-full border border-white/10 bg-white/5 text-slate-200 pl-3 pr-8 py-2 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff2d87]/50 appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:0.65rem] cursor-pointer truncate [&>option]:bg-[#0b0f23] [&>option]:text-slate-200";

const CHEVRON_BG = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 8 10 12 14 8'/></svg>\")",
};

export function FilterBar({
  parties,
  states,
  currentParty,
  currentState,
  currentCrimeType,
  currentSort,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#0b0f23] rounded-2xl border border-white/5 backdrop-blur-md">
      <select
        value={currentParty}
        onChange={(e) => update("party", e.target.value)}
        className={SELECT_CLS}
        style={CHEVRON_BG}
      >
        <option value="">All Parties</option>
        {parties.map((p) => (
          <option key={p.short_name} value={p.short_name}>
            {p.short_name}
          </option>
        ))}
      </select>

      <select
        value={currentState}
        onChange={(e) => update("state", e.target.value)}
        className={SELECT_CLS}
        style={CHEVRON_BG}
      >
        <option value="">All States</option>
        {states.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        value={currentCrimeType}
        onChange={(e) => update("crime_type", e.target.value)}
        className={SELECT_CLS}
        style={CHEVRON_BG}
      >
        <option value="all">All Cases</option>
        <option value="serious">Serious Cases Only</option>
      </select>

      <select
        value={currentSort}
        onChange={(e) => update("sort", e.target.value)}
        className={SELECT_CLS}
        style={CHEVRON_BG}
      >
        <option value="total_cases">Sort: Total Cases</option>
        <option value="serious_cases">Sort: Serious Cases</option>
        <option value="assets">Sort: Assets</option>
        <option value="name">Sort: Name</option>
      </select>
    </div>
  );
}
