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

**Customers:** home / latest collection / best sellers, collection page with search, category and occasion filters and price sorting, product detail with sizes and related products, **gift personalisation** (recipient name, card message with live preview, ribbon colour, wrapping, paid add-ons and customer photo upload — priced and validated on the server), guest cart that merges into the account on login, sign up / login / forgot & reset password, profile page, checkout with an optional hand-lettered **gift note** and **Stripe**, **Razorpay** or **Cash on Delivery**, order confirmation page, My Orders with a live **order tracking** timeline, newsletter signup, a Contact page whose messages land in the admin inbox, **live chat** (with photo attachments) to plan custom gifts, a **Cake Studio** (design, flavour, size, eggless, message or edible photo, delivery date & time slot), a **Custom Studio** for photo mugs, T-shirts, canvas, frames and cushions, shopping by recipient (**For her / him / couples / kids / teens / elders / baby**), engraving on pens, key tags, jewellery and clocks, and a **Gift Guide** covering Sinhala, Tamil, Indian, Muslim and Christian occasions.

**Admin:** dashboard (revenue, orders by status, payment methods, recent orders), add products (Cloudinary image upload), list / search / **edit** / delete products, order management (search, filter by status, update status incl. Cancelled, gift notes), a **Messages** inbox for Contact-form enquiries, a **Chats** inbox to reply to customers live, and sizes with per-size prices (cake weights, canvas sizes).

**Notifications:** email (SMTP) and SMS (Twilio) on order confirmation and every status change, plus an admin email for new orders. If they're not configured, messages are printed in the backend console instead.

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

- `cd backend && npm run seed` adds the starter catalogue (20 categories, 99 products: cakes, custom printing, festival gifts, toys (incl. Hot Wheels, drones, race tracks), baby, jewellery, fashion accessories (hair clips, bands, earring sets), kitchen & dining (water bottles, mugs, jug sets, tea & dinner sets, table décor), plants, home décor, pens & key tags, art supplies, games and gift packages for her, him, couples, kids, teens and elders) and skips products that already exist.
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
