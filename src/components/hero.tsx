"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Banner = { src: string; w: number; h: number; title: string };

/**
 * Runway headline on bone, then the owner's Zochil banners (about 2:1, with their own lettering) shown whole
 * in a crossfading slider. Nothing is laid over the banners so their text stays readable.
 */
export function Hero({ banners, count }: { banners: Banner[]; count: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || banners.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % banners.length), 5500);
    return () => window.clearInterval(t);
  }, [paused, banners.length]);

  return (
    <section className="relative overflow-hidden">
      <div className="wrap relative pt-8 pb-8 md:pt-14 md:pb-12">
        <p className="kicker text-[13px] text-cherry">Шинэ улирал · {count}</p>
        <h1 className="display mt-2 max-w-5xl text-[54px] sm:text-[84px] md:text-[118px]">
          Алхам бүрт <span className="outline-text">өөрийн</span> <span className="text-cherry">хэв маяг</span>
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/shop?g=women" className="btn btn-ink">
            Эмэгтэй
          </Link>
          <Link href="/shop?g=men" className="btn btn-line">
            Эрэгтэй
          </Link>
          <Link href="/shop?sale=1" className="btn btn-cherry">
            Хямдрал
          </Link>
        </div>
        <svg viewBox="0 0 200 200" className="spin-slow absolute top-10 right-6 hidden h-40 w-40 text-ink lg:block" aria-hidden>
          <defs>
            <path id="seal" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text fontSize="17" letterSpacing="5" fill="currentColor" fontFamily="var(--font-display)" fontWeight="700">
            <textPath href="#seal">ALDO · ULAANBAATAR · NEW SEASON ·</textPath>
          </text>
        </svg>
        <span className="display pointer-events-none absolute top-[118px] right-[86px] hidden text-[34px] text-cherry lg:block" aria-hidden>
          A
        </span>
      </div>

      <div className="wrap" aria-roledescription="carousel" aria-label="ALDO-гийн зарлал" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="relative aspect-[2/1] overflow-hidden bg-ink">
          {banners.map((b, k) => (
            <div key={b.src} className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? "opacity-100" : "opacity-0"}`} aria-hidden={k !== i}>
              <Image src={b.src} alt={k === i ? `ALDO зарлал ${k + 1}` : ""} fill priority={k === 0} sizes="(min-width: 1400px) 1320px, 100vw" className={`object-cover ${k === i ? "animate-[kenburns_7s_ease-out_forwards]" : ""}`} />
            </div>
          ))}
        </div>
        {banners.length > 1 && (
          <div className="mt-3 flex items-center gap-2">
            {banners.map((b, k) => (
              <button key={b.src} type="button" onClick={() => setI(k)} aria-label={`Зураг ${k + 1}`} aria-current={k === i} className="h-1.5 w-8 bg-ink/20 transition-all aria-[current=true]:w-14 aria-[current=true]:bg-cherry" />
            ))}
            <span className="kicker ml-auto text-[12px] text-mute">
              {String(i + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
