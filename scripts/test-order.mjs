/**
 * End-to-end check of the website order flow (cart → /api/orders → erxes).
 *
 *   node scripts/test-order.mjs [baseUrl] [--send]
 *
 * Without --send it only runs the validation cases (no order reaches erxes).
 * With --send it also places ONE real test order, marked «ТЕСТ ЗАХИАЛГА: устгана уу» in the note.
 * Exit code 1 if any check fails.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000").replace(/\/$/, "");
const send = args.includes("--send");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(path.join(root, "src", "data", "catalog.json"), "utf8"));
const P = catalog.products;
// ALDO delivery rule: A zone 10,000₮, B zone 20,000₮, paid to the courier on receipt (never in the online total);
// countryside fee told by phone (null). No pick-up.
const FEES = { "zone-a": 10000, "zone-b": 20000, countryside: null };
const orderable = (p) => p.stock == null || p.stock >= 1;
const WOMEN = ["35", "36", "37", "38", "39", "40", "41"];
const MEN = ["39", "40", "41", "42", "42.5", "43", "43.5", "44", "45", "46", "47"];
const sizeOf = (p) => (p.sizes ? p.sizes.find((s) => s.stock !== 0)?.size : (p.gender === "men" ? MEN : WOMEN)[2]);

const bags = P.filter((p) => !p.needsSize && orderable(p)).sort((a, b) => a.price - b.price);
const bag = bags.find((p) => p.stock == null || p.stock >= 2);
const shoe = P.filter((p) => p.needsSize && !p.sizes && orderable(p)).sort((a, b) => a.price - b.price)[0];
const listed = P.find((p) => p.needsSize && p.sizes?.some((s) => s.stock !== 0));
const soldout = P.find((p) => p.stock === 0);
const scarce = P.find((p) => !p.needsSize && p.stock != null && p.stock > 0 && p.stock < 10);

const SUBTOTAL = bag.price * 2 + shoe.price;

const order = {
  name: "Тест Захиалагч",
  phone: "99112233",
  delivery: "zone-a",
  address: "Сүхбаатар дүүрэг, 1-р хороо, тест хаяг, 1 тоот",
  payment: "qpay",
  receiptType: "person",
  note: "ТЕСТ ЗАХИАЛГА: устгана уу",
  items: [
    { slug: bag.slug, size: null, qty: 2 },
    { slug: shoe.slug, size: sizeOf(shoe), qty: 1 },
  ],
};

async function post(body) {
  const res = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: res.status, json: await res.json().catch(() => null) };
}

// valid = passed validation (200 when erxes is set, 503 not_configured otherwise)
const valid = (r) => !r.json?.errors && (r.status === 200 || r.status === 503);
const rejects = (field) => (r) => r.status === 422 && !!r.json?.errors?.[field];
const total = (expected) => (r) => valid(r) && r.json?.total === expected;

const cases = [
  ["empty cart is rejected", { ...order, items: [] }, rejects("items")],
  ["unknown product is ignored (then empty)", { ...order, items: [{ slug: "no-such-product", size: null, qty: 1 }] }, rejects("items")],
  [`shoes without a size are rejected (${shoe.slug})`, { ...order, items: [{ slug: shoe.slug, size: null, qty: 1 }] }, (r) => rejects("items")(r) && /хэмжээ/i.test(r.json.errors.items)],
  [`shoes with a size outside the range are rejected (${shoe.slug}, 52)`, { ...order, items: [{ slug: shoe.slug, size: "52", qty: 1 }] }, rejects("items")],
  ...(listed ? [[`a listed Zochil size is accepted (${listed.slug}, ${sizeOf(listed)})`, { ...order, items: [{ slug: listed.slug, size: sizeOf(listed), qty: 1 }] }, total(listed.price)]] : []),
  ...(soldout ? [[`sold-out product is not orderable (${soldout.slug})`, { ...order, items: [{ slug: soldout.slug, size: sizeOf(soldout) ?? null, qty: 1 }] }, rejects("items")]] : []),
  ...(scarce ? [[`more than the stock is rejected (${scarce.slug}, stock ${scarce.stock})`, { ...order, items: [{ slug: scarce.slug, size: null, qty: scarce.stock + 1 }] }, rejects("items")]] : []),
  [`A zone: online total ${SUBTOTAL}₮, 10,000₮ to the courier`, order, (r) => total(SUBTOTAL)(r) && r.json?.deliveryFee === FEES["zone-a"]],
  ["B zone: same online total, 20,000₮ to the courier", { ...order, delivery: "zone-b" }, (r) => total(SUBTOTAL)(r) && r.json?.deliveryFee === FEES["zone-b"]],
  ["countryside: fee told later (null)", { ...order, delivery: "countryside", address: "Дархан-Уул, Дархан сум, 5-р баг, шуудангаар" }, (r) => total(SUBTOTAL)(r) && r.json?.deliveryFee === null],
  ["pick-up is not offered (not enabled on Zochil)", { ...order, delivery: "pickup", address: "" }, rejects("delivery")],
  ["address is required for city delivery", { ...order, address: "" }, rejects("address")],
  ["countryside needs an address", { ...order, delivery: "countryside", address: "" }, rejects("address")],
  ["QPay is accepted", order, valid],
  ["StorePay is accepted", { ...order, payment: "storepay" }, valid],
  ["Pocket is accepted", { ...order, payment: "pocket" }, valid],
  ["HiPay is not offered (no erxes payment kind)", { ...order, payment: "hipay" }, rejects("payment")],
  ["unknown payment is rejected", { ...order, payment: "cash" }, rejects("payment")],
  ["unknown delivery option is rejected", { ...order, delivery: "drone" }, rejects("delivery")],
  ["company eBarimt needs a 7-digit registry number", { ...order, receiptType: "company", regNo: "12" }, rejects("regNo")],
  ["company eBarimt with a valid registry number passes", { ...order, receiptType: "company", regNo: "1234567" }, valid],
  ["bad phone is rejected", { ...order, phone: "123" }, rejects("phone")],
  ["+976 phone prefix is accepted", { ...order, phone: "+976 9911 2233" }, valid],
  ["bad email is rejected", { ...order, email: "not-an-email" }, rejects("email")],
  ["quantity over 10 is ignored", { ...order, items: [{ slug: bag.slug, size: null, qty: 11 }] }, rejects("items")],
  ["the browser's price is ignored", { ...order, items: [{ slug: bag.slug, size: null, qty: 1, price: 1 }] }, total(bag.price)],
  ["honeypot is silently accepted", { ...order, website: "spam" }, (r) => r.status === 200 && r.json?.ok === true],
];

let failed = 0;
console.log(`Order API checks against ${base}\n`);
for (const [label, body, ok] of cases) {
  const r = await post(body);
  const pass = ok(r);
  if (!pass) failed++;
  console.log(`${pass ? "✓" : "✗"} ${label}  (${r.status}${r.json?.errors ? " " + Object.keys(r.json.errors).join(",") : ""})`);
}

if (send) {
  const r = await post(order);
  if (r.status === 200 && r.json?.ok) {
    console.log(`\n✓ test order delivered to erxes: ${r.json.reference}, online total ${r.json.total}₮ (expected ${SUBTOTAL})`);
    if (r.json.total !== SUBTOTAL) {
      failed++;
      console.log("✗ unexpected total");
    }
  } else if (r.status === 503 && r.json?.error === "not_configured") {
    console.log(`\n– test order NOT sent: erxes env vars are not set on ${base} (reference ${r.json.reference}). See .env.example.`);
  } else {
    failed++;
    console.log(`\n✗ test order failed: ${r.status} ${JSON.stringify(r.json)}`);
  }
}

console.log(failed ? `\n${failed} check(s) failed` : `\nall ${cases.length} checks passed`);
process.exit(failed ? 1 : 0);
