import Image from "next/image";
import Link from "next/link";
import { business } from "@/content/business";
import { onSale, products } from "@/lib/catalog";
import { countLabel } from "@/lib/format";
import { CartLink } from "./cart-link";
import { SearchIcon } from "./icons";
import { Scroller } from "./scroller";

const saleCount = products.filter(onSale).length;
const ticker = ["ALDO-гийн албан ёсны онлайн дэлгүүр", "24–48 цагт хүргэнэ", `Хямдрал: ${countLabel(saleCount)}`, "QPay · StorePay · Pocket", "24 цагийн дотор салбар дээр солино", "Шангри-Ла · Их Дэлгүүр · Хүннү Молл"];

export const NAV = [
  ["/shop?g=women", "Эмэгтэй"],
  ["/shop?g=men", "Эрэгтэй"],
  ["/shop?d=bags", "Цүнх"],
  ["/shop?d=jewelry", "Гоёл"],
  ["/shop?sale=1", "Хямдрал"],
  ["/info", "Мэдээлэл"],
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      <div className="overflow-hidden bg-cherry py-1.5 text-white" aria-label="Мэдээлэл">
        <div className="marquee">
          {[0, 1].map((k) => (
            <span key={k} className="flex shrink-0" aria-hidden={k === 1}>
              {ticker.map((t) => (
                <span key={t} className="kicker flex items-center gap-6 px-6 text-[12px]">
                  {t}
                  <span className="h-1 w-1 rounded-full bg-white/70" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="border-b border-line bg-bone/95 backdrop-blur">
        <div className="wrap flex h-16 items-center gap-4 md:h-[72px] md:gap-8">
          <Link href="/" aria-label={`${business.name}: нүүр`} className="shrink-0">
            <Image src="/brand/aldo-ink.png" alt="ALDO" width={110} height={30} priority className="h-6 w-auto md:h-7" />
          </Link>
          <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Үндсэн цэс">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={`kicker px-3 py-2 text-[14px] transition hover:text-cherry ${label === "Хямдрал" ? "text-cherry" : ""}`}>
                {label}
              </Link>
            ))}
          </nav>
          <form action="/shop" role="search" className="relative ml-auto hidden md:block lg:ml-0">
            <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-ink-2" />
            <input name="q" type="search" placeholder="Загвар, өнгө хайх" aria-label="Хайх" className="h-10 w-52 border-b border-ink/40 bg-transparent pr-2 pl-7 text-[14px] outline-none placeholder:text-mute focus:border-ink" />
          </form>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link href="/shop" className="grid h-11 w-11 place-items-center md:hidden" aria-label="Хайх">
              <SearchIcon size={21} />
            </Link>
            <CartLink />
          </div>
        </div>
        <div className="wrap lg:hidden">
          <Scroller as="nav" label="Үндсэн цэс" small className="flex gap-1 overflow-x-auto pb-2 select-none [scrollbar-width:none]">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={`kicker shrink-0 px-3 py-1.5 text-[13px] ${label === "Хямдрал" ? "text-cherry" : ""}`}>
                {label}
              </Link>
            ))}
          </Scroller>
        </div>
      </div>
    </header>
  );
}
