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
