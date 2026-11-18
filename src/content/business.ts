/**
 * Business facts from aldoshoes.mn (Zochil shop 10783: shop settings, payment / delivery rules, terms, About, FAQ,
 * the post «Хүргэлтийн бүс») and the Facebook page facebook.com/aldoshoesmn, read on 2026-11-18. Nothing here is
 * invented; open questions are listed in docs/erxes/MANUAL-STEPS.md.
 */
export const business = {
  name: "ALDO Shoes Mongolia",
  tagline: "ALDO-гийн Монгол дахь албан ёсны онлайн дэлгүүр",
  /** Zochil shop description / About. */
  about: "Дэлхийн 100 гаруй улс оронд 3000 салбар дэлгүүртэй, загварлаг гутал цүнхний дэлхийн брэнд ALDO-гийн Монгол улс дахь албан ёсны онлайн дэлгүүр.",
  description: "ALDO Shoes Mongolia: эмэгтэй, эрэгтэй гутал, цүнх, түрийвч, гоёл чимэглэл. Шангри-Ла, Улаанбаатар Их Дэлгүүр, Хүннү Молл.",
  phone: { display: "8967-4849", tel: "+97689674849" },
  email: "social.botmax@gmail.com",
  facebook: "https://www.facebook.com/aldoshoesmn",
  messenger: "https://m.me/aldoshoesmn",
  /** FAQ «Дэлгүүрийн байршил, цагийн хуваарь». */
  stores: [
    { name: "Шангри-Ла Молл", floor: "2 давхар", hours: "Өдөр бүр 10:00–22:00", query: "Shangri-La Mall Ulaanbaatar" },
    { name: "Улаанбаатар Их Дэлгүүр", floor: "5 давхар", hours: "Даваа–Пүрэв 10:00–20:30 · Баасан–Ням 10:00–21:00", query: "State Department Store Ulaanbaatar" },
    { name: "Хүннү Молл", floor: "B1 давхар", hours: "Өдөр бүр 10:00–21:00", query: "Hunnu Mall Ulaanbaatar" },
  ],
  /** Zochil payment methods: QPay (qpay2), Pocket, StorePay; payment rule names all three. erxes 3.0 has all three kinds. */
  payments: [
    { id: "qpay", name: "QPay", note: "Аль ч банкны аппаар QR уншуулж шууд төлнө" },
    { id: "storepay", name: "StorePay", note: "Хуваан төлөх зээлийн апп" },
    { id: "pocket", name: "Pocket", note: "Зээлийн апп" },
  ],
  /**
   * Delivery rule: A zone 10,000₮, B zone 20,000₮, paid to the courier on receipt; countryside by Mongol Post or bus,
   * fee told at the time. Pick-up is not enabled on Zochil.
   */
  delivery: [
    { id: "zone-a", name: "Хот дотор · А бүс", fee: 10000 as number | null, note: "Хүргэлтийн төлбөрийг бараа хүлээн авахдаа хүргэгчид төлнө" },
    { id: "zone-b", name: "Хот дотор · Б бүс", fee: 20000 as number | null, note: "Хүргэлтийн төлбөрийг бараа хүлээн авахдаа хүргэгчид төлнө" },
    { id: "countryside", name: "Орон нутаг", fee: null as number | null, note: "Монгол шуудан эсвэл орон нутгийн унаагаар. Төлбөрийг холбогдож мэдэгдэнэ" },
  ],
  rules: {
    delivery: "Захиалга баталгаажсанаас хойш 24–48 цагийн дотор хүргэнэ.",
    deliveryFee: "Хүргэлтийн төлбөр онлайн дүнд орохгүй: бараа хүлээн авахдаа хүргэгчид төлнө.",
    exchange: "Хүргэлт хүлээн авснаас хойш 24 цагийн дотор салбар дэлгүүр дээр очиж солиулах боломжтой. Буцаалт хийхгүй.",
    sale: "Хямдралтай бараа солиулах, буцаах боломжгүй тул сонголтоо зөв хийгээрэй.",
    ebarimt: "Утасны дугаараа үлдээснээр НӨАТ-ын баримт илгээнэ. Байгууллагаар авах бол 7 оронтой регистрийн дугаараа бичнэ үү.",
    material: "ALDO нь байгальд ээлтэй брэнд гэдгээрээ алдартай: цүнхнүүдийг сайжруулсан арьсаар хийдэг.",
    size: "Хэмжээ бэлэн эсэхийг манай ажилтан утсаар баталгаажуулна.",
  },
} as const;

export type DeliveryId = (typeof business.delivery)[number]["id"];
export type PaymentId = (typeof business.payments)[number]["id"];
export const deliveryOption = (id: DeliveryId) => business.delivery.find((d) => d.id === id)!;
export const paymentOption = (id: PaymentId) => business.payments.find((p) => p.id === id)!;
export const storeMap = (q: string) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
