import type { MetadataRoute } from "next";
import { divisions } from "@/lib/content/divisions";
import { SITE_URL } from "@/lib/seo";
import { audiences } from "@/lib/site";

const STATIC_ROUTES = ["/", "/about", "/solutions", "/app", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    priority: path === "/" ? 1 : 0.7,
  }));

  const audienceEntries = audiences.map((a) => ({
    url: `${SITE_URL}/${a.slug}`,
    lastModified,
    priority: 0.9,
  }));

  const divisionEntries = divisions.map((d) => ({
    url: `${SITE_URL}/solutions/${d.slug}`,
    lastModified,
    priority: 0.6,
  }));

  return [...staticEntries, ...audienceEntries, ...divisionEntries];
}
