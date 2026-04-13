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
      params.delete("page"); // reset pagination on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-wrap gap-3 items-center p-4 bg-white rounded-xl border border-gray-200">
      <select
        value={currentParty}
        onChange={(e) => update("party", e.target.value)}
        className="text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
        className="text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
        className="text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="all">All Cases</option>
        <option value="serious">Serious Cases Only</option>
      </select>

      <select
        value={currentSort}
        onChange={(e) => update("sort", e.target.value)}
        className="text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="total_cases">Sort: Total Cases</option>
        <option value="serious_cases">Sort: Serious Cases</option>
        <option value="assets">Sort: Assets</option>
        <option value="name">Sort: Name</option>
      </select>
    </div>
  );
}
