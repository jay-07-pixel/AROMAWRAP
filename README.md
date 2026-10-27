# AromaWrap

**AromaWrap** is a full-stack e-commerce platform for natural incense and fragrance products (agarbatti, dhoop sticks, puja essentials). It includes a React storefront, an Express REST API, and a MySQL database managed with Prisma.

**Live site:** [https://aromawrap.co.in](https://aromawrap.co.in)

Customers can browse products, manage cart and wishlist, checkout with COD or UPI, leave star ratings/reviews, and track orders. Admins manage products, inventory, orders, and UPI payment verification from a dashboard.

**Stack:** React storefront → Express REST API → MySQL (Prisma). Product images are stored on the server under `server/uploads/` and served at `/uploads/*`.

---

## Table of contents

- [Features](#features)
- [Product URLs and packaging QR codes](#product-urls-and-packaging-qr-codes)
- [Reviews](#reviews)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Data storage](#data-storage)
- [Project paths](#project-paths)
- [Frontend routes](#frontend-routes)
- [UPI payment flow](#upi-payment-flow)
- [Project structure](#project-structure)
- [Database](#database)
- [API reference](#api-reference)
- [Environment variables](#environment-variables)
- [Local development](#local-development)
- [Admin access](#admin-access)
- [Production build](#production-build)
- [VPS deployment](#vps-deployment)
- [Troubleshooting](#troubleshooting)
- [Git repositories](#git-repositories)
- [Scripts](#scripts)
- [Contact](#contact)
- [License](#license)

---

## Features

### Storefront (customer)

| Feature | Description |
|---------|-------------|
| **Home page** | New Arrivals and Best Sellers loaded from the API |
| **Categories** | Agarbatti, Dhoop Sticks, and category filter pages |
| **Search** | Full-text product search with sorting and pagination |
| **Product detail** | Image gallery, specs, description, mobile-friendly layout |
| **Product URLs** | Clean slug URLs (`/product/lavender`) — stable for packaging QR codes |
| **Quick view** | Modal preview from product cards |
| **Recently viewed** | Tracks recently opened products in the browser |
| **Cart** | Server-side persistent cart with drawer UI |
| **Wishlist** | Save products for later with drawer UI |
| **Checkout** | Shipping form, COD and online (UPI) payment options |
| **UPI payments** | Dynamic QR code, deep link to UPI apps, admin verification flow |
| **Reviews** | Star-only or star + written review; one review per user per product |
| **Account** | Login, registration, profile, addresses, orders, wishlist (mobile-friendly tabs) |
| **Password reset** | OTP emailed via backend SMTP |

### Admin

| Feature | Description |
|---------|-------------|
| **Dashboard** | Revenue, orders, and product overview |
| **Order management** | View orders, update status, approve/reject UPI payment claims |
| **Product CRUD** | Add product page, full-page edit product, delete from dashboard |
| **Multi-image upload** | Multiple product images per listing (admin upload API) |
| **Packaging QR URL** | Copy permanent product URL from admin for QR code printing |
| **Inventory** | Stock levels and product listing in dashboard |

### Backend API modules

| Module | Base path | Auth |
|--------|-----------|------|
| Health | `/api/health` | Public |
| Auth | `/api/auth` | Public / session |
| Products | `/api/products` | Public read; admin write |
| Reviews | `/api/products/:id/reviews` | Public read; session to submit |
| Cart | `/api/cart` | Session required |
| Wishlist | `/api/wishlist` | Session required |
| Orders | `/api/orders` | Session required |
| Admin orders | `/api/admin/orders` | Admin session |
| Profile | `/api/profile` | Session required |
| Addresses | `/api/addresses` | Session required |
| Uploads | `/api/uploads` | Session / admin |
| Static files | `/uploads/*` | Public |

---

## Product URLs and packaging QR codes

Each product has a permanent **slug** in the database (e.g. `lavender`, `mogra`, `sandal`).

| Type | Example |
|------|---------|
| **Public URL** | `https://aromawrap.co.in/product/lavender` |
| **Old ID URL** | `https://aromawrap.co.in/product/cmr3pucb40000kx66fth8qzjx` still works and redirects to the slug URL |

**For packaging QR codes:**

1. Go to **Admin → Products** (or **Edit Product**).
2. Click **Copy URL**.
3. Paste into your QR generator and print on packaging.

The slug **does not change** when you update images, price, or description — only if you explicitly change it in admin. This keeps printed QR codes valid.

**Adding a new product:**

1. Admin → **Add Product** — set name, category (`Agarbatti` or `Dhoop Sticks`), price, images.
2. Slug is auto-generated from the product name (e.g. `Sandal` → `sandal`).
3. Copy the packaging URL after save.

---

## Reviews

- Customers can submit **stars only** or **stars + optional written review**.
- Tapping stars in the product header saves a rating immediately (logged-in users).
- One review per user per product (upsert on submit).
- Product `rating` and `reviewsCount` are synced automatically on the product record.

---

## Tech stack

### Frontend (`/`)

- React 18 + TypeScript
- Vite 5
- React Router DOM 6
- Tailwind CSS + shadcn/ui (Radix)
- Framer Motion
- TanStack Query
- qrcode.react (UPI QR at checkout)

### Backend (`/server`)

- Node.js 20+
- Express 5
- Prisma 6 + MySQL 8
- express-session (HTTP-only cookie auth)
- bcryptjs (password hashing)
- Zod (request validation)
- Multer (file uploads)
- Nodemailer (password-reset OTP emails)

---

## Architecture

```
Browser (React)
    │
    │  Dev:  http://localhost:8080
    │  Prod: https://aromawrap.co.in
    │
    │  /api/*  and  /uploads/*
    ▼
Express API (:3001 in dev; PM2 in production)
    │
    ├── Prisma  →  MySQL (aromawrap database)
    └── uploads/  →  served at /uploads/*
```

- **Authentication:** HTTP-only session cookies. All API calls use `credentials: "include"`.
- **API format:** `{ success: true, data: ... }` or `{ success: false, error: "..." }`.
- **Dev proxy:** Vite proxies `/api` and `/uploads` to `http://localhost:3001`.

---

## Data storage

Everything important lives on **your server and MySQL database** via the Express REST API.

| Data | Where it is stored |
|------|-------------------|
| Users & passwords | MySQL `User` table (bcrypt hashed) |
| Login sessions | HTTP-only cookie via `express-session` |
| Products & slugs | MySQL `Product` + `ProductImage` |
| Product images | Files in `server/uploads/` → URL `/uploads/products/...` |
| Cart | MySQL `Cart` / `CartItem` (per logged-in user) |
| Wishlist | MySQL `Wishlist` / `WishlistItem` (per logged-in user) |
| Orders | MySQL `Order` / `OrderItem` |
| Addresses | MySQL `Address` |
| Reviews & ratings | MySQL `Review` |
| Password reset OTP | MySQL `PasswordResetOtp` |
| Recently viewed products | Browser `localStorage` only (not synced to server) |
| Recent search terms | Browser `localStorage` only |

**Admin product images:** uploaded through `POST /api/uploads/products` (Multer), then saved as paths like `/uploads/products/<uuid>.jpg` on the product record.

**Documentation:** Ignore outdated guides in the repo root that describe old storage or auth setups. Use this README and `server/README.md` as the source of truth.

---

## Project paths

| Machine | Folder |
|---------|--------|
| Windows (this repo) | `C:\Users\jayjo\AROMA WRAP -25-03-26` |
| Windows backend | `C:\Users\jayjo\AROMA WRAP -25-03-26\server` |
| VPS project | `/root/AROMAWRAP` |
| VPS backend | `/root/AROMAWRAP/server` |
| VPS frontend build | `/root/AROMAWRAP/dist` |
| VPS process | PM2 app name `aromawrap-api` |

Do not deploy from `/root/Kalpanik` or any other project folder. That is a different site.

---

## Frontend routes

| Path | Page |
|------|------|
| `/` | Home (New Arrivals, Best Sellers) |
| `/search` | Search results |
| `/category/:category` | Category listing (e.g. `/category/agarbatti`) |
| `/product/:productId` | Product detail — accepts **slug** or internal **id** |
| `/checkout` | Checkout |
| `/account` | Login, profile, addresses, orders, wishlist |
| `/admin` | Admin dashboard |
| `/admin/add-product` | Add new product |
| `/admin/edit-product/:productId` | Edit existing product |

---

## UPI payment flow

1. Customer selects **Online Payment (UPI)** at checkout.
2. A dynamic UPI QR is generated from `VITE_MERCHANT_UPI_ID` and the order total.
3. Customer can tap **Open UPI App** (`upi://` deep link on mobile).
4. Customer taps **I Have Paid**.
5. Order is created with `paymentStatus: PENDING` and `onlinePaymentReview: PENDING`.
6. Admin reviews the claim in the order details modal:
   - **Confirm** → payment approved (`PAID`)
   - **Reject** → reason required; shown to the customer in Account → Orders

---

## Project structure

```
AROMA WRAP/
├── src/                              # React frontend
│   ├── components/
│   │   ├── Header.tsx, Footer.tsx
│   │   ├── ProductCard.tsx, CartDrawer.tsx, WishlistDrawer.tsx
│   │   ├── QuickViewModal.tsx, UpiPaymentModal.tsx
│   │   ├── AdminProductImagesField.tsx
│   │   └── ui/                       # shadcn/ui primitives
│   ├── context/                      # Auth, Cart, Wishlist, RecentlyViewed
│   ├── hooks/
│   ├── lib/                          # api.ts, legacyProducts.ts (old ID cleanup), utils
│   ├── pages/
│   │   ├── Index.tsx, CategoryPage.tsx, ProductPage.tsx, SearchPage.tsx
│   │   ├── CheckoutPage.tsx, AccountPage.tsx
│   │   ├── AdminDashboard.tsx, AddProductPage.tsx, EditProductPage.tsx
│   │   └── NotFound.tsx
│   ├── services/                     # API clients + domain facades
│   │   ├── apiAuthService.ts, authService.ts
│   │   ├── apiProductService.ts, productService.ts
│   │   ├── apiReviewService.ts, reviewService.ts
│   │   ├── cartApiService.ts, cartService.ts
│   │   ├── wishlistApiService.ts, wishlistService.ts
│   │   ├── orderApiService.ts, orderService.ts
│   │   ├── profileApiService.ts, addressApiService.ts
│   │   └── uploadService.ts
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
│
├── server/                           # Express backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── routes/                   # auth, products, reviews, cart, wishlist,
│   │   │                             # orders, profile, addresses, uploads, health
│   │   ├── middleware/               # requireAuth, requireAdmin, validate, errors
│   │   ├── auth/, products/, reviews/, cart/, wishlist/, orders/
│   │   ├── profile/, addresses/, uploads/
│   │   ├── lib/                      # prisma, env, email
│   │   ├── app.ts
│   │   └── index.ts
│   ├── uploads/                      # Uploaded images (gitignored contents)
│   └── package.json
│
├── public/
├── dist/                             # Production frontend build output
├── vite.config.ts
├── package.json
├── .env.example                      # Frontend env template
└── server/.env.example               # Backend env template
```

---

## Database

### Models (Prisma)

| Model | Purpose |
|-------|---------|
| `User` | Accounts (email, password hash, role, display name, phone) |
| `PasswordResetOtp` | Hashed OTP for password reset (expiry + single use) |
| `Address` | User shipping addresses |
| `Product` | Catalog items with unique `slug`, rating, reviews count |
| `ProductImage` | Product image URLs + sort order |
| `Cart` / `CartItem` | Per-user shopping cart with price snapshots |
| `Wishlist` / `WishlistItem` | Per-user wishlist with price snapshots |
| `Order` / `OrderItem` | Placed orders with shipping + payment fields |
| `Review` | Per-user product ratings (optional comment) |

### Migrations (apply in order)

| Migration | Description |
|-----------|-------------|
| `20260630153000_add_user_auth` | Users and sessions |
| `20260630160000_add_products` | Products and images |
| `20260630170000_add_cart_wishlist` | Cart and wishlist |
| `20260630180000_add_orders` | Orders |
| `20260630190000_add_addresses` | User addresses |
| `20260630200000_add_password_reset_otp` | Password reset OTP |
| `20260703100000_add_reviews` | Product reviews |
| `20260703120000_review_comment_optional` | Optional review comment (star-only reviews) |

---

## API reference

Detailed backend docs: [`server/README.md`](server/README.md)

### Auth — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Start session |
| POST | `/logout` | End session |
| GET | `/me` | Current user (or null) |
| GET | `/session` | Session user (requires auth) |
| POST | `/forgot-password` | Send OTP email |
| POST | `/reset-password` | Reset password with OTP |

### Products — `/api/products`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Public — list, search, filter by category, paginate, sort |
| GET | `/slug/:slug` | Public — fetch by slug |
| GET | `/:id` | Public — fetch by id |
| POST | `/` | Admin — create product |
| PATCH | `/:id` | Admin — update product |
| DELETE | `/:id` | Admin — delete product |

### Reviews — `/api/products/:productId/reviews`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Public — list reviews (paginated) |
| GET | `/me` | Session — current user's review for product |
| POST | `/` | Session — submit or update review `{ rating, title?, comment? }` |

### Cart — `/api/cart` (session)

`GET /` · `POST /items` · `PATCH /items/:id` · `DELETE /items/:id` · `DELETE /`

### Wishlist — `/api/wishlist` (session)

`GET /` · `POST /items` · `DELETE /items/:id` · `DELETE /`

### Orders — `/api/orders` (session)

`POST /` (creates from cart) · `GET /` · `GET /:id`

### Admin orders — `/api/admin/orders` (admin)

`GET /` · `GET /:id` · `PATCH /:id/status` · `PATCH /:id/payment-review`

### Profile — `/api/profile` (session)

`GET /` · `PATCH /`

### Addresses — `/api/addresses` (session)

`GET /` · `POST /` · `PATCH /:id` · `DELETE /:id` · `PATCH /:id/default`

### Uploads

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/uploads/products` | Admin — multi-image upload |
| DELETE | `/api/uploads/products` | Admin |
| POST | `/api/uploads/profile` | User |
| GET | `/uploads/*` | Public (static files) |

---

## Environment variables

### Frontend — copy `.env.example` → `.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_MERCHANT_UPI_ID` | **Yes** | UPI ID shown on checkout QR (e.g. `yourname@paytm`) |
| `VITE_MERCHANT_NAME` | No | Merchant name on UPI QR (default: `AromaWrap`) |
| `VITE_API_URL` | No | API base URL. Leave empty in dev — Vite proxies `/api` |

All `VITE_` values are bundled into the public JavaScript. Never put secrets in them.

> **Note:** Do not set `NODE_ENV=production` in `.env.local`. Vite shows a warning if you do; production builds set this automatically via `npm run build`.

### Backend — copy `server/.env.example` → `server/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | MySQL connection string |
| `SESSION_SECRET` | **Yes** | Random string for session signing. In production at least 32 characters, or the API refuses to start |
| `PORT` | No | Default `3001` |
| `SESSION_NAME` | No | Cookie name (default `aromawrap.sid`) |
| `CORS_ORIGIN` | **Yes in production** | Site origin(s), comma-separated, `https://` only in production, e.g. `https://aromawrap.co.in,https://www.aromawrap.co.in` |
| `TRUST_PROXY` | No | Reverse proxies in front of Express. Defaults to `1` in production (nginx), `0` otherwise |
| `UPLOAD_DIR` | No | Upload storage directory (default `uploads`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | **Yes in production** | Password-reset emails. Without SMTP, password reset is disabled except with `NODE_ENV=development`, where the code is printed to the console |

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Local development

### Prerequisites

- Node.js 20+
- npm
- MySQL 8+

### 1. Backend

PowerShell (this PC):

```powershell
cd "C:\Users\jayjo\AROMA WRAP -25-03-26\server"
copy .env.example .env
```

Edit `server\.env` — set `DATABASE_URL` and `SESSION_SECRET`, then:

```powershell
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

API runs at **http://localhost:3001**.

### 2. Frontend

Open a second PowerShell window:

```powershell
cd "C:\Users\jayjo\AROMA WRAP -25-03-26"
copy .env.example .env.local
```

Edit `.env.local` — set `VITE_MERCHANT_UPI_ID` at minimum, then:

```powershell
npm install
npm run dev
```

Storefront runs at **http://localhost:8080**. Vite proxies `/api` and `/uploads` to the backend.

After the first setup, daily start is only:

```powershell
cd "C:\Users\jayjo\AROMA WRAP -25-03-26\server"
npm run dev
```

```powershell
cd "C:\Users\jayjo\AROMA WRAP -25-03-26"
npm run dev
```

### 3. Create an admin user

Register via the app at `/account`, then promote in MySQL:

```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Admin access

A user is admin only when `User.role = 'ADMIN'` in the database. The API checks this on every admin request.

Admin routes: `/admin`, `/admin/add-product`, `/admin/edit-product/:id`

---

## Production build

### Frontend

```bash
npm install
npm run build        # Output in dist/
npm run preview      # Optional local preview
```

### Backend

```bash
cd server
npm install
npm run db:generate
npm run db:migrate:deploy
npm run build
npm start            # Runs dist/index.js
```

Serve frontend `dist/` with nginx (or similar) and proxy `/api` and `/uploads` to the Express process.

---

## VPS deployment

SSH into the server, then run these commands in **`/root/AROMAWRAP`**. Do not run them inside `/root/Kalpanik`.

```bash
node -v   # must be v20 or newer
cd /root/AROMAWRAP
git pull origin main
git log -1 --oneline

cd /root/AROMAWRAP/server
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart aromawrap-api --update-env

cd /root/AROMAWRAP
npm install
npm run build
sudo systemctl reload nginx
```

### PM2

The production API process is typically named **`aromawrap-api`**. Check with:

```bash
pm2 list
pm2 logs aromawrap-api --lines 50
```

### nginx (typical setup)

- Serve static files from `dist/` for `/`
- Proxy `/api` and `/uploads` to the Express port (e.g. `3001`)
- Enable `try_files $uri $uri/ /index.html` for React Router client-side routes

Example location blocks:

```nginx
# Inside the HTTPS server block (listen 443 ssl).
server_tokens off;
client_max_body_size 12m;

add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

location /api {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /uploads {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    root /root/AROMAWRAP/dist;
    try_files $uri $uri/ /index.html;
}
```

Keep port 3001 closed to the internet (firewall), so the API is only reachable through nginx. Redirect all `http://` traffic to `https://`.

`X-Forwarded-For` is required: the API trusts one proxy (`TRUST_PROXY=1`) and uses the real client IP for login and password-reset attempt limits. Behind Cloudflare or a second proxy, set `TRUST_PROXY=2`.

### Frontend-only deploy

If you only changed UI (e.g. footer text), minimum steps:

```bash
cd /root/AROMAWRAP
git pull origin main
npm run build
sudo systemctl reload nginx
```

---

## Troubleshooting

| Issue | Cause / fix |
|-------|-------------|
| `NODE_ENV=production is not supported in the .env file` | Harmless Vite warning during `npm run build`. Remove `NODE_ENV` from frontend `.env` files. |
| Site not updated after deploy | Commands were run in the wrong folder. Use `/root/AROMAWRAP` and restart PM2 app `aromawrap-api`. Do not restart `kalpanik` or `kalpanik-api`. |
| Product page 404 | Product must exist in MySQL (add via Admin). Old bookmarked IDs redirect to slug URLs when valid. |
| UPI QR missing | Set `VITE_MERCHANT_UPI_ID` in `.env.local` / production frontend env, then rebuild frontend. |
| Admin can't add products | User needs `role = 'ADMIN'` in the database. |
| API exits with `CORS_ORIGIN must ...` or `SESSION_SECRET must ...` | Production safety checks. Set `CORS_ORIGIN` to the `https://` site origin(s) and a random `SESSION_SECRET` of 32+ characters in `server/.env`. |
| `Too many ... attempts` | Login, signup, password reset, reviews, orders and uploads are rate limited per IP (and per email for login/reset). Wait for the window to pass. |
| Images not loading | Check `server/uploads/` exists and nginx proxies `/uploads` to Express. |
| Password reset email not sent / "temporarily unavailable" | Configure `SMTP_*` in `server/.env`. Only with `NODE_ENV=development` is the code printed to the server console instead. |
| Reviews migration error | Run `npx prisma migrate deploy` in `server/` on the VPS. |

---

## Git repositories

| Remote | URL |
|--------|-----|
| `origin` | `https://github.com/jay-07-pixel/aromawrap-basic-deploy-26-01-26.git` |
| `aromawrap` | `https://github.com/jay-07-pixel/AROMAWRAP.git` |

Both remotes should point at the same `main` commit after sync:

```bash
git push origin main
git push aromawrap main
```

---

## Scripts

### Frontend (project root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run build` | Production build → `dist/` |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create/apply migrations (development) |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:push` | Push schema without migration (dev only) |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Contact

| | |
|---|---|
| **Website** | [https://aromawrap.co.in](https://aromawrap.co.in) |
| **Email** | contact@aromawrap.co.in |
| **Address** | 3063, Shreehari Nikitan, Gajanan Nagar, Hingna Rd, Near Electric Zone Square, Nagpur, Maharashtra 440016 |

---

## License

MIT
