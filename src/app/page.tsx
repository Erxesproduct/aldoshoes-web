import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { ArrowIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { LookBuilder } from "@/components/look-builder";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Scroller } from "@/components/scroller";
import { business, storeMap } from "@/content/business";
import { banners, discount, families, inStock, onSale, products, type Gender, type Kind, type Product } from "@/lib/catalog";
import { countLabel } from "@/lib/format";

const withPhoto = inStock.filter((p) => p.images.length);
const newest = [...withPhoto].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
const sale = withPhoto.filter(onSale).sort((a, b) => discount(b) - discount(a));
const shelf = (g: Gender, ks: Kind[]) => newest.filter((p) => p.gender === g && ks.includes(p.kind)).slice(0, 14);
const count = (g: Gender | null, k: Kind) => products.filter((p) => (!g || p.gender === g) && p.kind === k).length;
const cover = (g: Gender | null, k: Kind) => newest.find((p) => (!g || p.gender === g) && p.kind === k);
// runway strip: one shoe from each kind, both genders
const runway = (["heels", "sneakers", "boots", "sandals", "shoes", "bags", "jewelry"] as Kind[]).flatMap((k) => newest.filter((p) => p.kind === k).slice(0, 3));

const TILES: { g: Gender | null; k: Kind; label: string }[] = [
  { g: "women", k: "heels", label: "Өндөр өсгийт" },
  { g: "women", k: "sneakers", label: "Эмэгтэй пүүз" },
  { g: "women", k: "sandals", label: "Шаахай, сандаль" },
  { g: "women", k: "boots", label: "Эмэгтэй гутал" },
  { g: "men", k: "boots", label: "Эрэгтэй ботинк" },
  { g: "men", k: "sneakers", label: "Эрэгтэй пүүз" },
  { g: null, k: "bags", label: "Цүнх" },
  { g: null, k: "jewelry", label: "Гоёл чимэглэл" },
];

function Shelf({ id, kicker, title, href, list }: { id: string; kicker: string; title: string; href: string; list: Product[] }) {
  if (!list.length) return null;
  return (
    <section className="wrap mt-24 md:mt-32" aria-labelledby={id}>
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker text-[13px] text-cherry">{kicker}</p>
          <h2 id={id} className="display mt-1 text-[44px] md:text-[64px]">
            {title}
          </h2>
        </div>
        <Link href={href} className="kicker hidden shrink-0 items-center gap-2 border-b-2 border-ink pb-1 text-[14px] hover:border-cherry hover:text-cherry sm:inline-flex">
          Бүгдийг үзэх <ArrowIcon size={17} />
        </Link>
      </Reveal>
      <Scroller className="scroller mt-7">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </Scroller>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero banners={banners} count={countLabel(products.length, "загвар")} />

      {/* runway: product cut-outs gliding by */}
      <section className="mt-16 overflow-hidden border-y border-ink bg-white py-5" aria-hidden>
        <div className="marquee marquee-slow">
          {[0, 1].map((k) => (
            <span key={k} className="flex shrink-0 items-center gap-10 pr-10">
              {runway.map((p) => (
                <Image key={`${k}-${p.id}`} src={p.images[0].thumb.src} alt="" width={p.images[0].thumb.w} height={p.images[0].thumb.h} sizes="140px" className="h-24 w-auto object-contain mix-blend-multiply md:h-32" />
              ))}
            </span>
          ))}
        </div>
      </section>

      {/* shop by kind */}
      <section className="wrap mt-24 md:mt-32" aria-labelledby="kinds">
        <Reveal>
          <p className="kicker text-[13px] text-cherry">Ангилал</p>
          <h2 id="kinds" className="display mt-1 text-[44px] md:text-[64px]">
            Юу хайж байна?
          </h2>
        </Reveal>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {TILES.map((t, i) => {
            const c = cover(t.g, t.k);
            const href = `/shop?${new URLSearchParams({ ...(t.g ? { g: t.g } : {}), d: t.k })}`;
            return (
              <Reveal as="li" key={t.label} delay={(i % 4) * 60}>
                <Link href={href} className="studio group relative block aspect-[4/5] overflow-hidden">
                  {c && <Image src={c.images[0].thumb.src} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-contain p-5 pb-20 transition duration-500 group-hover:scale-110 group-hover:-rotate-3 md:p-6 md:pb-20" />}
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-white/95 to-transparent p-4 pt-10">
                    <span>
                      <span className="display block text-[20px] leading-none md:text-[30px]">{t.label}</span>
                      <span className="kicker mt-1 block text-[11.5px] text-mute">{countLabel(count(t.g, t.k), "загвар")}</span>
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-white transition group-hover:bg-cherry">
                      <ArrowIcon size={17} />
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <Shelf id="new-women" kicker="Шинээр ирсэн" title="Эмэгтэй" href="/shop?g=women&sort=new" list={shelf("women", ["heels", "boots", "sneakers", "sandals", "shoes"])} />

      {/* look builder */}
      <section className="mt-24 bg-bone-2 py-16 md:mt-32 md:py-24" aria-labelledby="look">
        <div className="wrap">
          <Reveal className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="kicker text-[13px] text-cherry">Өнгөөр хослуул</p>
              <h2 id="look" className="display mt-1 text-[44px] md:text-[72px]">
                Гутал, цүнх <span className="outline-text">нэг өнгөөр</span>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] text-ink-2">Өнгөө сонго: дэлгүүрийн бодит загваруудаас гутал, цүнх, гоёлыг хослуулж харуулна. ⟳ товчоор өөрийг үзээрэй.</p>
          </Reveal>
          <div className="mt-10">
            <LookBuilder families={families} />
          </div>
        </div>
      </section>

      {sale.length > 0 && (
        <section className="mt-24 bg-ink py-16 text-white md:mt-32 md:py-20" aria-labelledby="sale">
          <div className="wrap">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="kicker text-[13px] text-white/80">{countLabel(sale.length, "загвар")} · хамгийн их хямдрал эхэнд</p>
                <h2 id="sale" className="display mt-1 text-[64px] text-cherry md:text-[110px]">
                  Хямдрал
                </h2>
              </div>
              <Link href="/shop?sale=1" className="btn bg-white text-ink hover:bg-cherry hover:text-white">
                Бүгдийг үзэх <ArrowIcon size={17} />
              </Link>
            </Reveal>
            <Scroller className="scroller mt-8 [&_.text-mute]:text-white/70 [&_.text-ink-2]:text-white/85">
              {sale.slice(0, 16).map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </Scroller>
            <p className="mt-6 text-[13px] text-white/75">{business.rules.sale}</p>
          </div>
        </section>
      )}

      <Shelf id="new-men" kicker="Шинээр ирсэн" title="Эрэгтэй" href="/shop?g=men&sort=new" list={shelf("men", ["shoes", "sneakers", "boots", "sandals"])} />
      <Shelf id="bags" kicker="Сайжруулсан арьс" title="Цүнх" href="/shop?d=bags" list={shelf("women", ["bags"])} />
      <Shelf id="jewelry" kicker="Гоёл, нүдний шил" title="Нэмэлт" href="/shop?d=jewelry" list={newest.filter((p) => ["jewelry", "sunglasses", "wallets"].includes(p.kind)).slice(0, 14)} />

      {/* size + stores */}
      <section className="wrap mt-24 grid gap-4 md:mt-32 md:grid-cols-[1fr_1.4fr]" aria-label="Хэмжээ ба дэлгүүр">
        <Reveal className="flex flex-col justify-between bg-ink p-8 text-white md:p-10">
          <div>
            <p className="kicker text-[13px] text-cherry">Хэмжээгээ мэдэх</p>
            <p className="display mt-2 text-[44px] md:text-[56px]">EU · US · UK</p>
            <p className="mt-3 max-w-sm text-[15px] text-white/70">Хөлийнхөө уртыг сантиметрээр хэмжээд хүснэгтээс хэмжээгээ олоорой. {business.rules.size}</p>
          </div>
          <Link href="/info#size" className="btn mt-8 self-start bg-white text-ink hover:bg-cherry hover:text-white">
            Хэмжээний хүснэгт <ArrowIcon size={17} />
          </Link>
        </Reveal>
        <Reveal delay={80} className="bg-white p-8 md:p-10">
          <p className="kicker text-[13px] text-cherry">Салбар дэлгүүр</p>
          <p className="display mt-2 text-[44px] md:text-[56px]">Ирж өмсөж үз</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {business.stores.map((s) => (
              <li key={s.name}>
                <a href={storeMap(s.query)} target="_blank" rel="noreferrer" className="studio flex h-full flex-col p-4 transition hover:bg-ink hover:text-white">
                  <PinIcon size={19} className="text-cherry" />
                  <span className="display mt-3 text-[22px] leading-none">{s.name}</span>
                  <span className="mt-1 text-[13px] opacity-70">{s.floor}</span>
                  <span className="mt-3 text-[12.5px] leading-snug opacity-70">{s.hours}</span>
                </a>
              </li>
            ))}
          </ul>
          <a href={`tel:${business.phone.tel}`} className="mt-5 inline-flex items-center gap-3 text-[15px] font-semibold hover:text-cherry">
            <PhoneIcon size={18} /> {business.phone.display}
          </a>
          <p className="mt-2 text-[13px] text-mute">{business.rules.exchange}</p>
        </Reveal>
      </section>

    </>
  );
}
