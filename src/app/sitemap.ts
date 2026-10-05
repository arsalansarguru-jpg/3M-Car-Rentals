import type { MetadataRoute } from "next";
import { getAvailableVehicles } from "@/services/fleet.service";

const siteUrl = "https://3mcarrentals.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const vehicles = await getAvailableVehicles();

  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/fleet`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/airport`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    ...vehicles.map((vehicle) => ({
      url: `${siteUrl}/fleet/${vehicle.id}`,
      lastModified: new Date(vehicle.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
