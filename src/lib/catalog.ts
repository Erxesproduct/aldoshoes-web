import data from "@/data/catalog.json";

export type Img = { src: string; w: number; h: number };
export type Photo = Img & { thumb: Img };
export type Block = { t: "p" | "li"; x: string };

export type Gender = "women" | "men";
export type Kind = "heels" | "shoes" | "boots" | "sneakers" | "sandals" | "bags" | "wallets" | "jewelry" | "sunglasses" | "other";
export type Size = { size: string; stock: number | null };

export type Product = {
  /** Zochil product id (erxes code AL-<id>, old-URL redirects). */
  id: number;
  slug: string;
  /** ALDO model name, e.g. «Merrybelle». */
  model: string;
  /** Colour from the Zochil name («Other Red»), or from the same ALDO colour code elsewhere in the catalog. */
  colour: string | null;
  family: string;
  colourCode: string | null;
  /** ALDO type from the Zochil name, e.g. «Dress Shoes». */
  type: string | null;
  gender: Gender;
  kind: Kind;
  /** Sizes with stock when Zochil has size variants (16 products); null = sizes not listed on Zochil. */
  sizes: Size[] | null;
  /** Shoes: the customer must pick a size. */
  needsSize: boolean;
  price: number;
  compareAt: number | null;
  stock: number | null;
  /** ALDO article number from Zochil `sku`. */
  code: string | null;
  zochilName: string;
  featured: boolean;
  createdAt: string;
  details: Block[];
  images: Photo[];
  /** Other colourways of the same model. */
  siblings: string[];
};

export type Family = { id: string; name: string; swatch: string; count: number };

export const products = data.products as Product[];
export const kinds = data.kinds as Record<Kind, string>;
export const families = (data.families as Family[]).filter((f) => f.count > 0);
export const faq = data.faq as { q: string; a: string }[];
export const banners = data.banners as (Img & { title: string })[];
export const catalogUpdatedAt = data.updatedAt;

export const GENDERS: Record<Gender, string> = { women: "Эмэгтэй", men: "Эрэгтэй" };
export const SHOE_KINDS: Kind[] = ["heels", "shoes", "boots", "sneakers", "sandals"];

const bySlug = new Map(products.map((p) => [p.slug, p]));
export const getProduct = (slug: string) => bySlug.get(slug);
export const getFamily = (id: string) => families.find((f) => f.id === id);

export const soldOut = (p: { stock: number | null }) => p.stock === 0;
export const onSale = (p: Pick<Product, "price" | "compareAt">) => p.compareAt != null && p.compareAt > p.price;
export const discount = (p: Pick<Product, "price" | "compareAt">) => (onSale(p) ? Math.round((1 - p.price / p.compareAt!) * 100) : 0);
export const inStock = products.filter((p) => !soldOut(p));

/** Display name: «Merrybelle» + «Other Red». */
export const title = (p: Pick<Product, "model" | "colour">) => (p.colour ? `${p.model} · ${p.colour}` : p.model);
export const kindLabel = (p: Pick<Product, "kind">) => kinds[p.kind];

/** erxes product code: AL-<zochil id>. */
export const sku = (p: Pick<Product, "id">) => `AL-${p.id}`;

/**
 * Sizes a customer can pick. Zochil lists sizes for 16 products only; the others get the usual EU range
 * (men: the shop's own size chart, 39–47; women: 35–41) and staff confirm the size by phone before payment.
 */
export const WOMEN_SIZES = ["35", "36", "37", "38", "39", "40", "41"];
export const MEN_SIZES = ["39", "40", "41", "42", "42.5", "43", "43.5", "44", "45", "46", "47"];
export function sizeOptions(p: Pick<Product, "needsSize" | "sizes" | "gender">): Size[] {
  if (!p.needsSize) return [];
  if (p.sizes) return p.sizes;
  return (p.gender === "men" ? MEN_SIZES : WOMEN_SIZES).map((size) => ({ size, stock: null }));
}

/** The shop's own men's size chart (Zochil post «Хүргэлтийн бүс», image), US / UK / EU / inch / cm. */
export const MEN_SIZE_CHART: [us: string, uk: string, eu: string, inch: number, cm: number][] = [
  ["7", "6", "39", 10.1, 25.6],
  ["7.5", "6.5", "40", 10.1, 25.7],
  ["8", "7", "41", 10.2, 25.8],
  ["9", "8", "42", 10.3, 26],
  ["9.5", "8.5", "42.5", 10.4, 26.4],
  ["10", "9", "43", 10.5, 26.8],
  ["10.5", "9.5", "43.5", 10.7, 27.3],
  ["11", "10", "44", 10.9, 27.7],
  ["12", "11", "45", 11.2, 28.5],
  ["13", "12", "46", 11.4, 29],
  ["14", "13", "47", 11.6, 29.4],
];

/** The product a cart line points at (server side). */
export function resolveLine(slug: string, size: string | null) {
  const product = getProduct(slug);
  if (!product) return null;
  if (product.needsSize) {
    const opt = sizeOptions(product).find((s) => s.size === size);
    if (!opt) return null;
    return { product, size: opt.size, price: product.price, stock: opt.stock ?? product.stock };
  }
  return { product, size: null, price: product.price, stock: product.stock };
}
