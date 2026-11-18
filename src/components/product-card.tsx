import Image from "next/image";
import Link from "next/link";
import { discount, getFamily, kindLabel, soldOut, type Product } from "@/lib/catalog";
import { Price } from "./price";

/** A product in a light-grey studio box; the second photo fades in on hover. */
export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const [a, b] = p.images;
  const off = discount(p);
  const out = soldOut(p);
  const fam = getFamily(p.family);
  return (
    <article className="group relative flex h-full flex-col">
      <Link href={`/p/${p.slug}`} className="studio relative block aspect-[4/5] overflow-hidden">
        {a ? (
          <>
            <Image src={a.thumb.src} alt={`ALDO ${p.model}${p.colour ? ` ${p.colour}` : ""}`} width={a.thumb.w} height={a.thumb.h} priority={priority} sizes="(min-width: 1024px) 300px, 50vw" className={`absolute inset-0 h-full w-full object-contain p-4 transition duration-500 ${b ? "group-hover:opacity-0" : "group-hover:scale-105"} ${out ? "opacity-40 grayscale" : ""}`} />
            {b && <Image src={b.thumb.src} alt="" width={b.thumb.w} height={b.thumb.h} sizes="(min-width: 1024px) 300px, 50vw" className="absolute inset-0 h-full w-full scale-105 object-contain p-4 opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100" />}
          </>
        ) : (
          <span className="display absolute inset-0 grid place-items-center text-[44px] text-ink/15">ALDO</span>
        )}
        {off > 0 && <span className="sticker absolute top-3 left-3 h-12 w-12 -rotate-12 text-[17px]">−{off}%</span>}
        {out && <span className="kicker absolute right-3 bottom-3 bg-ink px-2 py-1 text-[11px] text-white">Дууссан</span>}
        {p.siblings.length > 0 && <span className="absolute bottom-3 left-3 bg-white/90 px-2 py-0.5 text-[11.5px] font-semibold">+{p.siblings.length} өнгө</span>}
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <p className="kicker text-[11.5px] text-mute">{kindLabel(p)}</p>
        <Link href={`/p/${p.slug}`} className="display mt-1 text-[22px] leading-none hover:text-cherry">
          {p.model}
        </Link>
        {p.colour && (
          <span className="mt-1.5 flex items-center gap-2 text-[13px] text-ink-2">
            {fam && <span className="swatch h-3.5 w-3.5" style={{ background: fam.swatch }} />}
            {p.colour}
          </span>
        )}
        <div className="mt-auto pt-2">
          <Price price={p.price} compareAt={p.compareAt} size="sm" />
        </div>
      </div>
    </article>
  );
}
