# Surprise Heaven – Online Gift Store

MERN e-commerce platform for gift and chocolate hampers (Group_33).

| Folder | What it is | Default URL |
| --- | --- | --- |
| `backend/` | Express + MongoDB REST API | http://localhost:3000 |
| `Frontend/` | Customer store (React + Vite + Tailwind) | http://localhost:5173 |
| `admin/` | Admin panel (React + Vite + Tailwind) | http://localhost:5174 |

## Team — Group_33 (BSc (Hons) IT, Intake 11)

| Member | Responsibility |
| --- | --- |
| S. Kestroy | Backend: API, authentication & security, payments (Stripe, Razorpay, COD), orders, notifications, chat & contact APIs |
| V. Thanushan | Admin panel: dashboard, product management, orders, chats & messages inboxes |
| A.V. Sanju | Shopping flow: cart, checkout, order confirmation & tracking, login and profile |
| S. Jineshini | Storefront design: brand theme & logo, home page, About, Contact, Gift Guide, gift research |
| N. Kishnapriyan (Krishna) | Personalisation & studios: gift personaliser, cake & custom printing studios, live chat widget, product & shop pages, catalogue seed |

## Features

**Customers:** home / latest collection / best sellers, collection page with search, category and occasion filters and price sorting, product detail with sizes and related products, **gift personalisation** (recipient name, card message with live preview, ribbon colour, wrapping, paid add-ons and customer photo upload — priced and validated on the server), guest cart that merges into the account on login, sign up / login / forgot & reset password, profile page, checkout with an optional hand-lettered **gift note** and **Stripe**, **Razorpay** or **Cash on Delivery**, order confirmation page, My Orders with a live **order tracking** timeline, newsletter signup, a Contact page whose messages land in the admin inbox, **live chat** (with photo attachments) to plan custom gifts, a **Cake Studio** (design, flavour, size, eggless, message or edible photo, delivery date & time slot), a **Custom Studio** for photo mugs, T-shirts, canvas, frames and cushions, shopping by recipient (**For her / him / couples / kids / teens / elders / baby**), engraving on pens, key tags, jewellery and clocks, a **Build-a-Surprise-Box** builder (choose a box, fill it with any gifts, chocolates by budget, add a cake and a handmade photo album with your photos and love quotes, card, delivery date/time and "keep it a surprise" — all priced on the server and delivered together), and a **Gift Guide** covering Sinhala, Tamil, Indian, Muslim and Christian occasions.

**Reviews & ratings:** customers can rate and review a gift (1–5 stars, headline, text, up to 4 photos) once the order containing it — including gifts inside a surprise box — is delivered, so every review is a *Verified purchase*. One review per gift (editable), shown as first name + last initial; ratings summary with a star breakdown, filters, sorting and "Helpful" votes on the product page; stars on product cards; a *Top rated* sort and *4★ & up* filter; "Rate this gift" in My Orders and a review invite in the delivery email; recent 4–5★ reviews on the home page. No reviews are seeded.

**Offers & coupons:** automatic sales on a category, brand, hand-picked gifts or the whole store (% or Rs. off, start/end dates, a badge on product cards, crossed-out prices, an **Offers** page) and coupon codes at checkout — % off with an optional cap, Rs. off, or free delivery, with minimum order, category/brand limits, first-order-only, per-customer and total usage limits. Prices and coupons are always recalculated on the server; a cancelled order gives its coupon use back. Starter codes: WELCOME10, FREEDELIVERY, LOVE500, BIRTHDAY15.

**Gift mall:** a department bar under the menu (Flowers & Cakes, Chocolates & Hampers, Fashion, Jewellery & Watches, Beauty, Tech & Gaming, Kids & Baby, Home & Kitchen, Personalised, Art & Stationery), a home page with departments, a **Shop by brand** strip, gifts by budget and brand spotlights, an A–Z **brand directory** (`/brands`), a store page for every brand (`/brand/:slug`) and brand / budget filters on the shop page.

**Admin:** branded portal (dark sidebar with live badges, 30-day sales chart, best sellers, sales by category), **Inventory** (stock per product with low / out-of-stock alerts, receive stock, write-offs and stock-take counts, SKU and cost price, stock value, a full stock history and CSV export), **Sales & income** reports (any date range with comparison to the period before: sales, income received, cash still to collect, cost of goods, gross profit and margin, daily chart, profit & loss, sales by category, brand and payment method, product profitability, CSV export), **Reviews** (reply publicly, hide or delete, low ratings flagged), **Offers & coupons** manager (create, schedule, pause, usage and discount given per code), **Brands** manager (logo upload or coloured wordmark, tagline, colour, featured on the home page) with a brand picker on every product, dashboard (revenue, orders by status, payment methods, recent orders), add products (Cloudinary image upload), list / search / **edit** / delete products, order management (search, filter by status, update status incl. Cancelled, gift notes), a **Messages** inbox for Contact-form enquiries, a **Chats** inbox to reply to customers live, and sizes with per-size prices (cake weights, canvas sizes).

**Notifications:** email (SMTP) and SMS (Twilio) on order confirmation and every status change, plus an admin email for new orders. If they're not configured, messages are printed in the backend console instead.

**Stock:** every order reserves its stock (including the gifts inside surprise boxes) all-or-nothing, so two customers can't buy the last item; cancelling an order, an unpaid online checkout or an abandoned payment (swept after 2 hours) puts the stock back. Cakes, prints and other made-to-order gifts aren't stock-tracked. The store shows *Sold out* / *Only N left* and limits quantities; cost prices are never sent to customers.

**Security:** prices are recalculated on the server from the database, Stripe payments are confirmed with Stripe before an order is marked paid, Razorpay payments are verified by HMAC signature, admin tokens no longer contain the admin password, and tokens expire.

## Setup

1. MongoDB running locally (or an Atlas URI).
2. Copy the env examples and fill them in:
   - `backend/.env.example` → `backend/.env`
   - `Frontend/.env.example` → `Frontend/.env`
   - `admin/.env.example` → `admin/.env`
3. Install and run each app (three terminals):

```bash
cd backend && npm install && npm run server
```

```bash
cd Frontend && npm install && npm run dev
```

```bash
cd admin && npm install && npm run dev -- --port 5174
```

4. Log into the admin panel with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and add products.

## Catalogue & photos

- `cd backend && npm run seed` adds the starter catalogue (28 categories, 187 products: cakes, custom printing, festival gifts, toys (incl. Hot Wheels, drones, race tracks), baby, jewellery, fashion accessories (hair clips, bands, earring sets), kitchen & dining (water bottles, mugs, jug sets, tea & dinner sets, table décor), perfumes, watches, wallets and handbags, shoes, sunglasses, makeup & beauty, tech accessories (phone covers incl. custom photo cases, headphones, power banks), gaming accessories, more kids' toys (dolls, play kitchen, STEM kits, trains, board games), plants, home décor, pens & key tags, art supplies, games and gift packages for her, him, couples, kids, teens and elders) and skips products that already exist. It also adds 17 brands — Cadbury, Ferrero, Nestlé and Hot Wheels for the products named after them, plus our own house labels (Heaven Bakes, Luxe Heaven, Glow Heaven, Heaven Tech…) — and gives every unbranded product its brand.
- Research behind the occasions and cultural gifts: `docs/gift-market-research.md`.
- Product photos are free Unsplash images (https://unsplash.com/license), listed in `backend/scripts/productPhotos.js`. Replace any of them with your own photography from the admin panel (Products › Edit).
- Personalisation options and prices live in `backend/config/customization.js`; which options each product offers is set per product in the admin panel.

## Payments (test mode)

- **Stripe:** set `STRIPE_SECRET_KEY` to your `sk_test_...` key. Test card `4242 4242 4242 4242`, any future date, any CVC.
- **Razorpay:** set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (test keys `rzp_test_...`). Razorpay charges in `STORE_CURRENCY` (LKR); your Razorpay account needs International Payments enabled for LKR.
- Prices are in **Sri Lankan rupees (LKR, shown as Rs.)** with a Rs. 500 delivery fee. `STORE_CURRENCY` / `DELIVERY_FEE` in the backend must match `VITE_CURRENCY_SYMBOL` / `VITE_DELIVERY_FEE` in the frontend.

## Email & SMS

- Email: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (for Gmail use an App Password).
- SMS: set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`; local numbers get `SMS_DEFAULT_COUNTRY_CODE` (default `+94`).
- Password reset links use `FRONTEND_URL`.
