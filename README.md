# aldoshoes-web

Storefront for **ALDO Shoes Mongolia** (aldoshoes.mn), replacing the Zochil shop 10783. Next.js 16 (App Router),
Tailwind 4, static product pages, orders to erxes 3.0.

- **Look «Catwalk»**: bone paper and light-grey studio boxes like ALDO's own product shots, black ink, ALDO cherry red,
  tall condensed runway headlines (Fira Sans Extra Condensed) with Commissioner for text (both with Ө ө Ү ү).
- **Pages**: home (runway headline, the owner's banners, gliding product strip, shop by kind, «Өнгөөр хослуул» look
  builder that pairs shoes, bag and jewellery of one colour from the real catalog, sale, new-in shelves, size and
  stores), `/shop` (gender, kind, colour, sale, search, sort, sold-out toggle), `/p/[slug]` (gallery, colourways, EU
  size grid, pairs with), `/cart` (checkout), `/info` (delivery, payment, exchange, size chart + foot-length finder,
  stores, about). Old Zochil URLs redirect.
- **Data**: `src/data/catalog.json` (1,178 products) and the slim `lite.json` for client components, built from Zochil
  by a scrape script (not in the repo). Business rules: `src/content/business.ts`.

```bash
npm install
npm run dev            # http://localhost:3000
npm run lint && npm run typecheck && npm run build
npm run test:order -- http://localhost:3000        # 27 order API checks
npm run sync:erxes     # prices from erxes (ERXES_API_URL + ERXES_APP_TOKEN)
```

Environment variables: see `.env.example`. Without `ERXES_*` the order API answers `503 not_configured` and the
checkout asks the customer to call.

erxes setup (manual steps, CSV imports, open questions): [`docs/erxes/MANUAL-STEPS.md`](docs/erxes/MANUAL-STEPS.md).
