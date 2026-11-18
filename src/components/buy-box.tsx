"use client";

import Link from "next/link";
import { useState } from "react";
import { cart, maxQty, useCart } from "@/lib/cart";
import { getLite, liteSizes } from "@/lib/lite";
import { BasketIcon, CheckIcon } from "./icons";

/** Size grid (shoes) + «Сагсанд хийх». Sizes come from Zochil when listed, otherwise the usual EU range. */
export function BuyBox({ slug, name }: { slug: string; name: string }) {
  const p = getLite(slug)!;
  const sizes = liteSizes(p);
  const listed = Array.isArray(p.z);
  const items = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [warn, setWarn] = useState(false);

  if (p.k === 0)
    return (
      <div className="border border-line bg-white p-5">
        <p className="display text-[22px]">Дууссан</p>
        <p className="mt-1 text-[14px] text-ink-2">Дахин ирэх эсэхийг Facebook чатаар асуугаарай.</p>
      </div>
    );

  const inCart = items.filter((i) => i.slug === slug).reduce((n, i) => n + i.qty, 0);
  const canAdd = sizes.length ? size != null && maxQty(slug, size) > (items.find((i) => i.slug === slug && i.size === size)?.qty ?? 0) : maxQty(slug, null) > inCart;

  return (
    <div>
      {sizes.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="kicker text-[13px]">Хэмжээ (EU)</p>
            {p.g === "men" && (
              <Link href="/info#size" className="text-[13px] font-semibold underline underline-offset-4 hover:text-cherry">
                Хэмжээний хүснэгт
              </Link>
            )}
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="Хэмжээ">
            {sizes.map(([s, stock]) => {
              const out = stock === 0;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  disabled={out}
                  onClick={() => {
                    setSize(s);
                    setWarn(false);
                  }}
                  className="h-12 border border-line bg-white text-[15px] font-semibold transition hover:border-ink disabled:cursor-not-allowed disabled:text-mute disabled:line-through aria-checked:border-ink aria-checked:bg-ink aria-checked:text-white"
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p className={`mt-2 text-[13px] ${warn ? "font-semibold text-cherry" : "text-mute"}`}>{warn ? "Эхлээд хэмжээгээ сонгоно уу." : listed ? "Зураастай хэмжээ дууссан." : "Хэмжээ бэлэн эсэхийг манай ажилтан утсаар баталгаажуулна."}</p>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          if (sizes.length && !size) return setWarn(true);
          if (!canAdd) return;
          cart.add(slug, sizes.length ? size : null);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
        className="btn btn-ink mt-5 h-14 w-full"
        aria-label={`${name}: сагсанд хийх`}
      >
        {added ? <CheckIcon size={20} /> : <BasketIcon size={20} />}
        {added ? "Сагсанд орлоо" : sizes.length && size && !canAdd ? "Үлдэгдэл хүрэлцэхгүй" : "Сагсанд хийх"}
      </button>
      {inCart > 0 && (
        <Link href="/cart" className="mt-3 block text-center text-[14px] font-semibold underline underline-offset-4 hover:text-cherry">
          Сагсанд {inCart} ширхэг · Захиалах →
        </Link>
      )}
    </div>
  );
}
