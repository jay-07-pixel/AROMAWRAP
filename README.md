# AromaWrap

AromaWrap is a full-stack e-commerce platform for incense and fragrance products (agarbatti, dhoop, puja items). It includes a React storefront, an Express REST API, and a MySQL database managed with Prisma.

The app supports customer shopping flows (browse, cart, wishlist, checkout, orders) and admin operations (product management, order fulfillment, UPI payment review).

---

## Features

### Storefront (customer)

| Feature | Description |
|---------|-------------|
| **Product catalog** | Home page, category listings, search, and product detail pages |
| **Quick view** | Modal preview without leaving the listing page |
| **Recently viewed** | Tracks recently opened products in the browser |
| **Cart** | Persistent server-side cart with drawer UI |
| **Wishlist** | Save products for later with drawer UI |
| **Checkout** | Shipping form, COD and online (UPI) payment options |
| **UPI payments** | Dynamic QR code, deep link to UPI apps, admin verification flow |
| **Account** | Login, registration, profile, saved addresses, order history |
| **Password reset** | OTP emailed via backend (SMTP) — `requestPasswordReset` / `confirmPasswordReset` in `authService` |

### Admin

| Feature | Description |
|---------|-------------|
| **Dashboard** | Revenue, order, and product overview |
| **Order management** | View orders, update status, approve/reject UPI payment claims |
| **Product management** | Add products (admin add-product page), inventory in dashboard |
| **Image uploads** | Product and profile images via Express upload API |

### Backend API

| Module | Base path | Auth |
|--------|-----------|------|
| Health | `/api/health` | Public |
| Auth | `/api/auth` | Public / session |
| Products | `/api/products` | Public read; admin write |
| Cart | `/api/cart` | Session required |
| Wishlist | `/api/wishlist` | Session required |
| Orders | `/api/orders` | Session required |
| Admin orders | `/api/admin/orders` | Admin session |
| Profile | `/api/profile` | Session required |
| Addresses | `/api/addresses` | Session required |
| Uploads | `/api/uploads` | Session / admin |
| Static files | `/uploads/*` | Public |

---

## Tech stack

### Frontend (`/`)

- React 18 + TypeScript
- Vite
- React Router DOM
- Tailwind CSS + shadcn/ui (Radix)
- Framer Motion
- TanStack Query
- qrcode.react (UPI QR)

### Backend (`/server`)

- Node.js 18+
- Express 5
- Prisma + MySQL
- express-session (cookie-based auth)
- bcryptjs (password hashing)
- Zod (request validation)
- Multer (file uploads)
- Nodemailer (password-reset OTP emails)

---

## Architecture

```
Browser (React, :8080)
        │
        │  /api/*  and  /uploads/*  (dev proxy)
        ▼
Express API (:3001)
        │
        ├── Prisma  →  MySQL
        └── uploads/  →  served at /uploads/*
```

- **Authentication:** HTTP-only session cookies (`credentials: "include"` on all API calls).
- **API format:** `{ success: true, data: ... }` or `{ success: false, error: "..." }`.
- **No Firebase:** All data flows through the Express API and MySQL.

---

## Routes (frontend)

| Path | Page |
|------|------|
| `/` | Home |
| `/search` | Search results |
| `/category/:category` | Category listing |
| `/product/:productId` | Product detail |
| `/checkout` | Checkout |
| `/account` | Login, profile, addresses, orders, wishlist tab |
| `/admin` | Admin dashboard |
| `/admin/add-product` | Add product |

---

## UPI payment flow

1. Customer selects **Online Payment (UPI)** at checkout.
2. A dynamic UPI QR is generated from `VITE_MERCHANT_UPI_ID` and the order total.
3. Customer can tap **Open UPI App** (`upi://` deep link on mobile).
4. Customer taps **I Have Paid**.
5. Order is created with `paymentStatus: pending` and `onlinePaymentReview: pending`.
6. Admin reviews the claim in the order details modal:
   - **Confirm** → payment approved (`paid`)
   - **Reject** → reason required; shown to the customer in Account → Orders

---

## Project structure

```
AROMA WRAP/
├── src/                          # React frontend
│   ├── components/               # UI components (Header, CartDrawer, ProductCard, …)
│   │   └── ui/                   # shadcn/ui primitives
│   ├── context/                  # Auth, Cart, Wishlist, RecentlyViewed
│   ├── hooks/                    # use-toast, use-mobile
│   ├── lib/                      # api.ts (fetch wrapper), utils.ts
│   ├── pages/                    # Route pages
│   ├── services/                 # API clients + domain services
│   │   ├── apiAuthService.ts
│   │   ├── apiProductService.ts
│   │   ├── cartApiService.ts
│   │   ├── wishlistApiService.ts
│   │   ├── orderApiService.ts
│   │   ├── profileApiService.ts
│   │   ├── addressApiService.ts
│   │   ├── uploadService.ts
│   │   ├── authService.ts        # Auth + profile + address facade
│   │   ├── productService.ts
│   │   ├── cartService.ts
│   │   ├── wishlistService.ts
│   │   └── orderService.ts
│   ├── config/                   # LCP preload config
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
│
├── server/                       # Express backend
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # SQL migrations
│   ├── src/
│   │   ├── routes/               # HTTP route handlers
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── cart.ts
│   │   │   ├── wishlist.ts
│   │   │   ├── orders.ts
│   │   │   ├── profile.ts
│   │   │   ├── addresses.ts
│   │   │   ├── uploads.ts
│   │   │   ├── health.ts
│   │   │   └── admin/orders.ts
│   │   ├── middleware/           # requireAuth, requireAdmin, validate, errors
│   │   ├── auth/                   # Schemas, password-reset OTP
│   │   ├── products/               # Schemas, serializer, utils
│   │   ├── cart/
│   │   ├── wishlist/
│   │   ├── orders/
│   │   ├── profile/
│   │   ├── addresses/
│   │   ├── uploads/                # Multer config, paths
│   │   ├── lib/                    # prisma, env, email, productSnapshot
│   │   ├── app.ts
│   │   └── index.ts
│   ├── uploads/                    # Uploaded images (gitignored contents)
│   └── package.json
│
├── public/                       # Static assets
├── dist/                         # Production frontend build output
├── vite.config.ts                # Dev server + API proxy
├── package.json
└── .env.example                  # Frontend env template
```

---

## Database models (Prisma)

| Model | Purpose |
|-------|---------|
| `User` | Accounts (email, password, role, profile fields) |
| `PasswordResetOtp` | Hashed OTP for password reset (10 min expiry) |
| `Address` | User shipping addresses |
| `Product` | Catalog items |
| `ProductImage` | Product image URLs + sort order |
| `Cart` / `CartItem` | Per-user shopping cart |
| `Wishlist` / `WishlistItem` | Per-user wishlist |
| `Order` / `OrderItem` | Placed orders with price snapshots |

**Migrations** (in order):

1. `20260630153000_add_user_auth`
2. `20260630160000_add_products`
3. `20260630170000_add_cart_wishlist`
4. `20260630180000_add_orders`
5. `20260630190000_add_addresses`
6. `20260630200000_add_password_reset_otp`

---

## API reference (summary)

Detailed endpoint documentation lives in [`server/README.md`](server/README.md).

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
| GET | `/` | Public (list, search, filter, paginate) |
| GET | `/slug/:slug` | Public |
| GET | `/:id` | Public |
| POST | `/` | Admin |
| PATCH | `/:id` | Admin |
| DELETE | `/:id` | Admin |

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
| POST | `/api/uploads/products` | Admin |
| DELETE | `/api/uploads/products` | Admin |
| POST | `/api/uploads/profile` | User |
| GET | `/uploads/*` | Public (static) |

---

## Environment variables

### Frontend — copy `.env.example` → `.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ADMIN_EMAIL` | Optional | Email treated as admin (alongside DB `ADMIN` role) |
| `VITE_API_URL` | Optional | API base URL (empty in dev — Vite proxies `/api`) |
| `VITE_MERCHANT_UPI_ID` | Yes | UPI ID for checkout QR |
| `VITE_MERCHANT_NAME` | Optional | Merchant name on UPI QR |

### Backend — copy `server/.env.example` → `server/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string |
| `SESSION_SECRET` | Yes | Session signing secret |
| `PORT` | No | Default `3001` |
| `CORS_ORIGIN` | No | Frontend origin(s), comma-separated |
| `UPLOAD_DIR` | No | Upload storage directory |
| `SMTP_*` | No | Email for password-reset OTP (logged to console if unset) |

---

## Getting started (local development)

### Prerequisites

- Node.js 18+
- npm
- MySQL 8+

### 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env — set DATABASE_URL and SESSION_SECRET

npm install
npm run db:generate
npm run db:migrate
npm run dev
```

API runs at **http://localhost:3001**.

### 2. Frontend

```bash
# From project root
cp .env.example .env.local
# Edit .env.local — set VITE_MERCHANT_UPI_ID at minimum

npm install
npm run dev
```

Storefront runs at **http://localhost:8080**. Vite proxies `/api` and `/uploads` to the backend.

### 3. Create an admin user

Register via the app, then set `role = ADMIN` in the database:

```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Or set `VITE_ADMIN_EMAIL` to your email for admin UI access.

---

## Production build

### Frontend

```bash
npm run build      # Output in dist/
npm run preview    # Local preview of production build
```

### Backend

```bash
cd server
npm run build
npm run db:migrate:deploy
npm start
```

Serve the frontend `dist/` with nginx (or similar) and proxy `/api` and `/uploads` to the Express process.

---

## VPS deployment (quick reference)

```bash
cd /path/to/aromawrap
git pull origin main
git log -1 --oneline   # Should show latest commit with full backend

cd server
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
# restart your process manager (pm2, systemd, etc.)

cd ..
npm install
npm run build
# deploy dist/ or restart static server
```

**Repositories:**

| Remote | URL |
|--------|-----|
| `origin` | `https://github.com/jay-07-pixel/aromawrap-basic-deploy-26-01-26.git` |
| `aromawrap` | `https://github.com/jay-07-pixel/AROMAWRAP.git` |

Both remotes should point at the same `main` commit after sync.

---

## Admin access

A user is treated as admin when:

- `userProfile.role === "admin"` (database `ADMIN` role), **or**
- email matches `VITE_ADMIN_EMAIL` (if configured)

---

## Scripts

### Frontend (root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (:8080) |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:studio` | Prisma Studio GUI |

---

## License

MIT
