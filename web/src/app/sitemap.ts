import type { MetadataRoute } from "next";
import { listAllPoliticianIds } from "@/lib/queries/politicians";
import { SITE_URL } from "@/lib/share";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/lok-sabha`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/map`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/disclaimer`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const ids = await listAllPoliticianIds();
  const politicianRoutes: MetadataRoute.Sitemap = ids.map((id) => ({
    url: `${SITE_URL}/politician/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...politicianRoutes];
}
