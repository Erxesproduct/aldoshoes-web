import data from "@/data/lite.json";

/**
 * Slim product record for client components: s slug, m model, c colour, p price, o price before discount, k stock,
 * t thumbnail (null = no photo), g gender, d kind, f colour family, z sizes (0 = no size, 1 = EU range, list = [size, stock]).
 */
export type Lite = { s: string; m: string; c: string | null; p: number; o: number | null; k: number | null; t: string | null; g: "women" | "men"; d: string; f: string; z: 0 | 1 | [string, number | null][] };

export const liteProducts = data as Lite[];
const bySlug = new Map(liteProducts.map((p) => [p.s, p]));

export const getLite = (slug: string) => bySlug.get(slug);

const WOMEN = ["35", "36", "37", "38", "39", "40", "41"];
const MEN = ["39", "40", "41", "42", "42.5", "43", "43.5", "44", "45", "46", "47"];

/** Sizes of a product (client side): [size, stock | null]. Empty when the product has no size. */
export function liteSizes(p: Lite): [string, number | null][] {
  if (p.z === 0) return [];
  if (p.z === 1) return (p.g === "men" ? MEN : WOMEN).map((s) => [s, null]);
  return p.z;
}

export function resolveLine(slug: string, size: string | null) {
  const product = bySlug.get(slug);
  if (!product) return null;
  if (product.z === 0) return { product, size: null, price: product.p, stock: product.k };
  const opt = liteSizes(product).find(([s]) => s === size);
  if (!opt) return null;
  return { product, size: opt[0], price: product.p, stock: opt[1] ?? product.k };
}
