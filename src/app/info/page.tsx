import type { Metadata } from "next";
import { FacebookIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { SizeFinder } from "@/components/size-finder";
import { business, storeMap } from "@/content/business";
import { MEN_SIZE_CHART, WOMEN_SIZES } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Хүргэлт, төлбөр, хэмжээ",
  description: "ALDO Shoes Mongolia: хүргэлтийн бүс, төлбөр (QPay, StorePay, Pocket), солилт, хэмжээний хүснэгт, салбар дэлгүүрүүд.",
  alternates: { canonical: "/info" },
};

const SECTIONS = [
  ["#delivery", "Хүргэлт"],
  ["#payment", "Төлбөр"],
  ["#exchange", "Солилт"],
  ["#size", "Хэмжээ"],
  ["#stores", "Дэлгүүрүүд"],
  ["#about", "Бидний тухай"],
] as const;

function H2({ id, n, children }: { id: string; n: number; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex scroll-mt-40 items-baseline gap-4 border-t border-ink pt-6">
      <span className="display text-[28px] text-cherry">{String(n).padStart(2, "0")}</span>
      <span className="display text-[44px] md:text-[60px]">{children}</span>
    </h2>
  );
}

export default function InfoPage() {
  return (
    <div className="wrap pt-8 md:pt-12">
      <p className="kicker text-[13px] text-cherry">{business.tagline}</p>
      <h1 className="display mt-1 text-[56px] md:text-[96px]">Мэдээлэл</h1>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Хэсгүүд">
        {SECTIONS.map(([h, t]) => (
          <a key={h} href={h} className="chip">
            {t}
          </a>
        ))}
      </nav>

      <section className="mt-14" aria-labelledby="delivery">
        <H2 id="delivery" n={1}>
          Хүргэлт
        </H2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {business.delivery.map((d, i) => (
            <div key={d.id} className={i === 0 ? "bg-ink p-6 text-white" : "bg-white p-6"}>
              <p className="kicker text-[13px] opacity-70">{d.name}</p>
              <p className="display mt-2 text-[48px]">{d.fee == null ? "Тохиролцоно" : formatPrice(d.fee)}</p>
              <p className="mt-2 text-[14px] leading-snug opacity-80">{d.note}</p>
            </div>
          ))}
        </div>
        <ul className="prose-aldo mt-6 max-w-3xl">
          <li>{business.rules.delivery}</li>
          <li>{business.rules.deliveryFee}</li>
          <li>А, Б бүсийн хил хязгаарыг захиалга баталгаажуулахад манай ажилтан хэлж өгнө.</li>
        </ul>
      </section>

      <section className="mt-20" aria-labelledby="payment">
        <H2 id="payment" n={2}>
          Төлбөр
        </H2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {business.payments.map((m) => (
            <div key={m.id} className="bg-white p-6">
              <p className="display text-[34px]">{m.name}</p>
              <p className="mt-1 text-ink-2">{m.note}</p>
            </div>
          ))}
        </div>
        <ul className="prose-aldo mt-6 max-w-3xl">
          <li>Захиалга өгсний дараа ажилтан утсаар холбогдож, сонгосон аргаар төлбөрийн нэхэмжлэл илгээнэ.</li>
          <li>{business.rules.ebarimt}</li>
        </ul>
      </section>

      <section className="mt-20" aria-labelledby="exchange">
        <H2 id="exchange" n={3}>
          Солилт, буцаалт
        </H2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <p className="bg-white p-6 text-[16px] leading-relaxed">
            <b className="display block text-[28px]">24 цаг</b>
            {business.rules.exchange}
          </p>
          <p className="bg-cherry p-6 text-[16px] leading-relaxed text-white">
            <b className="display block text-[28px]">Хямдралтай бараа</b>
            {business.rules.sale}
          </p>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="size">
        <H2 id="size" n={4}>
          Хэмжээний хүснэгт
        </H2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[420px] text-center text-[14.5px]">
              <caption className="kicker p-4 text-left text-[13px]">Эрэгтэй гутал (дэлгүүрийн хүснэгт)</caption>
              <thead className="bg-ink text-white">
                <tr>
                  {["EU", "US", "UK", "инч", "см"].map((h) => (
                    <th key={h} scope="col" className="kicker px-3 py-2.5 text-[12px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEN_SIZE_CHART.map(([us, uk, eu, inch, cm]) => (
                  <tr key={eu} className="border-t border-line even:bg-studio/60">
                    <th scope="row" className="py-2 font-display text-[17px] font-bold">
                      {eu}
                    </th>
                    <td>{us}</td>
                    <td>{uk}</td>
                    <td>{inch}</td>
                    <td>{cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <SizeFinder chart={MEN_SIZE_CHART} />
            <p className="mt-4 text-[14px] leading-relaxed text-ink-2">
              Эмэгтэй гутлыг EU {WOMEN_SIZES[0]}–{WOMEN_SIZES[WOMEN_SIZES.length - 1]} хэмжээгээр сонгоно. {business.rules.size} Эргэлзвэл салбар дэлгүүр дээр ирж өмсөж үзээрэй.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="stores">
        <H2 id="stores" n={5}>
          Салбар дэлгүүрүүд
        </H2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {business.stores.map((s) => (
            <li key={s.name}>
              <a href={storeMap(s.query)} target="_blank" rel="noreferrer" className="group flex h-full flex-col bg-white p-6 transition hover:bg-ink hover:text-white">
                <PinIcon size={22} className="text-cherry" />
                <span className="display mt-4 text-[32px] leading-none">{s.name}</span>
                <span className="mt-1 text-[14px] opacity-70">{s.floor}</span>
                <span className="mt-4 text-[14px] leading-snug">{s.hours}</span>
                <span className="kicker mt-auto pt-5 text-[12px] text-cherry">Газрын зураг →</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={`tel:${business.phone.tel}`} className="btn btn-ink">
            <PhoneIcon size={18} /> {business.phone.display}
          </a>
          <a href={business.messenger} target="_blank" rel="noreferrer" className="btn btn-line">
            <FacebookIcon size={18} /> Facebook чат
          </a>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="about">
        <H2 id="about" n={6}>
          Бидний тухай
        </H2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <p className="text-[18px] leading-relaxed">{business.about}</p>
          <p className="text-[16px] leading-relaxed text-ink-2">{business.rules.material}</p>
        </div>
      </section>
    </div>
  );
}
