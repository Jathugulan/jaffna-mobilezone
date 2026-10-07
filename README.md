<div align="center">

# 📱 Jaffna Mobile Zone

**Premium Mobile Technology. Right Here in Jaffna.**

A full-stack mobile-phone e-commerce platform for Sri Lanka (LKR) — storefront, customer portal, AI shopping assistants and a full admin console.

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

[Screenshots](#-screenshots) · [Features](#-features) · [Quick Start](#-quick-start) · [Configuration](#-configuration) · [API](#-api-overview) · [Deployment](#-deployment) · [Roadmap](#-roadmap)

<img src="docs/screenshots/banner.png" alt="Jaffna Mobile Zone banner" width="100%">

</div>

---

## ✨ Highlights

- 🛍️ **Complete shopping flow** — catalogue, filters, compare, wishlist, cart, coupons, 3-step checkout, order tracking
- 🤖 **Grounded AI assistants** — product, order and admin BI helpers that only use real database records, with an **offline rule-based fallback** (no API key required)
- 🧑‍💼 **Powerful admin console** — products, brands, offers, flash sales, orders, customers, reviews, analytics, audit log
- 🎨 **CMS-driven homepage** — 16 toggleable/reorderable sections, hero carousel, testimonials, FAQs
- 🔐 **Production-minded security** — JWT access + refresh rotation, RBAC, Zod validation, rate limiting, Helmet, audit logging
- 🌙 **Dark-first luxury UI** with light mode, command palette (`Ctrl/Cmd + K`) and mobile bottom navigation

## 📸 Screenshots

### 🛍️ Storefront

| Home (Dark) | Home (Light) |
| :---: | :---: |
| ![Home dark](docs/screenshots/storefront/home-dark.png) | ![Home light](docs/screenshots/storefront/home-light.png) |

| Shop Listing | Product Detail |
| :---: | :---: |
| ![Shop listing](docs/screenshots/storefront/shop-listing.png) | ![Product detail](docs/screenshots/storefront/product-detail.png) |

| Compare Phones | Deals & Flash Sales |
| :---: | :---: |
| ![Compare](docs/screenshots/storefront/compare.png) | ![Deals](docs/screenshots/storefront/deals.png) |

| Cart Drawer | Checkout | Command Palette |
| :---: | :---: | :---: |
| ![Cart drawer](docs/screenshots/storefront/cart-drawer.png) | ![Checkout](docs/screenshots/storefront/checkout.png) | ![Command palette](docs/screenshots/storefront/command-palette.png) |

### 📱 Mobile

| Home | Bottom Navigation | Product Detail |
| :---: | :---: | :---: |
| <img src="docs/screenshots/mobile/home.png" width="250" alt="Mobile home"> | <img src="docs/screenshots/mobile/bottom-nav.png" width="250" alt="Mobile bottom navigation"> | <img src="docs/screenshots/mobile/product-detail.png" width="250" alt="Mobile product detail"> |

### 🤖 AI Assistants

| Storefront AI Drawer | AI Assistant Page |
| :---: | :---: |
| ![AI drawer](docs/screenshots/ai/ai-drawer.png) | ![AI assistant page](docs/screenshots/ai/ai-assistant-page.png) |

<details>
<summary><b>👤 Customer Portal</b></summary>
<br>

| Dashboard | My Orders |
| :---: | :---: |
| ![Customer dashboard](docs/screenshots/customer/dashboard.png) | ![Orders](docs/screenshots/customer/orders.png) |

| Order Detail | Address Book |
| :---: | :---: |
| ![Order detail](docs/screenshots/customer/order-detail.png) | ![Addresses](docs/screenshots/customer/addresses.png) |

</details>

<details>
<summary><b>🧑‍💼 Admin Console</b></summary>
<br>

| Dashboard | Products |
| :---: | :---: |
| ![Admin dashboard](docs/screenshots/admin/dashboard.png) | ![Admin products](docs/screenshots/admin/products.png) |

| Product Form | Orders |
| :---: | :---: |
| ![Product form](docs/screenshots/admin/product-form.png) | ![Admin orders](docs/screenshots/admin/orders.png) |

| Analytics | Homepage CMS |
| :---: | :---: |
| ![Analytics](docs/screenshots/admin/analytics.png) | ![Homepage CMS](docs/screenshots/admin/homepage-cms.png) |

| AI Business Assistant | Audit Log |
| :---: | :---: |
| ![Business assistant](docs/screenshots/ai/admin-business-assistant.png) | ![Audit log](docs/screenshots/admin/audit-log.png) |

</details>

## 🧰 Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Node.js · Express 4 · TypeScript · MongoDB (Mongoose 8) · JWT · Zod · Helmet · CORS · Morgan · express-rate-limit |
| **Frontend** | React 18 · TypeScript · Vite 5 · React Router 6 · TanStack Query 5 · Tailwind CSS 3 · lucide-react |
| **AI** | Any OpenAI-compatible provider (`gpt-4o-mini` by default) + deterministic grounded fallback |

## 🏗️ Architecture

```mermaid
flowchart LR
    A[React SPA<br/>Vite + Tailwind] -->|/api| B[Express API<br/>TypeScript]
    B --> C[(MongoDB)]
    B -->|optional| D[OpenAI-compatible LLM]
    B -.->|fallback| E[Rule-based AI engine]
    E --> C
```

<details>
<summary><b>📁 Repository structure</b></summary>

```text
jaffna-mobile-zone/
├─ docs/
│  └─ screenshots/             # README images (banner, storefront, mobile, customer, ai, admin)
├─ backend/                    # Express + TypeScript REST API
│  ├─ src/
│  │  ├─ app.ts                # Security, CORS, route mounting
│  │  ├─ server.ts             # DB connect → admin seed → listen → graceful shutdown
│  │  ├─ config/               # env, database, ai
│  │  ├─ constants/            # roles, statuses, offer types, fees
│  │  ├─ controllers/          # 16 controllers
│  │  ├─ middleware/           # auth, error, validation, rate limiting, request id
│  │  ├─ models/               # 17 Mongoose models
│  │  ├─ routes/               # 18 route modules
│  │  ├─ services/             # business logic + services/ai/*
│  │  ├─ utils/                # ApiError, asyncHandler, jwt, logger, response helpers
│  │  ├─ validators/           # Zod schemas
│  │  └─ scripts/createAdmin.ts
│  └─ .env.example
├─ frontend/                   # React + Vite SPA
│  ├─ src/
│  │  ├─ api/                  # Typed API clients + fetch wrapper with token refresh
│  │  ├─ components/           # ai, auth, cart, common, deals, layout, product
│  │  ├─ context/              # Auth, Cart, Wishlist, Compare, Theme
│  │  ├─ pages/                # public, auth, customer, admin
│  │  ├─ types/                # Shared domain types
│  │  └─ utils/
│  └─ vite.config.ts           # Dev proxy: /api → http://localhost:5000
└─ README.md
```

</details>

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (uses built-in `fetch`)
- **npm 9+**
- **MongoDB** — local (`mongodb://127.0.0.1:27017`) or [MongoDB Atlas](https://www.mongodb.com/atlas)

> ⚠️ Orders use **MongoDB transactions**, which require a replica set. Atlas supports this out of the box; for local MongoDB, run it as a single-node replica set.

### 1. Clone

```bash
git clone https://github.com/<your-username>/jaffna-mobile-zone.git
cd jaffna-mobile-zone
```

### 2. Start the backend

```bash
cd backend
npm install
cp .env.example .env     # edit MONGODB_URI and secrets
npm run dev              # http://localhost:5000
```

Health check: `GET http://localhost:5000/health`

On boot the server connects to MongoDB, creates/repairs the admin account (unless `SEED_ADMIN=false`), and starts listening.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Vite proxies `/api/*` to the backend, so no CORS setup is needed in development.

### 4. Sign in as admin

| Field | Value |
| --- | --- |
| Email | `admin@jaffnamobilezone.lk` |
| Username | `admin` |
| Password | `Admin@1234` |

> 🔒 **Change this password immediately** in any non-local environment. Set `ADMIN_PASSWORD` in `.env` to force a reset on next boot, or re-run `npm run seed:admin`.

## ⚙️ Configuration

### `backend/.env`

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `NODE_ENV` | `development` | `production` disables Morgan and admin auto-seed |
| `CLIENT_URL` | `http://localhost:5173` | CORS allow-list (comma-separated) |
| `MONGODB_URI` | local `jaffna_mobile_zone` | Mongo connection string (URL-encode special characters) |
| `JWT_ACCESS_SECRET` | `access-secret` | ⚠️ Change in production |
| `JWT_REFRESH_SECRET` | `refresh-secret` | ⚠️ Change in production |
| `JWT_ACCESS_EXPIRES` | `15m` | Access-token lifetime |
| `JWT_REFRESH_EXPIRES` | `7d` | Refresh-token lifetime |
| `COOKIE_SECURE` | `false` | Set `true` behind HTTPS |
| `EMAIL_FROM` | `noreply@jaffnamobilezone.lk` | Reserved for email integration |
| `SEED_ADMIN` | `true` | Auto create/repair admin on boot |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` | `admin` / `admin@jaffnamobilezone.lk` | Admin identity |
| `ADMIN_PASSWORD` | *(unset)* | Set only to force a password reset |
| `AI_PROVIDER` | `openai` | Any OpenAI-compatible endpoint |
| `AI_API_KEY` | *(empty)* | Empty → offline grounded rule-based mode |
| `AI_BASE_URL` | `https://api.openai.com/v1` | Provider base URL |
| `AI_MODEL` | `gpt-4o-mini` | Model name |
| `AI_MAX_TOKENS` | `600` | Max completion tokens |
| `DISABLE_AI` | `false` | `true` forces the offline engine |

The frontend needs **no env file** — it always calls the relative `/api` path.

## 🧩 Features

### 🛍️ Storefront & Discovery

- Server-side pagination, 8 sort modes (newest, price, rating, popularity, discount, name, featured)
- Filters: brand, category, price range, RAM, storage, 5G, on-offer, featured / new / best seller / deals
- Weighted full-text search across name, description, SKU, processor and camera
- Product detail with gallery, variants, spec table, offer pricing, reviews and ratings
- Deals page with countdown timers, flash sales, new arrivals, best sellers
- **Compare up to 4 phones** side by side with an AI verdict
- Wishlist (server-synced for users, `localStorage` for guests)
- Quick-view modal, command palette, skeleton loaders, error boundary

### 🛒 Cart, Checkout & Orders

- Server-side cart + guest cart merged on login, with stock validation (max 99 per line)
- Coupons: percentage/fixed, min order, max discount, usage caps, date windows
- Delivery: flat **Rs. 500**, **free over Rs. 100,000**
- 3-step checkout with saved addresses; **COD**, bank transfer, or card
- Transactional order creation (stock check → price snapshot → coupon → decrement stock → clear cart)
- 10-state order lifecycle, cancellation, return requests, refunds and one-click reorder

### 👤 Customer Portal

Dashboard · order history & detail · profile & avatar · password change · address book · notifications · AI assistant · settings · account deletion

### 🤖 AI Capabilities

Every answer is built from **live database records** — the AI never invents products, prices or stock.

| Feature | Endpoint |
| --- | --- |
| Product assistant | `POST /api/ai/product-assistant` |
| AI search (free text → filters) | `POST /api/ai/search` |
| Live suggestions | `GET /api/ai/suggestions?q=` |
| AI comparison | `POST /api/ai/compare` |
| Personalised recommendations | `POST /api/ai/recommendations` |
| Wishlist recommendations | `POST /api/ai/wishlist/recommendations` |
| Order assistant | `POST /api/ai/order-assistant` |
| Business assistant *(admin)* | `POST /api/admin/ai/business-assistant` |

The query parser understands budgets (`30k`, `1 lakh`, `under 50000`), storage (`256gb`), RAM, camera MP, 5G, brands and intents like *gaming*, *camera*, *battery* and *deals*.

### 🧑‍💼 Admin Console

| Area | Capabilities |
| --- | --- |
| **Dashboard** | Revenue, orders, customers, low stock, active offers, review counts |
| **Catalogue** | Products (create/edit/duplicate/publish), brands, categories, offers, flash sales |
| **Sales** | Orders (status updates, approve returns, refunds), coupons |
| **People** | Customer list/detail, activate/deactivate, review moderation |
| **Content** | Homepage sections, hero slides, testimonials, FAQs |
| **Insights** | Analytics with `7d / 30d / 90d / 1y / custom` ranges, AI business assistant |
| **Governance** | Audit log of every admin mutation (actor, resource, IP) |

### 🏠 Homepage CMS

16 configurable sections:
`announcementBar` · `heroCarousel` · `featuredCategories` · `trendingProducts` · `featuredBrands` · `flashDeals` · `aiFinder` · `productSpotlight` · `newArrivals` · `bestSellers` · `compareExperience` · `whyChooseUs` · `customerReviews` · `jaffnaStore` · `faq` · `newsletter`

### 🔐 Security & Platform

- JWT access (15m) + refresh (7d) with **rotation** and silent refresh on the client
- RBAC (`customer` / `admin`), bcrypt (cost 12), Zod validation on all mutating routes
- Rate limits: API 300/15min · auth 15/15min · AI 20/min · scoped newsletter/contact limiters
- Helmet, credentialed CORS allow-list, `X-Request-Id` tracing, centralised error envelope
- Graceful shutdown and actionable port-conflict diagnostics

## 🗺️ Frontend Routes

<details>
<summary><b>Public</b></summary>

`/` · `/shop` · `/phones` · `/product/:slug` · `/brands` · `/brand/:slug` · `/categories` · `/deals` · `/new-arrivals` · `/compare` · `/search` · `/cart` · `/checkout` *(login)* · `/wishlist` · `/ai-assistant` · `/about` · `/contact` · `/faq` · `/privacy` · `/terms` · `/warranty` · `/shipping`

**Auth:** `/login` · `/signup` · `/forgot-password`

</details>

<details>
<summary><b>Customer — <code>/customer/*</code></b></summary>

`dashboard` · `orders` · `orders/:id` · `wishlist` · `cart` · `profile` · `addresses` · `notifications` · `ai-assistant` · `settings`

</details>

<details>
<summary><b>Admin — <code>/admin/*</code></b></summary>

`dashboard` · `products` · `products/create` · `products/:id/edit` · `brands` · `categories` · `offers` · `flash-sales` · `orders` · `customers` · `reviews` · `homepage` · `hero-slides` · `analytics` · `ai` · `settings`

</details>

## 📡 API Overview

Base URL: `http://localhost:5000/api` · Response envelope: `{ success, message?, data, code? }`

| Group | Base path | Highlights |
| --- | --- | --- |
| Auth | `/auth` | `register` · `login` · `logout` · `refresh` · `me` · `forgot-password` · `reset-password` · `verify-email` |
| Users | `/users/me` | profile, password, avatar, delete account |
| Products | `/products` | list/filter, `/search`, `/slug/:slug`, `/brand/:slug`, admin CRUD, `/:id/duplicate`, `/:id/publish` |
| Brands · Categories | `/brands` · `/categories` | public read; admin CRUD + `/reorder` |
| Offers · Flash sales | `/offers` · `/flash-sales` | `/active`, admin CRUD, toggle & duplicate |
| Cart | `/cart` | items CRUD, `/coupon` |
| Wishlist | `/wishlist` | add/remove, `/:productId/move-to-cart` |
| Orders | `/orders` | create, list, detail, `/cancel`, `/return`, `/reorder` |
| Reviews | `/reviews` | product reviews, own reviews, admin moderation |
| Addresses · Notifications | `/addresses` · `/notifications` | CRUD · list / mark read |
| Homepage & content | `/homepage` · `/hero-slides` · `/testimonials` · `/faq` | public read, admin write; newsletter & contact |
| AI | `/ai/*` | see [AI Capabilities](#-ai-capabilities) |
| Admin | `/admin` | `stats`, `audit-logs`, orders, users, coupons, settings |
| Analytics | `/admin/analytics` | `overview` · `revenue` · `orders` · `products` · `brands` · `categories` · `customers` · `offers` |
| Health | `/health` | service status |

<details>
<summary><b>Full endpoint tables</b></summary>

#### Auth — `/api/auth`

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/register` | public |
| POST | `/login` | public |
| POST | `/logout` | optional auth |
| POST | `/refresh` | public |
| GET | `/me` | auth |
| POST | `/forgot-password` · `/reset-password` | public |
| POST | `/verify-email` | public |
| POST | `/verify-email/request` | auth |

#### Users — `/api/users` *(auth)*

| Method | Endpoint | Description |
| --- | --- | --- |
| GET / PUT / DELETE | `/me` | Get / update / delete profile |
| PUT | `/me/password` | Change password |
| PUT / DELETE | `/me/profile-picture` | Set / remove avatar |

#### Products — `/api/products`

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/` · `/search?q=` · `/slug/:slug` · `/brand/:slug` · `/:id` | public |
| POST | `/` | admin |
| PUT / DELETE | `/:id` | admin |
| POST | `/:id/duplicate` | admin |
| PATCH | `/:id/publish` | admin |

#### Cart — `/api/cart` *(auth)*

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Cart with computed totals |
| POST | `/items` | Add item |
| PUT / DELETE | `/items/:productId` | Update quantity / remove |
| DELETE | `/` | Clear cart |
| POST | `/coupon` | Validate & price a coupon |

#### Orders — `/api/orders` *(auth)*

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/` | Create order |
| GET | `/` · `/:id` | My orders / detail |
| POST | `/:id/cancel` · `/:id/return` · `/:id/reorder` | Order actions |

#### Admin — `/api/admin` *(admin only)*

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/stats` | Dashboard KPIs |
| GET | `/audit-logs` | Audit trail |
| GET | `/orders` · `/orders/:id` | Order list / detail |
| PUT | `/orders/:id/status` | Update status |
| POST | `/orders/:id/refund` · `/orders/:id/approve-return` | Refund / approve return |
| GET | `/users` · `/users/:id` | Customers |
| PUT | `/users/:id/status` | Activate / deactivate |
| GET/POST/PUT/DELETE | `/coupons[/:id]` | Coupons |
| GET/PUT | `/settings` | Store settings |

</details>

## 🗄️ Data Models

`User` · `Address` · `Brand` · `Category` · `Product` · `Offer` · `Coupon` · `Cart` · `Order` · `Review` · `Wishlist` · `Notification` · `HeroSlide` · `HomepageSection` · `Testimonial` · `FAQ` · `AuditLog`

Notable indexes: weighted text index on Product (name 10, description 5, sku 5, processor 2, camera 2), compound catalogue-flag indexes, price/offerPrice/storage/5G indexes, and Order, Notification and User lookup indexes.

## 📏 Business Rules

| Rule | Value |
| --- | --- |
| Currency | LKR, formatted `en-LK` with 0 decimals |
| Delivery fee | Rs. 500 flat |
| Free delivery threshold | Rs. 100,000 |
| Max quantity per cart line | 99 |
| Low-stock threshold | ≤ 5 units |
| Compare limit | 4 products |
| Cancellable statuses | pending, confirmed, processing |
| Discount % | Auto-derived from `price` vs `offerPrice` |

## 📜 Scripts

| Location | Command | Purpose |
| --- | --- | --- |
| `backend/` | `npm run dev` | Dev server with hot reload |
| `backend/` | `npm run build` | Compile TypeScript to `dist/` |
| `backend/` | `npm start` | Run compiled build |
| `backend/` | `npm run typecheck` | Type-check only |
| `backend/` | `npm run seed:admin` | Create/repair admin account |
| `frontend/` | `npm run dev` | Vite dev server (port 5173) |
| `frontend/` | `npm run build` | Type-check + production build |
| `frontend/` | `npm run preview` | Preview production build |

## 🌐 Deployment

1. **Build the API:** `cd backend && npm run build` → `backend/dist`
2. **Build the SPA:** `cd frontend && npm run build` → `frontend/dist`
3. **Configure production env:** `NODE_ENV=production`, real `MONGODB_URI`, **strong unique JWT secrets**, `COOKIE_SECURE=true`, and your site origin(s) in `CLIENT_URL`
4. **Run the API:** `npm start`
5. **Serve the SPA** from a static host or reverse proxy. Route `/api/*` and `/health` to the API; everything else to `index.html`
6. **AI (optional):** set `AI_API_KEY` to enable LLM responses — otherwise the grounded rule-based engine is used

## 🛠️ Troubleshooting

<details>
<summary><b><code>Port 5000 is already in use (EADDRINUSE)</b></code></summary>

Another Node dev server is bound to the port. Find and kill it:

```powershell
# Windows
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { taskkill /PID $_ /T /F }
```

```bash
# macOS / Linux
lsof -ti :5000 | xargs kill -9
```

Or change `PORT` in `backend/.env` and update the proxy target in `frontend/vite.config.ts`.

</details>

<details>
<summary><b><code>npm audit</code> shows high-severity advisories</b></summary>

These originate from dev-only tooling (`nodemon → chokidar@3 → braces`). `backend/package.json` pins `"overrides": { "chokidar": "^4.0.3" }` to resolve them. If your `node_modules` predates the override, delete it and re-run `npm install`. Production dependencies are unaffected (`npm audit --omit=dev` is clean).

</details>

## 🧭 Roadmap

Current limitations and planned improvements:

- [ ] Email delivery (SMTP/SES) for password reset and verification — tokens are generated but not sent
- [ ] Real payment gateway with webhooks — payments are currently only *recorded*, and `paymentStatus` defaults to `paid`
- [ ] Persisted store settings — delivery fee and free-delivery threshold currently come from constants
- [ ] Object storage (S3-compatible) for media — images are currently URLs / inline base64 avatars
- [ ] Push / email / SMS notification channels (in-app only today)
- [ ] Persisted newsletter and contact submissions (acknowledged, not stored, by design today)
- [ ] Automated test suite and CI pipeline

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Please run `npm run typecheck` (backend) and `npm run build` (frontend) before submitting.

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

**Jaffna Mobile Zone** — Premium Mobile Technology. Right Here in Jaffna. 🇱🇰

</div>