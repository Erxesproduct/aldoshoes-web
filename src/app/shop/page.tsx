import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { families, GENDERS, getFamily, kinds, onSale, products, soldOut, type Gender, type Kind, type Product } from "@/lib/catalog";
import { countLabel } from "@/lib/format";

type Search = { q?: string; g?: string; d?: string; f?: string; sale?: string; sort?: string; all?: string; page?: string };
const PER_PAGE = 48;

const gOf = (s?: string) => (s === "women" || s === "men" ? (s as Gender) : null);
const dOf = (s?: string) => (s && s in kinds ? (s as Kind) : null);

function heading(s: Search) {
  const g = gOf(s.g);
  const d = dOf(s.d);
  if (s.q) return `«${s.q.slice(0, 60)}»`;
  const parts = [g && GENDERS[g], d && kinds[d]].filter(Boolean) as string[];
  if (s.sale === "1") parts.unshift("Хямдрал");
  return parts.length ? parts.join(" · ") : "Бүх загвар";
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const s = await searchParams;
  return { title: heading(s), alternates: { canonical: "/shop" }, robots: s.q || s.page || s.f ? { index: false } : undefined };
}

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
const haystack = new Map(products.map((p) => [p.id, norm([p.model, p.colour, p.type, p.code, kinds[p.kind], GENDERS[p.gender], getFamily(p.family)?.name, p.zochilName].filter(Boolean).join(" "))]));

export default async function ShopPage({ searchParams }: { searchParams: Promise<Search> }) {
  const s = await searchParams;
  const q = (s.q ?? "").slice(0, 60);
  const g = gOf(s.g);
  const d = dOf(s.d);
  const fam = getFamily(s.f ?? "");
  const sale = s.sale === "1";
  const showAll = s.all === "1";
  const sort = s.sort === "cheap" || s.sort === "dear" || s.sort === "new" ? s.sort : "default";

  const words = norm(q).split(" ").filter(Boolean);
  const base = (p: Product) => (!g || p.gender === g) && (!d || p.kind === d) && (!sale || onSale(p)) && words.every((w) => haystack.get(p.id)!.includes(w));
  const pool = products.filter(base);
  let list = pool.filter((p) => (!fam || p.family === fam.id) && (showAll || !soldOut(p)));
  if (sort === "cheap") list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === "dear") list = [...list].sort((a, b) => b.price - a.price);
  else if (sort === "new") list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
  else list = [...list].sort((a, b) => Number(!a.images.length) - Number(!b.images.length) || Number(b.featured) - Number(a.featured));
  const hidden = showAll ? 0 : pool.filter((p) => (!fam || p.family === fam.id) && soldOut(p)).length;

  // kinds and colours that exist for the current gender / search, so a filter never leads to an empty page
  const kindList = (Object.keys(kinds) as Kind[]).filter((k) => products.some((p) => (!g || p.gender === g) && (!sale || onSale(p)) && p.kind === k));
  const famList = families.filter((f) => pool.some((p) => p.family === f.id));

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(s.page) || 1));
  const shown = list.slice(0, page * PER_PAGE);

  const href = (patch: Partial<Search>) => {
    const next = { ...s, ...patch };
    if (!("page" in patch)) delete next.page;
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className="wrap pt-8 md:pt-12">
      <p className="kicker text-[13px] text-cherry">{q ? "Хайлтын үр дүн" : sale ? "Солих, буцаах боломжгүй" : "ALDO Shoes Mongolia"}</p>
      <h1 className="display mt-1 text-[52px] md:text-[88px]">{heading(s)}</h1>

      <form action="/shop" role="search" className="relative mt-6 max-w-xl">
        {g && <input type="hidden" name="g" value={g} />}
        {d && <input type="hidden" name="d" value={d} />}
        {sale && <input type="hidden" name="sale" value="1" />}
        <SearchIcon size={19} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" />
        <input name="q" type="search" defaultValue={q} placeholder="Загвар, өнгө, код…" aria-label="Хайх" className="h-13 w-full border border-ink bg-white pr-28 pl-11 text-[16px] outline-none" />
        <button className="btn btn-ink absolute top-1/2 right-1 h-11 min-h-0 -translate-y-1/2 px-5 text-[14px]">Хайх</button>
      </form>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Хэнд">
        {([null, "women", "men"] as const).map((x) => (
          <Link key={x ?? "all"} href={href({ g: x ?? undefined, d: x && d && !products.some((p) => p.gender === x && p.kind === d) ? undefined : s.d })} className="chip" aria-current={g === x}>
            {x ? GENDERS[x] : "Бүгд"}
          </Link>
        ))}
        <Link href={href({ sale: sale ? undefined : "1" })} className="chip text-cherry" aria-current={sale}>
          Хямдрал
        </Link>
      </nav>
      <nav className="mt-3 flex flex-wrap gap-2" aria-label="Ангилал">
        <Link href={href({ d: undefined })} className="chip" aria-current={!d}>
          Бүх төрөл
        </Link>
        {kindList.map((k) => (
          <Link key={k} href={href({ d: k })} className="chip" aria-current={d === k}>
            {kinds[k]}
          </Link>
        ))}
      </nav>
      {famList.length > 1 && (
        <nav className="mt-4 flex flex-wrap items-center gap-2" aria-label="Өнгө">
          <Link href={href({ f: undefined })} className="kicker mr-1 text-[12px] text-mute hover:text-ink" aria-current={!fam}>
            Өнгө:
          </Link>
          {famList.map((f) => (
            <Link key={f.id} href={href({ f: fam?.id === f.id ? undefined : f.id })} title={f.name} aria-label={f.name} aria-current={fam?.id === f.id} className="grid h-9 w-9 place-items-center rounded-full ring-ink transition aria-[current=true]:ring-2">
              <span className="swatch h-6 w-6" style={{ background: f.swatch }} />
            </Link>
          ))}
          {fam && <span className="kicker ml-1 text-[12px]">{fam.name}</span>}
        </nav>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink pt-4 text-[14px]">
        <p className="font-semibold">
          {countLabel(list.length, "загвар")}
          {hidden > 0 && (
            <>
              {" · "}
              <Link href={href({ all: "1" })} className="text-cherry underline underline-offset-2">
                дууссан {hidden}-г харуулах
              </Link>
            </>
          )}
          {showAll && (
            <>
              {" · "}
              <Link href={href({ all: undefined })} className="text-cherry underline underline-offset-2">
                зөвхөн бэлэн байгаа
              </Link>
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-1.5" aria-label="Эрэмбэ">
          {(
            [
              ["default", "Санал болгох"],
              ["new", "Шинэ"],
              ["cheap", "Хямд нь эхэнд"],
              ["dear", "Үнэтэй нь эхэнд"],
            ] as const
          ).map(([id, label]) => (
            <Link key={id} href={href({ sort: id === "default" ? undefined : id })} className="chip min-h-8 px-3 text-[13px]" aria-current={sort === id}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {shown.length ? (
        <ul className="mt-7 grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {shown.map((p, i) => (
            <li key={p.id}>
              <ProductCard p={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mx-auto mt-10 max-w-md bg-white p-8 text-center">
          <p className="display text-[40px]">Олдсонгүй</p>
          <p className="mt-1 text-ink-2">Өөр үгээр хайж үзээрэй, эсвэл Facebook чатаар асуугаарай.</p>
          <Link href="/shop" className="btn btn-ink mt-5">
            Бүх загвар
          </Link>
        </div>
      )}

      {page < pages && (
        <div className="mt-12 text-center">
          <Link href={href({ page: String(page + 1) })} scroll={false} className="btn btn-line h-14 px-8">
            Цааш үзэх ({list.length - shown.length})
          </Link>
        </div>
      )}
    </div>
  );
}
