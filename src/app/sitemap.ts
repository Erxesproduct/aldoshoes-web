import type { MetadataRoute } from "next";
import { catalogUpdatedAt, kinds, products, type Kind } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(catalogUpdatedAt);
  return [
    { url: absoluteUrl("/"), lastModified, priority: 1 },
    { url: absoluteUrl("/shop"), lastModified, priority: 0.8 },
    ...(["women", "men"] as const).map((g) => ({ url: absoluteUrl(`/shop?g=${g}`), lastModified, priority: 0.8 })),
    ...(Object.keys(kinds) as Kind[]).map((d) => ({ url: absoluteUrl(`/shop?d=${d}`), lastModified, priority: 0.6 })),
    { url: absoluteUrl("/shop?sale=1"), lastModified, priority: 0.7 },
    ...products.map((p) => ({ url: absoluteUrl(`/p/${p.slug}`), lastModified, priority: 0.7 })),
    { url: absoluteUrl("/info"), lastModified, priority: 0.5 },
  ];
}
