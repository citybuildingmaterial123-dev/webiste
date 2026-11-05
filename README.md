# City Building Materials: catalogue and quotation website

A fast, static website for a building materials store. Customers browse the product
range, add products to **My requirements** with quantities and notes, and send the list
to the store on **WhatsApp** for a quotation. There are no prices, no checkout and no
payments.

- **Next.js 16** (App Router, static export) + **TypeScript** + **Tailwind CSS 4**
- **Google Sheets as the CMS**, read **only at build time**. Visitors never depend on Google.
- Product photos are downloaded and converted to small WebP files during the build.
- Works on any static host: Vercel, Netlify, Cloudflare Pages, GitHub Pages, cPanel, Nginx.

```
Google Sheet ──► scripts/sync-catalog.ts ──► data/generated/catalog.json ──► next build ──► out/ (static site)
                 fetch · validate · transform · optimise photos
```

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local      # then fill in the values (see below)
npm run dev                     # http://localhost:3000, uses sample products until a sheet is set
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server. Creates the catalogue from the sample data on first run. |
| `npm run sync` | Fetch the Google Sheet now and rebuild `data/generated/catalog.json`. |
| `npm run sync -- --sample` | Use `data/sample-products.csv` instead of the sheet. |
| `npm run build` | Sync from the sheet, then build the static site into `out/`. |
| `npm start` | Preview the built `out/` folder locally. |
| `npm test` | Unit tests (CSV parser, sheet transform, WhatsApp message, opening hours). |
| `npm run lint` / `npm run typecheck` | Code checks. |

---

## 2. Replace the placeholders before going live

Business details live in **[`config/site.ts`](config/site.ts)**. Every placeholder is marked
`PLACEHOLDER`, and `npm run build` prints a warning for each one still in use.

| Setting | Where |
| --- | --- |
| Store name | `config/site.ts` → `name` |
| Logo (optional, else the built-in mark) | put the file in `/public`, set `logo: "/logo.svg"` |
| **WhatsApp number** for enquiries | env `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits with country code, e.g. `919876543210`) |
| Phone number | env `NEXT_PUBLIC_PHONE_NUMBER` or `contact.phone` |
| Address, city, state, PIN | `config/site.ts` → `address` (the city is also used in page titles for local search) |
| Google Maps link | `config/site.ts` → `mapsUrl` (Share → Copy link in Google Maps) |
| Opening hours | `config/site.ts` → `openingHours` |
| Website URL | env `NEXT_PUBLIC_SITE_URL` (canonical URLs, sitemap, share previews) |
| Google Sheet | env `GOOGLE_SHEET_ID` (see section 3) |
| About page text, year established | `config/site.ts` → `about` |
| Photos | section 6 |

The placeholder WhatsApp number is all zeros, so no enquiry can reach a stranger by accident.

---

## 3. Managing products in Google Sheets

### Create the sheet

1. Create a Google Sheet and import [`data/sample-products.csv`](data/sample-products.csv)
   (File → Import → Upload). This gives you the right columns and 60 example rows.
2. Replace the rows with your products. One row = one product.

### Columns

| Column | Required | Notes |
| --- | --- | --- |
| `id` | recommended | Your product code (`PL-304`). Keep it stable: customer lists use it. If empty, it is made from the name. |
| `category` | **yes** | One of the 8 categories (`Plywoods`, `Hardwares`, ...). Spelling variants like `Plywood` also match. A new category name is added automatically. |
| `subcategory` | no | e.g. `BWP`, `Hinges`. A new subcategory name is added automatically. |
| `product_name` | **yes** | Shown everywhere and in the WhatsApp message. |
| `brand` | no | |
| `description` | no | The first sentence is used on product cards. |
| `image_url` | no | Direct image link, **Google Drive share link** (file must be shared "Anyone with the link"), or Dropbox link. |
| `specifications` | no | `Thickness: 18 mm \| Size: 8 x 4 ft \| Termite resistant` (one per line also works). `Label: value` pairs become a table; other lines become a list. |
| `units` | no | Units the customer can choose, first = default: `Sheets, Pieces`. Defaults come from the category. |
| `featured` | no | `yes` to mark a product as featured. |
| `status` | no | Empty or `active` = shown. `hidden`, `draft`, `inactive`, `no` = not shown. |
| `sort_order` | no | Lower numbers first. Otherwise the sheet order is used. |
| `tags` | no | Extra search words, comma separated. |
| `slug` | no | Custom URL part for the product page. |

Header names are flexible (`Product Name`, `name` and `product_name` all work).
**Any other column you add** (for example `Thickness (mm)` or `Finish`) is shown
automatically under Specifications on the product page.

Categories, their descriptions, photos and default units are in
[`data/taxonomy.ts`](data/taxonomy.ts).

### Connect the sheet

Pick one option and set the variables in `.env.local` and in your host's dashboard:

| Option | Sheet sharing | Variables |
| --- | --- | --- |
| A. Link sharing (simplest) | Share → "Anyone with the link: Viewer" | `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_GID` (tab id from `#gid=` in the URL, `0` for the first tab) |
| B. Publish to web | File → Share → Publish to web → CSV | `GOOGLE_SHEET_CSV_URL` |
| C. API key | link sharing + a Google Cloud API key with the Sheets API enabled | `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`, `GOOGLE_SHEETS_API_KEY` |
| D. Private sheet | share the sheet with a service account's email (Viewer) | `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` |

None of these values reach the browser. The service is in
[`lib/googleSheets.ts`](lib/googleSheets.ts); validation and transformation are in
[`lib/catalog-transform.ts`](lib/catalog-transform.ts).

### How changes go live

The site is static, so sheet edits appear after a rebuild (usually 1–3 minutes):

- **Button in the sheet:** add [`scripts/google-apps-script/publish-menu.gs`](scripts/google-apps-script/publish-menu.gs)
  to the sheet (instructions inside). It adds **Website → Publish changes**, which calls your
  host's deploy hook.
- **Automatic:** schedule the deploy hook (for example a daily GitHub Action or the host's scheduler).
- **Manually:** "Redeploy" in the host dashboard.

### If the sheet cannot be read during a build

| Situation | Result |
| --- | --- |
| On a CI/host build (`CI=true`) or `CATALOG_STRICT=true` | The build **stops**. Your host keeps serving the previous version of the site, so customers never see an empty or sample catalogue. The log says what went wrong (sharing, wrong ID, missing column...). |
| On your computer (`CATALOG_STRICT=false`) | Uses the last good copy in `data/generated/catalog.json`, else the sample data, with a warning. |
| Rows with problems | Skipped with a warning (row number and reason); the rest of the catalogue builds. |
| A photo cannot be downloaded | The original link is used instead, with a warning. |

---

## 4. The quotation flow

Home → Products → product → **Add to requirements** (quantity, unit, notes) →
**My requirements** → **Request a quote** (name, phone, location, project details) →
WhatsApp opens with a structured message → the customer presses send.

- The list is stored in the browser's local storage ([`lib/requirements-store.ts`](lib/requirements-store.ts)):
  it survives reloads and stays in sync across tabs. Nothing is sent to a server.
- The message is built by [`lib/whatsapp.ts`](lib/whatsapp.ts) and opened as
  `https://wa.me/<number>?text=<url-encoded message>`. Very long lists switch to a compact layout.

---

## 5. Deploying

`npm run build` creates the complete site in **`out/`**.

### Cloudflare Pages (connected to this GitHub repository)

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` (or "Next.js (Static HTML Export)", then change the build command below) |
| Build command | `npm run build` (not `npx next build`, which would skip the Google Sheet sync) |
| Build output directory | `out` |
| Root directory | leave empty |

Environment variables (Settings → Variables and Secrets; add to Production and Preview):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://<project>.pages.dev`, or your own domain once connected |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | e.g. `919876543210` |
| `NEXT_PUBLIC_PHONE_NUMBER` | e.g. `+91 98765 43210` (optional) |
| `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_GID` | when the product sheet is ready (section 3) |
| `CATALOG_STRICT` | `true` (a failed sheet fetch then keeps the previous deployment live) |

Node 22 is picked up from `.nvmrc`. Every push to `main` deploys; pull requests get preview URLs.
`public/_headers` adds caching and security headers.

**GitHub Actions** (`.github/workflows/`):

- `ci.yml`: lint, unit tests, a full build and a type check on every push and pull request.
- `refresh-catalogue.yml`: calls a Cloudflare deploy hook daily at 03:00 IST (and on demand), so
  sheet edits go live automatically. Create the hook in Cloudflare (Settings → Builds → Deploy hooks)
  and save it as the repository secret `CLOUDFLARE_DEPLOY_HOOK_URL`. The same URL works for the
  sheet's "Publish changes" menu.

### Other hosts

- **Vercel / Netlify:** build command `npm run build`, output directory `out`.
- **Any web server or cPanel:** run `npm run build` and upload the contents of `out/`.
  URLs end with `/` (`/products/plywood/`), so every page is a plain `index.html` and no rewrite rules are needed.

---

## 6. Photos

- **Product photos** come from the sheet's `image_url` column and are converted at build time
  into `public/media/products/` (480 and 960 px WebP, cached between builds).
- **Hero and category photos** are openly licensed stand-in photographs of materials in
  `public/images/` (sources and licences in [`data/photos.ts`](data/photos.ts) and on the
  `/credits/` page). Replace them with the store's own photographs as soon as possible
  (a shopfront, the counter, stacks of your stock), keeping the same file names and widths,
  or update `data/photos.ts`.

---

## 7. Project structure

```
app/                     Pages (App Router): home, products, category, subcategory, product,
                         requirements, about, contact, privacy, credits, sitemap, robots
components/
  layout/                Header, mobile menu, phone action bar, footer, closing band
  home/                  Home page sections
  catalog/               Category and product cards, search, subcategory links
  requirements/          Add-to-requirement button, quantity editor, list, quote form
  ui/                    Photo, icons, breadcrumbs, JSON-LD
config/site.ts           Business settings (name, contact, address, hours, SEO)
data/
  taxonomy.ts            Categories and subcategories
  photos.ts              Hero/category photo manifest and credits
  sample-products.csv    Sample catalogue and sheet template
  generated/             Build output of the sync (not committed)
lib/
  googleSheets.ts        Google Sheets service (build time only)
  catalog-transform.ts   Validation and transformation of sheet rows
  catalog.ts             Catalogue data access for pages
  whatsapp.ts            WhatsApp message and link generator
  requirements-store.ts  "My requirements" state (localStorage)
  seo.ts, business.ts    Metadata, structured data, address and hours helpers
scripts/
  sync-catalog.ts        The build-time sync
  lib/product-images.ts  Product photo download and WebP conversion
  google-apps-script/    "Publish changes" menu for the sheet
tests/                   Unit tests (node:test)
types/                   Shared TypeScript types
```

## 8. Design

The look follows one strict system: a concrete-grey ground, near-black ink, one signal-orange
accent, square photographs, Work Sans in two weights, and hover-only micro-interactions
(cards lift 2 px, photos zoom 1.03, buttons step and press). Tokens are at the top of
[`app/globals.css`](app/globals.css); change `--color-accent` to use the store's own colour
(keep white text on it at a 4.5:1 contrast ratio or better).
