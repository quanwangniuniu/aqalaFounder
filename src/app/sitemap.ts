import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aqala.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/site-map`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/donate`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/reviews`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/listen`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/qibla`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/prayers`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/translate`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/rooms`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/subscription`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/auth/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/auth/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
