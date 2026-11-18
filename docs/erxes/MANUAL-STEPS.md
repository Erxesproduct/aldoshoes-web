# ALDO Shoes Mongolia: erxes manual steps

Owner of every step below: **Terbish**, with ALDO Shoes Mongolia for credentials and decisions.

These steps happen inside the erxes 3.0 admin, not in code. The website reads the results through the
environment variables in `.env.example`. Never commit their values.

| Task | Status | What to do in erxes (admin path) |
| --- | --- | --- |
| [1.1] Import products, categories, prices | website done · manual import in erxes | Section 1.1 |
| [1.2] Payment setup (QPay) | website done · manual, blocked on QPay / StorePay / Pocket merchant credentials | Section 1.2 |
| [1.3] eBarimt setup | website done · manual, blocked on PosAPI registration + TIN | Section 1.3 |
| [1.4] Delivery zones, fees, order statuses | website done · manual in erxes; zone borders to confirm | Section 1.4 |
| [1.5] Test order from cart to receipt | validation verified · real order blocked on erxes env vars + 1.2 + 1.3 | Section 1.5 |

There is no erxes instance for ALDO yet ("erxes 3.0: NOT SET"). Create it first, then add the env vars under
**Vercel → aldoshoes-web → Settings → Environment Variables**.

---

## 1.1 Import products, categories and prices

Source: aldoshoes.mn (Zochil shop 10783), scraped 2026-11-18: **1,178 products** (3,468 photos), 26 Zochil categories,
the logo, 5 home banners, the About text, 3 FAQ and 1 post («Хүргэлтийн бүс», whose image is actually the men's size
chart). Zochil reports 1,180 products; its listing returns 1,178, the other 2 are not visible to shoppers. The Facebook
page (facebook.com/aldoshoesmn) gives no content without a login beyond its name and profile photo.

Zochil product names follow ALDO's article format («MERRYBELLE-SE-640-OTHER RED-Ladies Dress Shoes»). The build script
splits them into **model** (Merrybelle), **colour** (Other Red), **gender** and **ALDO type** (Dress Shoes). 71 products
without a colour name took the colour of another product with the same ALDO colour code. 236 models come in more than
one colour; the website links them as colourways.

Categories are **gender × kind** (Zochil's own tree, with products that only sat in «Эмэгтэй» / «Гутал» placed by
their ALDO type):

| Code | Products | | Code | Products |
| --- | --- | --- | --- | --- |
| `AL-women-heels` | 165 | | `AL-men-sneakers` | 98 |
| `AL-women-sandals` | 191 | | `AL-men-boots` | 39 |
| `AL-women-boots` | 106 | | `AL-men-sandals` | 10 |
| `AL-women-sneakers` | 100 | | `AL-men-shoes` | 2 |
| `AL-women-shoes` | 6 | | `AL-men-bags` | 13 |
| `AL-women-bags` | 288 | | `AL-men-wallets` | 2 |
| `AL-women-wallets` | 18 | | `AL-men-other` | 5 |
| `AL-women-jewelry` | 96 | | | |
| `AL-women-sunglasses` | 13 | | | |
| `AL-women-other` | 26 | | | |

Files:

- `docs/erxes/aldo-categories.csv`: the parent `AL`, `AL-women`, `AL-men` and the 17 gender × kind categories.
- `docs/erxes/aldo-products.csv`: **1,178 rows**, code `AL-<zochilId>`, name «ALDO <Model> <Colour>», price, old
  price (146 on sale, up to −65%), ALDO article number (1,138 products), model, colour, colour family, ALDO type,
  sizes, stock, status, the original Zochil name, description and photo paths.

Steps:

1. **Products & services → Categories**: import `aldo-categories.csv`.
2. **Settings → Import & Export → Import → Products**: upload `aldo-products.csv`. Map `code → Code`,
   `name → Name`, `categoryCode → Category code`, `unitPrice → Unit price`, `aldoArticle → Barcodes` (or a custom
   field), `type → Type`, `uom → UOM`, `description → Description`. Keep the codes: the website and
   `npm run sync:erxes` match on them.
3. **Sizes**: 717 shoes need a size. Zochil lists sizes with stock for only **16** of them (column `sizeSource` =
   `zochil`). For the rest the website offers the usual EU range (women 35–41; men 39–47 from the shop's own chart) and
   tells the customer that staff confirm the size by phone. In erxes, add sizes as **product variants** (Products →
   (product) → Variants) once the real per-size stock is known.
4. **Inventories → Remainders**: all products track stock on Zochil (13,643 units); **18 are sold out**. The website
   hides sold-out products by default and never sells more than the stock.
5. Upload the photos (`public/images/p/*.webp`) on the products. **22 products have no photo on Zochil**: the website
   shows an «ALDO» placeholder.
6. Run `npm run sync:erxes` once with a Client Portal token to confirm the codes match (it also refreshes
   `src/data/lite.json`, which the cart reads).

## 1.2 Payment setup (QPay)

Zochil: QPay (`qpay2`), StorePay and Pocket; the payment rule names all three. erxes 3.0 has payment kinds for all
three (`backend/plugins/payment_api/src/constants.ts`: qpay, storepay, pocket).

1. Get ALDO's own merchant credentials (ask Zochil / QPay whether the existing merchant can be used outside Zochil):
   QPay `client_id`, `client_secret`, `invoice_code`; StorePay store id, username, password, app username / password;
   Pocket merchant / terminal credentials. Owner: Terbish / ALDO.
2. **Settings → Payments → Add → QPay**: enter them. **Settings → Payments → (QPay) → Test**: a 100₮ invoice.
3. **Settings → Payments → Add → StorePay** and **Add → Pocket**: same, then a test invoice each.
4. **Sales → Pipelines → «Вэбсайт» → Settings → Payments**: select QPay, StorePay and Pocket.

Website (done): checkout offers **QPay**, **StorePay** and **Pocket**, validated on the server (anything else is
rejected). The online total is the goods only; delivery is paid to the courier (section 1.4).

## 1.3 eBarimt setup

Zochil has no eBarimt setting for this shop.

1. Collect from ALDO: company TIN, district code (СБД), VAT status, product classification codes (footwear, bags,
   jewellery).
2. Register for **PosAPI 3.0** (ebarimt.mn → Business → PosAPI) and install the PosAPI service.
3. **Settings → eBarimt → Add**: PosAPI URL, TIN, district code, VAT switches; assign it to the website pipeline.

Website (done): checkout asks «Хувь хүн» or «Байгууллага»; a company needs a 7-digit registry number, validated on the
server; the order message carries it.

## 1.4 Delivery zones, fees and order statuses

**Website (done)**, from the Zochil delivery rule of shop 10783:

| Option | Fee | Note |
| --- | --- | --- |
| Хот дотор · А бүс | 10,000₮ | Paid to the courier on receipt |
| Хот дотор · Б бүс | 20,000₮ | Paid to the courier on receipt |
| Орон нутаг | told by phone | Монгол шуудан or local transport |

- Delivery 24–48 h after confirmation. Pick-up is not enabled on Zochil, so it is not offered online (the three stores
  are shown for trying on and exchanges). The fee is **not** part of the online total; the server returns it as
  `deliveryFee` (null for countryside) and the order message says «хүлээн авахдаа хүргэгчид төлнө».
- Exchange within 24 h at a branch, no returns, sale items not exchanged: shown on product pages, cart and `/info`.

**erxes (manual):**

1. Import `docs/erxes/aldo-delivery.csv`: services `DELIVERY-A` (10,000₮), `DELIVERY-B` (20,000₮),
   `DELIVERY-COUNTRYSIDE` (no price).
2. **Sales → Boards → «Онлайн захиалга» → pipeline «Вэбсайт»**, stages: Шинэ захиалга → Хэмжээ, үлдэгдэл шалгасан →
   Төлбөр хүлээгдэж буй → Төлбөр баталгаажсан → Хүргэлтэд гарсан → Хүргэгдсэн, plus «Цуцлагдсан» and «Солилт (24 цаг)».
3. **Frontline → Forms → (order form) → Settings**: create a sales card in «Шинэ захиалга» for every submission.

## 1.5 Test order from cart to receipt

**Verified on a local production build:** `npm run test:order -- http://localhost:3142` passes **27 checks**: empty
cart, unknown product, shoes without a size, a size outside the range, a listed Zochil size, a sold-out product, more
than the stock, quantity over 10, the browser's price ignored; A zone (10,000₮ to the courier), B zone (20,000₮) and
countryside (null) with the same online total; pick-up rejected; address required; QPay, StorePay and Pocket accepted;
HiPay and unknown payment rejected; unknown delivery; company registry rejected and accepted; phone (incl. +976),
email, honeypot. Without erxes the order returns `503 not_configured` and the checkout shows the phone number, the
reference (`AL-YYMMDD-XXXX`) and the total.

Steps for a real test order:

1. **Frontline → Forms → Create** «Вэбсайт захиалга» with fields Нэр, Утас, Имэйл, Захиалга. Copy the form id and
   the field ids.
2. In Vercel set `ERXES_API_URL`, `ERXES_ORDER_FORM_ID`, `ERXES_ORDER_FIELD_IDS`, then redeploy.
3. Run `npm run test:order -- https://<production url> --send`. Expect an online total of 2 × the cheapest non-shoe
   item + the cheapest shoe (the script prints it; **127,998₮** with today's catalog), delivery 10,000₮ to the courier.
4. In erxes: find the submission and its card → confirm the size → send the QPay invoice and pay it → issue the
   eBarimt → move the card to «Хүргэгдсэн» → void the test order.

---

## Open questions for ALDO

1. **Women's size chart**: the shop only published the men's chart. Is EU 35–41 right for women?
2. **Per-size stock**: Zochil lists sizes for 16 shoes only. Can the stock be exported per size (for erxes variants)?
3. **Zone A / B borders**: the post «Хүргэлтийн бүс» shows a size chart instead of the map. Which districts are A and B?
4. **Countryside fee**: fixed amount, or always quoted by phone?
5. **Pick-up** at Шангри-Ла, Их Дэлгүүр or Хүннү Молл: offer it online?
6. **QPay / StorePay / Pocket credentials** outside Zochil; TIN and PosAPI for eBarimt.
7. **Duplicate ALDO article numbers**: 16312349 (499970, 499969), 17537292 (811159, 810138), 17537412 (811161,
   810144). Same item listed twice?
8. **17 products of unknown kind** (no ALDO type in the name, no subcategory): placed as shoes when they have size
   variants, otherwise «Бусад аксессуар». Staff should check the `categoryCode` column.
9. **22 products without a photo**, and the **2 products hidden on Zochil** (1,180 vs 1,178).
10. **Email**: the shop settings list `social.botmax@gmail.com`; it looks like an agency address, so the website does
    not show it. Which email should customers use?
