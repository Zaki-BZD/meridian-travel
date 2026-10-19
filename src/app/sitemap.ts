import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// A fixed date keeps this route prerenderable (reading the clock would make it dynamic).
const LAST_MODIFIED = "2026-10-19";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/terms`, lastModified: LAST_MODIFIED, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, lastModified: LAST_MODIFIED, changeFrequency: "yearly", priority: 0.2 },
  ];
}
