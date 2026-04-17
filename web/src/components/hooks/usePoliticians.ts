"use client";

import { useQuery } from "@tanstack/react-query";
import type { House, Paginated, PoliticianSummary } from "@/types";

export interface PoliticianFilters {
  house: House;
  party?: string;
  state?: string;
  crimeType?: string;
  sort?: string;
  page: number;
}

export function usePoliticians(filters: PoliticianFilters) {
  const base = "lok-sabha";
  return useQuery<Paginated<PoliticianSummary>>({
    queryKey: ["politicians", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.party) params.set("party", filters.party);
      if (filters.state) params.set("state", filters.state);
      if (filters.crimeType) params.set("crime_type", filters.crimeType);
      if (filters.sort) params.set("sort", filters.sort);
      params.set("page", String(filters.page));
      const res = await fetch(`/api/v1/${base}/politicians?${params}`);
      if (!res.ok) throw new Error("Failed to load politicians");
      return res.json() as Promise<Paginated<PoliticianSummary>>;
    },
  });
}

export function useBubbleData(house: House) {
  const base = "lok-sabha";
  return useQuery<PoliticianSummary[]>({
    queryKey: ["bubble-data", house],
    queryFn: async () => {
      const res = await fetch(`/api/v1/${base}/bubble-data`);
      if (!res.ok) throw new Error("Failed to load bubble data");
      return res.json() as Promise<PoliticianSummary[]>;
    },
  });
}
