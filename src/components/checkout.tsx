"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { business, deliveryOption, paymentOption, type DeliveryId, type PaymentId } from "@/content/business";
import { cart, cartSubtotal, maxQty, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { resolveLine } from "@/lib/lite";
import type { OrderErrors } from "@/lib/orders/schema";
import { BasketIcon, ChatIcon, CheckIcon, MinusIcon, PhoneIcon, PlusIcon, TrashIcon } from "./icons";

type Done = { reference: string; total: number; deliveryFee: number | null; delivery: DeliveryId; payment: PaymentId; lines: { name: string; size: string | null; qty: number; total: number }[] };

const field = "mt-1.5 w-full border border-ink/25 bg-white px-4 py-3 text-[15.5px] outline-none transition focus:border-ink aria-invalid:border-cherry aria-invalid:bg-cherry/5";
const feeLabel = (fee: number | null) => (fee == null ? "Холбогдож мэдэгдэнэ" : `${formatPrice(fee)} · хүргэгчид`);

export function Checkout() {
  const items = useCart();
  const [delivery, setDelivery] = useState<DeliveryId>("zone-a");
  const [payment, setPayment] = useState<PaymentId>("qpay");
  const [receiptType, setReceiptType] = useState<"person" | "company">("person");
  const [errors, setErrors] = useState<OrderErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const lines = items.flatMap((i) => {
    const l = resolveLine(i.slug, i.size);
    return l ? [{ ...i, line: l }] : [];
  });
  const subtotal = cartSubtotal(items);
  const fee = deliveryOption(delivery).fee;
  const hasShoes = lines.some((l) => l.size);

  if (done) return <Receipt done={done} />;

  if (!lines.length)
    return (
      <div className="mx-auto max-w-lg bg-white px-8 py-14 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-ink text-white">
          <BasketIcon size={34} />
        </span>
        <p className="display mt-6 text-[40px]">Сагс хоосон байна</p>
        <p className="mt-2 text-[15px] text-mute">Шинэ улирлын загваруудаас сонгоорой.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
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
      </div>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setNotice(null);
    setErrors({});
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          email: f.get("email"),
          delivery,
          address: f.get("address") ?? "",
          payment,
          receiptType,
          regNo: f.get("regNo") ?? "",
          note: f.get("note"),
          website: f.get("website"),
          items: items.map(({ slug, size, qty }) => ({ slug, size, qty })),
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setDone({
          reference: json.reference,
          total: json.total ?? subtotal,
          deliveryFee: json.deliveryFee ?? fee,
          delivery,
          payment,
          lines: lines.map((l) => ({ name: l.line.product.c ? `${l.line.product.m} · ${l.line.product.c}` : l.line.product.m, size: l.size, qty: l.qty, total: l.line.price * l.qty })),
        });
        cart.clear();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 422 && json?.errors) {
        setErrors(json.errors);
        setNotice("Мэдээллээ шалгаад дахин оролдоно уу.");
      } else if (json?.error === "not_configured") {
        setNotice(`Онлайн захиалгын систем тохируулагдаж байна. Захиалгаа ${business.phone.display} дугаарт эсвэл Facebook чатаар өгнө үү (лавлах код ${json.reference}, нийт ${formatPrice(json.total ?? subtotal)}).`);
      } else {
        setNotice(`Захиалга илгээхэд алдаа гарлаа. Дахин оролдох эсвэл ${business.phone.display} дугаарт залгана уу.`);
      }
    } catch {
      setNotice("Интернэт холболтоо шалгаад дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: keyof OrderErrors) => errors[k] && <p className="mt-1.5 text-[13.5px] font-semibold text-cherry">{errors[k]}</p>;
  const step = (n: number, t: string) => (
    <h2 className="flex items-baseline gap-3">
      <span className="display text-[34px] text-cherry">{String(n).padStart(2, "0")}</span>
      <span className="display text-[28px]">{t}</span>
    </h2>
  );
  const radio = (on: boolean) => <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-ink" : "border-ink/30"}`}>{on && <span className="h-2.5 w-2.5 rounded-full bg-cherry" />}</span>;
  const option = "flex items-start gap-3 border border-ink/20 bg-white p-4 text-left transition hover:border-ink/60 aria-checked:border-ink aria-checked:shadow-[inset_0_0_0_1px_var(--ink)]";

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <div className="space-y-6">
        <section className="bg-white">
          <ul className="divide-y divide-line">
            {lines.map(({ slug, size, qty, line }) => (
              <li key={`${slug}|${size}`} className="flex gap-4 p-4">
                <Link href={`/p/${slug}`} className="studio relative h-24 w-24 shrink-0 overflow-hidden">
                  {line.product.t ? <Image src={line.product.t} alt="" fill sizes="96px" className="object-contain p-2" /> : <span className="display grid h-full place-items-center text-[18px] text-ink/20">ALDO</span>}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/p/${slug}`} className="display truncate text-[22px] leading-none hover:text-cherry">
                    {line.product.m}
                  </Link>
                  <span className="mt-1 text-[13px] text-ink-2">
                    {[line.product.c, size && `Хэмжээ ${size}`].filter(Boolean).join(" · ")}
                  </span>
                  <span className="text-[13px] text-mute">{formatPrice(line.price)} / ш</span>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center border border-ink">
                      <button type="button" onClick={() => cart.setQty(slug, size, qty - 1)} className="grid h-9 w-9 place-items-center hover:bg-studio" aria-label="Цөөлөх">
                        <MinusIcon size={15} />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{qty}</span>
                      <button type="button" onClick={() => cart.setQty(slug, size, qty + 1)} disabled={qty >= maxQty(slug, size)} className="grid h-9 w-9 place-items-center hover:bg-studio disabled:opacity-30" aria-label="Нэмэх">
                        <PlusIcon size={15} />
                      </button>
                    </div>
                    <span className="font-display text-[18px] font-bold">{formatPrice(line.price * qty)}</span>
                    <button type="button" onClick={() => cart.setQty(slug, size, 0)} className="grid h-9 w-9 place-items-center text-mute hover:text-cherry" aria-label={`${line.product.m}: хасах`}>
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-5 md:p-7">
          {step(1, "Захиалагч")}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-[14px] font-semibold">
              Нэр
              <input name="name" autoComplete="name" required aria-invalid={!!errors.name} className={field} />
              {err("name")}
            </label>
            <label className="text-[14px] font-semibold">
              Утас
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="99112233" required aria-invalid={!!errors.phone} className={field} />
              {err("phone")}
            </label>
            <label className="text-[14px] font-semibold sm:col-span-2">
              Имэйл <span className="font-normal text-mute">(заавал биш)</span>
              <input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} className={field} />
              {err("email")}
            </label>
          </div>
          {hasShoes && <p className="mt-4 border-l-2 border-cherry pl-3 text-[13.5px] text-ink-2">{business.rules.size}</p>}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </section>

        <section className="bg-white p-5 md:p-7">
          {step(2, "Хүргэлт")}
          <div className="mt-5 grid gap-2.5" role="radiogroup" aria-label="Хүргэлтийн бүс">
            {business.delivery.map((d) => (
              <button key={d.id} type="button" role="radio" aria-checked={delivery === d.id} onClick={() => setDelivery(d.id)} className={option}>
                {radio(delivery === d.id)}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 font-semibold">
                    {d.name}
                    <span className="text-[14px] text-cherry">{feeLabel(d.fee)}</span>
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-2">{d.note}</span>
                </span>
              </button>
            ))}
          </div>
          {err("delivery")}
          <label className="mt-4 block text-[14px] font-semibold">
            {delivery === "countryside" ? "Аймаг, сум, хүлээн авах хаяг" : "Хаяг"}
            <textarea name="address" rows={2} required aria-invalid={!!errors.address} placeholder={delivery === "countryside" ? "Аймаг, сум, баг, хүлээн авах хүн" : "Дүүрэг, хороо, байр, орц, давхар, тоот"} className={field} />
            {err("address")}
          </label>
          <p className="mt-3 text-[13.5px] text-ink-2">{business.rules.delivery}</p>
        </section>

        <section className="bg-white p-5 md:p-7">
          {step(3, "Төлбөр, и-баримт")}
          <div className="mt-5 grid gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Төлбөрийн хэлбэр">
            {business.payments.map((m) => (
              <button key={m.id} type="button" role="radio" aria-checked={payment === m.id} onClick={() => setPayment(m.id)} className={option}>
                {radio(payment === m.id)}
                <span>
                  <span className="block font-semibold">{m.name}</span>
                  <span className="block text-[12.5px] leading-snug text-ink-2">{m.note}</span>
                </span>
              </button>
            ))}
          </div>
          {err("payment")}
          <div className="mt-6 flex gap-2" role="radiogroup" aria-label="И-баримтын төрөл">
            {(
              [
                ["person", "Хувь хүн"],
                ["company", "Байгууллага"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={receiptType === id} onClick={() => setReceiptType(id)} className="chip aria-checked:bg-ink aria-checked:text-white">
                {label}
              </button>
            ))}
          </div>
          {receiptType === "company" ? (
            <label className="mt-4 block text-[14px] font-semibold">
              Байгууллагын регистр
              <input name="regNo" inputMode="numeric" maxLength={7} placeholder="1234567" aria-invalid={!!errors.regNo} className={field} />
              {err("regNo")}
            </label>
          ) : (
            <p className="mt-3 text-[13.5px] text-mute">И-баримтыг таны утасны дугаараар бүртгэнэ.</p>
          )}
          <label className="mt-5 block text-[14px] font-semibold">
            Нэмэлт тайлбар <span className="font-normal text-mute">(хүргэх цаг гэх мэт)</span>
            <textarea name="note" rows={2} className={field} />
          </label>
        </section>
      </div>

      <aside className="lg:sticky lg:top-36 lg:self-start">
        <div className="bg-ink p-6 text-white md:p-8">
          <h2 className="display text-[40px]">Төлөх дүн</h2>
          <dl className="mt-5 space-y-2.5 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-white/70">Барааны дүн</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-white/20 pt-3">
              <dt className="font-semibold">Онлайн төлөх</dt>
              <dd className="font-display text-[34px] font-bold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-[14px]">
              <dt className="text-white/70">Хүргэлт ({deliveryOption(delivery).name})</dt>
              <dd className="shrink-0 font-semibold text-cherry">{feeLabel(fee)}</dd>
            </div>
          </dl>
          <p className="mt-5 bg-white/10 p-4 text-[13px] leading-snug text-white/85">{business.rules.deliveryFee}</p>
          {notice && (
            <p role="alert" className="mt-4 bg-white px-4 py-3 text-[14px] font-semibold text-ink">
              {notice}
            </p>
          )}
          {errors.items && <p className="mt-3 bg-cherry px-3 py-2 text-[14px] font-semibold">{errors.items}</p>}
          <button type="submit" disabled={busy} className="btn btn-cherry mt-6 h-14 w-full text-[17px] disabled:cursor-wait disabled:opacity-70">
            {busy ? "Илгээж байна…" : "Захиалга өгөх"}
          </button>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold text-white/85">
            <a href={`tel:${business.phone.tel}`} className="inline-flex items-center gap-2 hover:text-cherry">
              <PhoneIcon size={16} /> {business.phone.display}
            </a>
            <a href={business.messenger} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-cherry">
              <ChatIcon size={16} /> Facebook чат
            </a>
          </div>
          <p className="mt-4 text-[12.5px] text-white/55">{business.rules.exchange}</p>
        </div>
      </aside>
    </form>
  );
}

function Receipt({ done }: { done: Done }) {
  const option = deliveryOption(done.delivery);
  return (
    <div className="mx-auto max-w-lg">
      <div className="fade-in overflow-hidden bg-white">
        <div className="bg-ink p-8 text-white">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-cherry">
            <CheckIcon size={28} />
          </span>
          <h2 className="display mt-5 text-[44px]">Захиалга хүлээн авлаа</h2>
          <p className="mt-2 text-white/80">
            Захиалгын код: <b className="text-white">{done.reference}</b>
          </p>
        </div>
        <div className="p-8">
          <ul className="space-y-2 text-[14.5px]">
            {done.lines.map((l) => (
              <li key={`${l.name}|${l.size}`} className="flex justify-between gap-4">
                <span className="text-ink-2">
                  {l.name}
                  {l.size && ` · ${l.size}`} × {l.qty}
                </span>
                <span className="shrink-0 font-semibold">{formatPrice(l.total)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-4 border-t border-line pt-3 text-lg font-bold">
              <span>Онлайн төлөх</span>
              <span>{formatPrice(done.total)}</span>
            </li>
            <li className="flex justify-between gap-4 text-ink-2">
              <span>{option.name}</span>
              <span className="shrink-0">{feeLabel(done.deliveryFee)}</span>
            </li>
          </ul>
          <p className="mt-6 text-[14.5px] leading-relaxed text-ink-2">
            Манай ажилтан {done.lines.some((l) => l.size) ? "хэмжээ, үлдэгдлийг шалгаад " : ""}утсаар холбогдож {paymentOption(done.payment).name}-ийн нэхэмжлэлийг илгээнэ. {business.rules.delivery} {business.rules.ebarimt}
          </p>
          <Link href="/" className="btn btn-ink mt-7">
            Нүүр хуудас
          </Link>
        </div>
      </div>
    </div>
  );
}
