"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";
import { BasketIcon } from "./icons";

export function CartLink() {
  const n = cartCount(useCart());
  return (
    <Link href="/cart" className="relative grid h-11 w-11 place-items-center transition hover:text-cherry" aria-label={n ? `Сагс, ${n} бараа` : "Сагс"}>
      <BasketIcon size={22} />
      {n > 0 && (
        <span key={n} className="fade-in absolute top-0.5 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-cherry px-1 text-[11px] font-bold text-white">
          {n}
        </span>
      )}
    </Link>
  );
}
