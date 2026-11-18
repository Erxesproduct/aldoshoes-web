import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { Gallery } from "@/components/gallery";
import { ChatIcon, TruckIcon } from "@/components/icons";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { Scroller } from "@/components/scroller";
import { business } from "@/content/business";
import { discount, GENDERS, getFamily, getProduct, inStock, kindLabel, onSale, products, sku, soldOut, title } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-url";

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const name = `ALDO ${title(p)}`;
  const description = `${name}: ${GENDERS[p.gender].toLowerCase()} ${kindLabel(p).toLowerCase()}, ${formatPrice(p.price)}. ${business.tagline}. ${business.rules.delivery}`;
  const img = p.images[0];
  return { title: name, description, alternates: { canonical: `/p/${p.slug}` }, openGraph: { title: name, description, images: img ? [{ url: img.src, width: img.w, height: img.h }] : undefined } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const out = soldOut(p);
  const fam = getFamily(p.family);
  const colourways = [p, ...p.siblings.map(getProduct).filter((x) => x != null)].sort((a, b) => a.id - b.id);
  const related = inStock
    .filter((x) => x.gender === p.gender && x.kind === p.kind && x.model !== p.model && x.images.length)
    .sort((a, b) => Number(b.family === p.family) - Number(a.family === p.family) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
    .slice(0, 12);
  const pairWith = inStock.filter((x) => x.family === p.family && x.kind !== p.kind && x.images.length && (p.kind === "bags" ? x.kind !== "wallets" : true) && (x.gender === p.gender || x.kind === "jewelry")).slice(0, 10);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `ALDO ${title(p)}`,
    sku: sku(p),
    mpn: p.code ?? undefined,
    brand: { "@type": "Brand", name: "ALDO" },
    color: p.colour ?? undefined,
    image: p.images.map((m) => absoluteUrl(m.src)),
    category: kindLabel(p),
    offers: { "@type": "Offer", priceCurrency: "MNT", price: p.price, availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", url: absoluteUrl(`/p/${p.slug}`) },
  };

  return (
    <div className="wrap pt-6 md:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="kicker flex flex-wrap items-center gap-2 text-[12px] text-mute" aria-label="Зам">
        <Link href="/" className="hover:text-cherry">
          Нүүр
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/shop?g=${p.gender}`} className="hover:text-cherry">
          {GENDERS[p.gender]}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/shop?g=${p.gender}&d=${p.kind}`} className="hover:text-cherry">
          {kindLabel(p)}
        </Link>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_1fr] lg:gap-14">
        <div className="relative">
          {p.images.length ? (
            <Gallery images={p.images} name={`ALDO ${title(p)}`} />
          ) : (
            <div className="studio display grid aspect-[4/5] place-items-center text-[64px] text-ink/15">ALDO</div>
          )}
          {onSale(p) && <span className="sticker absolute top-4 right-4 h-16 w-16 -rotate-12 text-[22px]">−{discount(p)}%</span>}
        </div>

        <div className="lg:pt-2">
          <p className="kicker text-[13px] text-cherry">
            {GENDERS[p.gender]} · {p.type ?? kindLabel(p)}
          </p>
          <h1 className="display mt-2 text-[56px] md:text-[80px]">{p.model}</h1>
          {p.colour && (
            <p className="mt-2 flex items-center gap-2.5 text-[16px] text-ink-2">
              {fam && <span className="swatch h-4 w-4" style={{ background: fam.swatch }} />}
              {p.colour}
            </p>
          )}
          <div className="mt-5">
            <Price price={p.price} compareAt={p.compareAt} size="lg" />
          </div>

          {colourways.length > 1 && (
            <div className="mt-6">
              <p className="kicker text-[13px]">Бусад өнгө ({colourways.length})</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {colourways.map((c) => (
                  <li key={c.id}>
                    <Link href={`/p/${c.slug}`} aria-current={c.id === p.id} title={c.colour ?? c.model} className={`studio relative block h-20 w-16 overflow-hidden border transition hover:border-ink aria-[current=true]:border-ink aria-[current=true]:ring-1 aria-[current=true]:ring-ink ${soldOut(c) ? "opacity-40" : ""} border-transparent`}>
                      {c.images[0] ? <Image src={c.images[0].thumb.src} alt={c.colour ?? c.model} fill sizes="64px" className="object-contain p-1.5" /> : <span className="swatch absolute inset-4" style={{ background: getFamily(c.family)?.swatch }} />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-7">
            <BuyBox slug={p.slug} name={p.model} />
          </div>

          <ul className="mt-7 grid gap-2.5 text-[14.5px]">
            <li className="flex gap-3 bg-white p-4">
              <TruckIcon size={22} className="shrink-0 text-cherry" />
              <span>
                <b>{business.rules.delivery}</b> А бүс {formatPrice(business.delivery[0].fee!)}, Б бүс {formatPrice(business.delivery[1].fee!)}: бараа хүлээн авахдаа хүргэгчид төлнө.{" "}
                <Link href="/info#delivery" className="font-semibold text-cherry underline underline-offset-2">
                  Дэлгэрэнгүй
                </Link>
              </span>
            </li>
            <li className="flex gap-3 bg-white p-4">
              <ChatIcon size={22} className="shrink-0 text-cherry" />
              <span>
                {onSale(p) ? business.rules.sale : business.rules.exchange} Асуух зүйл байвал{" "}
                <a href={business.messenger} target="_blank" rel="noreferrer" className="font-semibold text-cherry underline underline-offset-2">
                  Facebook чат
                </a>{" "}
                эсвэл{" "}
                <a href={`tel:${business.phone.tel}`} className="font-semibold whitespace-nowrap">
                  {business.phone.display}
                </a>
              </span>
            </li>
          </ul>

          {p.details.length > 0 && (
            <section className="prose-aldo mt-8" aria-label="Тайлбар">
              <h2 className="display text-[26px]">Тайлбар</h2>
              {p.details.map((b, i) => (b.t === "li" ? <li key={i}>{b.x}</li> : <p key={i}>{b.x}</p>))}
            </section>
          )}
          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-ink pt-5 text-[13.5px]">
            <dt className="text-mute">Төрөл</dt>
            <dd className="font-semibold">{[GENDERS[p.gender], kindLabel(p), p.type].filter(Boolean).join(" · ")}</dd>
            {p.code && (
              <>
                <dt className="text-mute">ALDO код</dt>
                <dd className="font-semibold tracking-wider">{p.code}</dd>
              </>
            )}
            <dt className="text-mute">Дэлгүүрийн код</dt>
            <dd className="font-semibold">{sku(p)}</dd>
          </dl>
        </div>
      </div>

      {pairWith.length > 0 && (
        <section className="mt-24" aria-label="Хослуулах">
          <p className="kicker text-[13px] text-cherry">{fam?.name ?? "Ижил"} өнгөөр</p>
          <h2 className="display mt-1 text-[40px] md:text-[56px]">Хослуулаад өмс</h2>
          <Scroller className="scroller mt-6">
            {pairWith.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </Scroller>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20" aria-label="Төстэй загвар">
          <p className="kicker text-[13px] text-cherry">Төстэй</p>
          <h2 className="display mt-1 text-[40px] md:text-[56px]">{kindLabel(p)}</h2>
          <Scroller className="scroller mt-6">
            {related.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </Scroller>
        </section>
      )}
    </div>
  );
}
