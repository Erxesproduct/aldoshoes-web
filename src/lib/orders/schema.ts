import { business, deliveryOption, type DeliveryId, type PaymentId } from "@/content/business";
import { getProduct, resolveLine, type Product } from "@/lib/catalog";

export type PaymentMethod = PaymentId;
export type OrderLine = { product: Product; size: string | null; qty: number; unitPrice: number; lineTotal: number };

export type Order = {
  name: string;
  phone: string;
  email: string | null;
  delivery: DeliveryId;
  address: string;
  payment: PaymentMethod;
  /** eBarimt receipt: to a person (by phone) or to an organization (7-digit registry number). */
  receipt: { type: "person" } | { type: "company"; regNo: string };
  note: string | null;
  lines: OrderLine[];
  subtotal: number;
  /** Paid to the courier on receipt (A / B zone), or told later (countryside, null). Never part of the online total. */
  deliveryFee: number | null;
  total: number;
  /** Honeypot: real visitors never fill it. */
  website: string;
};

export type OrderField = "name" | "phone" | "email" | "delivery" | "address" | "payment" | "regNo" | "items";
export type OrderErrors = Partial<Record<OrderField, string>>;

export const MAX_QTY = 10;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** 8-digit Mongolian number, optionally prefixed with +976 / 976. Returns the 8 digits or null. */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[\s\-()]/g, "").replace(/^\+?976/, "");
  return /^[5-9]\d{7}$/.test(digits) ? digits : null;
}

export function validateOrder(body: unknown): { ok: true; order: Order } | { ok: false; errors: OrderErrors } {
  const b = (body ?? {}) as Record<string, unknown>;
  const errors: OrderErrors = {};

  const name = str(b.name, 80);
  if (name.length < 2) errors.name = "Нэрээ оруулна уу.";
  const phone = normalizePhone(str(b.phone, 20));
  if (!phone) errors.phone = "8 оронтой утасны дугаар оруулна уу.";
  const email = str(b.email, 120) || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Имэйл хаяг буруу байна.";

  const payment = business.payments.find((p) => p.id === b.payment)?.id;
  if (!payment) errors.payment = "Төлбөрийн хэлбэрээ сонгоно уу.";

  const receiptType = b.receiptType === "company" ? "company" : "person";
  const regNo = str(b.regNo, 20).replace(/\s/g, "");
  if (receiptType === "company" && !/^\d{7}$/.test(regNo)) errors.regNo = "Байгууллагын 7 оронтой регистрийн дугаар оруулна уу.";
  const note = str(b.note, 500) || null;

  // Prices always come from the catalog, never from the browser. Shoes need a size from the product's list.
  const rawItems = Array.isArray(b.items) ? b.items.slice(0, 30) : [];
  const lines: OrderLine[] = [];
  let soldOut = false;
  let noSize = false;
  for (const raw of rawItems) {
    const i = (raw ?? {}) as Record<string, unknown>;
    const size = typeof i.size === "string" ? i.size : null;
    const line = typeof i.slug === "string" ? resolveLine(i.slug, size) : null;
    const qty = Number(i.qty);
    if (!line) {
      if (typeof i.slug === "string" && getProduct(i.slug)?.needsSize) noSize = true;
      continue;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) continue;
    if (line.stock === 0) {
      soldOut = true;
      continue;
    }
    if (line.stock != null && qty > line.stock) continue;
    if (lines.some((l) => l.product.slug === line.product.slug && l.size === line.size)) continue;
    lines.push({ product: line.product, size: line.size, qty, unitPrice: line.price, lineTotal: line.price * qty });
  }
  if (!lines.length) errors.items = soldOut ? "Сагсанд байгаа бараа дууссан байна." : noSize ? "Гутлын хэмжээгээ сонгоно уу." : "Сагс хоосон байна.";
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  const delivery = business.delivery.find((d) => d.id === b.delivery)?.id;
  if (!delivery) errors.delivery = "Хүргэлтийн бүсээ сонгоно уу.";
  const address = str(b.address, 300);
  if (address.length < 8)
    errors.address = delivery === "countryside" ? "Аймаг, сум, хүлээн авах хаягаа бичнэ үү." : "Хаягаа дэлгэрэнгүй бичнэ үү (дүүрэг, хороо, байр, орц, тоот).";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    order: {
      name,
      phone: phone!,
      email,
      delivery: delivery!,
      address,
      payment: payment!,
      receipt: receiptType === "company" ? { type: "company", regNo } : { type: "person" },
      note,
      lines,
      subtotal,
      deliveryFee: deliveryOption(delivery!).fee,
      // the delivery fee is paid to the courier, so the online total is the goods
      total: subtotal,
      website: str(b.website, 100),
    },
  };
}
