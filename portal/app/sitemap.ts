import type { MetadataRoute } from "next";

const BASE = "https://rirmega-benchmark.vercel.app";

// Keep in sync with the NAV array in app/layout.tsx.
const ROUTES = [
  "",
  "/explorer",
  "/reproducibility",
  "/results",
  "/participate",
  "/collaborate",
  "/cite",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-19");
  return ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
