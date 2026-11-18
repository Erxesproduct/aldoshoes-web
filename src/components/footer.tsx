import Image from "next/image";
import Link from "next/link";
import { business, storeMap } from "@/content/business";
import { formatPrice } from "@/lib/format";
import { NAV } from "./header";
import { FacebookIcon, PhoneIcon, PinIcon } from "./icons";

export function Footer() {
  return (
    <footer className="mt-28 bg-ink text-white">
      <div className="overflow-hidden border-b border-white/10 py-6" aria-hidden>
        <div className="marquee marquee-slow">
          {[0, 1].map((k) => (
            <span key={k} className="display flex shrink-0 gap-10 pr-10 text-[64px] md:text-[96px]">
              {["ALDO", "Шинэ улирал", "ALDO", "Гутал · Цүнх · Гоёл"].map((t, i) => (
                <span key={i} className={i % 2 ? "text-white/90" : "text-transparent [-webkit-text-stroke:1.5px_#fff]"}>
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="wrap grid gap-12 py-14 md:grid-cols-[1.1fr_0.7fr_1.6fr]">
        <div>
          <Image src="/brand/aldo-white.png" alt="ALDO" width={140} height={38} className="h-8 w-auto" />
          <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-white/70">{business.about}</p>
          <a href={business.facebook} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 border border-white/30 px-4 py-2.5 text-[14px] font-semibold transition hover:border-white hover:bg-white hover:text-ink">
            <FacebookIcon size={18} /> facebook.com/aldoshoesmn
          </a>
        </div>
        <div>
          <p className="kicker text-[13px] text-white/50">Дэлгүүр</p>
          <ul className="mt-4 grid gap-2 text-[15px] font-semibold">
            {NAV.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-cherry">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker text-[13px] text-white/50">Холбоо барих</p>
          <a href={`tel:${business.phone.tel}`} className="group mt-4 flex items-center gap-4 border border-white/15 p-4 transition hover:border-white">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cherry">
              <PhoneIcon size={19} />
            </span>
            <span>
              <span className="block text-[12px] tracking-widest text-white/50 uppercase">Утас</span>
              <span className="display block text-[28px] leading-none tracking-wide">{business.phone.display}</span>
            </span>
          </a>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {business.stores.map((s) => (
              <li key={s.name}>
                <a href={storeMap(s.query)} target="_blank" rel="noreferrer" className="flex h-full flex-col border border-white/15 p-3.5 transition hover:border-white">
                  <PinIcon size={17} className="text-cherry" />
                  <span className="mt-2 text-[14px] leading-snug font-semibold">{s.name}</span>
                  <span className="text-[12.5px] text-white/60">{s.floor}</span>
                  <span className="mt-2 text-[12px] leading-snug text-white/50">{s.hours}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-white/60">
            Хүргэлт: {business.delivery.filter((d) => d.fee).map((d) => `${d.name.replace("Хот дотор · ", "")} ${formatPrice(d.fee!)}`).join(" · ")} · {business.rules.delivery}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="wrap py-5 text-[12.5px] text-white/45">© {new Date().getFullYear()} ALDO Shoes Mongolia. ALDO-гийн Монгол дахь албан ёсны онлайн дэлгүүр.</p>
      </div>
    </footer>
  );
}
