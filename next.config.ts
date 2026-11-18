import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Old Zochil URLs keep working: /products/<categoryId|null>/<productId> → /p/<slug>, /products/<categoryId> → /shop?….
const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "src", "data", "catalog.json"), "utf8")) as { products: { id: number; slug: string }[] };
const productRedirects = catalog.products.map((p) => ({ source: `/products/:category/${p.id}`, destination: `/p/${p.slug}`, permanent: true }));
// Zochil categories of shop 10783 → the same filter on the new site
const ZOCHIL_CATEGORIES: Record<number, string> = {
  68581: "g=women", 68597: "g=women", 68601: "g=women&d=sandals", 68602: "g=women&d=heels", 68600: "g=women&d=boots", 68599: "g=women&d=sneakers",
  68598: "g=women&d=wallets", 329634: "g=women&d=bags", 68617: "g=women&d=jewelry", 311767: "g=women&d=jewelry", 68614: "g=women&d=other", 70177: "g=women&d=sunglasses", 68605: "g=women",
  68202: "g=men", 68560: "g=men", 68577: "g=men&d=sandals", 310802: "g=men&d=boots", 68565: "g=men&d=sneakers", 68579: "g=men&d=wallets", 68689: "g=men&d=bags",
  311766: "g=men&d=other", 68619: "g=men&d=other", 68618: "g=men&d=other", 81571: "g=men&d=sunglasses", 68604: "g=men",
};
const categoryRedirects = Object.entries(ZOCHIL_CATEGORIES).map(([id, qs]) => ({ source: `/products/${id}`, destination: `/shop?${qs}`, permanent: true }));

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Photos are pre-sized WebP (440 px thumbs, 900 px large), so they are served as-is.
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: "/products", destination: "/shop", permanent: true },
      ...productRedirects,
      ...categoryRedirects,
      { source: "/products/:category(\d+|null)", destination: "/shop", permanent: false },
      { source: "/category/:path*", destination: "/shop", permanent: false },
      { source: "/saled-products", destination: "/shop?sale=1", permanent: true },
      { source: "/brands/:path*", destination: "/shop", permanent: false },
      { source: "/posts/:path*", destination: "/info#delivery", permanent: false },
      { source: "/shopping-cart", destination: "/cart", permanent: true },
      { source: "/checkout", destination: "/cart", permanent: true },
      { source: "/about", destination: "/info#about", permanent: true },
      { source: "/faq", destination: "/info#faq", permanent: true },
      { source: "/terms", destination: "/info#exchange", permanent: true },
      { source: "/contact", destination: "/info#stores", permanent: true },
      { source: "/accounts/:path*", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/images/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
