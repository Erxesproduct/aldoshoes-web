"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { liteProducts, type Lite } from "@/lib/lite";
import { CheckIcon, PlusIcon, ShuffleIcon } from "./icons";

type Fam = { id: string; name: string; swatch: string };
const SHOES = ["heels", "shoes", "boots", "sneakers", "sandals"];
const SLOTS = {
  women: [
    { id: "shoe", label: "Гутал", kinds: SHOES },
    { id: "bag", label: "Цүнх", kinds: ["bags"] },
    { id: "extra", label: "Гоёл, түрийвч", kinds: ["jewelry", "wallets", "sunglasses"] },
  ],
  men: [
    { id: "shoe", label: "Гутал", kinds: SHOES },
    { id: "bag", label: "Цүнх, түрийвч", kinds: ["bags", "wallets"] },
  ],
} as const;

const pickFrom = (list: Lite[], not?: string) => {
  const pool = list.length > 1 && not ? list.filter((p) => p.s !== not) : list;
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
};

/**
 * «Өнгөөр хослуул»: pick a colour, get shoes + bag (+ jewellery) of that colour family from the real catalog,
 * reshuffle any slot. Bags and jewellery go straight to the cart; shoes open their page for the size.
 */
export function LookBuilder({ families }: { families: Fam[] }) {
  const [gender, setGender] = useState<"women" | "men">("women");
  const [fam, setFam] = useState("black");
  const [seed, setSeed] = useState<Record<string, string>>({});
  const [added, setAdded] = useState<string | null>(null);

  const pools = useMemo(() => {
    const ok = liteProducts.filter((p) => p.k !== 0 && p.t);
    return Object.fromEntries(
      SLOTS[gender].map((s) => {
        const kinds = s.kinds as readonly string[];
        const exact = ok.filter((p) => p.g === gender && kinds.includes(p.d) && p.f === fam);
        // jewellery has no «black»: metals go with everything
        const fallback = ok.filter((p) => kinds.includes(p.d) && (p.f === "metal" || p.g === gender));
        return [s.id, exact.length ? exact : s.id === "extra" ? fallback.filter((p) => p.f === "metal") : []];
      }),
    ) as Record<string, Lite[]>;
  }, [gender, fam]);

  const look = SLOTS[gender].map((s) => {
    const pool = pools[s.id];
    const chosen = pool.find((p) => p.s === seed[`${gender}|${fam}|${s.id}`]) ?? pool[0] ?? null;
    return { slot: s, item: chosen, count: pool.length };
  });
  const total = look.reduce((n, l) => n + (l.item?.p ?? 0), 0);
  const famList = families.filter((f) => liteProducts.some((p) => p.f === f.id && p.g === gender && SHOES.includes(p.d) && p.k !== 0));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex" role="radiogroup" aria-label="Хэнд">
          {(["women", "men"] as const).map((g) => (
            <button key={g} type="button" role="radio" aria-checked={gender === g} onClick={() => setGender(g)} className="kicker border border-ink px-5 py-2.5 text-[13px] transition aria-checked:bg-ink aria-checked:text-white">
              {g === "women" ? "Эмэгтэй" : "Эрэгтэй"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label="Өнгө">
          {famList.map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={fam === f.id} onClick={() => setFam(f.id)} title={f.name} className="group grid h-10 w-10 place-items-center rounded-full ring-ink transition aria-checked:ring-2" aria-label={f.name}>
              <span className="swatch h-7 w-7 transition group-hover:scale-110" style={{ background: f.swatch }} />
            </button>
          ))}
          <span className="kicker ml-1 text-[13px] text-ink-2">{families.find((f) => f.id === fam)?.name}</span>
        </div>
      </div>

      <div className={`mt-8 grid gap-4 ${look.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {look.map(({ slot, item, count }) => (
          <div key={slot.id} className="flex flex-col bg-white">
            <div className="studio relative aspect-square overflow-hidden">
              {item ? (
                <Link href={`/p/${item.s}`} className="block h-full">
                  <Image key={item.s} src={item.t!} alt={item.m} fill sizes="(min-width: 768px) 33vw, 100vw" className="fade-in object-contain p-6" />
                </Link>
              ) : (
                <span className="grid h-full place-items-center p-6 text-center text-[14px] text-mute">Энэ өнгөөр {slot.label.toLowerCase()} алга</span>
              )}
              <span className="kicker absolute top-3 left-3 bg-white px-2 py-1 text-[11px]">{slot.label}</span>
              {count > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = pickFrom(pools[slot.id], item?.s);
                    if (next) setSeed((s) => ({ ...s, [`${gender}|${fam}|${slot.id}`]: next.s }));
                  }}
                  className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition hover:rotate-180 hover:bg-cherry"
                  aria-label={`${slot.label}: өөрийг үзэх`}
                >
                  <ShuffleIcon size={18} />
                </button>
              )}
            </div>
            {item && (
              <div className="flex items-end justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link href={`/p/${item.s}`} className="display block truncate text-[22px] leading-none hover:text-cherry">
                    {item.m}
                  </Link>
                  <p className="mt-1 truncate text-[13px] text-ink-2">{item.c}</p>
                  <p className={`mt-1 font-display text-[17px] font-bold ${item.o ? "text-cherry" : ""}`}>{formatPrice(item.p)}</p>
                </div>
                {item.z === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      cart.add(item.s, null);
                      setAdded(item.s);
                      window.setTimeout(() => setAdded(null), 1500);
                    }}
                    className="grid h-11 w-11 shrink-0 place-items-center bg-ink text-white transition hover:bg-cherry"
                    aria-label={`${item.m}: сагсанд хийх`}
                  >
                    {added === item.s ? <CheckIcon size={19} /> : <PlusIcon size={19} />}
                  </button>
                ) : (
                  <Link href={`/p/${item.s}`} className="kicker shrink-0 border border-ink px-3 py-2.5 text-[12px] transition hover:bg-ink hover:text-white">
                    Хэмжээ сонгох
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-5 text-[15px]">
        Хослолын үнэ: <b className="font-display text-[22px] tracking-wide">{formatPrice(total)}</b>
      </p>
    </div>
  );
}
