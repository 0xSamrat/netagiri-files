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
  "text-xs rounded-full border border-white/10 bg-white/5 text-slate-200 px-3 py-2 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff2d87]/50 appearance-none";

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
    <div className="flex flex-wrap gap-2 items-center p-3 bg-[#0b0f23] rounded-2xl border border-white/5 backdrop-blur-md">
      <select
        value={currentParty}
        onChange={(e) => update("party", e.target.value)}
        className={SELECT_CLS}
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
      >
        <option value="all">All Cases</option>
        <option value="serious">Serious Cases Only</option>
      </select>

      <select
        value={currentSort}
        onChange={(e) => update("sort", e.target.value)}
        className={SELECT_CLS}
      >
        <option value="total_cases">Sort: Total Cases</option>
        <option value="serious_cases">Sort: Serious Cases</option>
        <option value="assets">Sort: Assets</option>
        <option value="name">Sort: Name</option>
      </select>
    </div>
  );
}
