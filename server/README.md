# AromaWrap Server

Standalone Express + Prisma + MySQL API for the AromaWrap migration from Firebase.

This backend is **not connected to the React frontend yet**. The existing Firebase-powered frontend is unchanged.

## Implemented modules

- Authentication (`/api/auth/*`)
- Products (`/api/products/*`)
- Cart (`/api/cart/*`)
- Wishlist (`/api/wishlist/*`)
- Orders (`/api/orders/*`)
- Admin orders (`/api/admin/orders/*`)
- Uploads (`/api/uploads/*`, static `/uploads/*`)
- Health check (`/api/health`)

## Response format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": "..."
}
```

## Environment

```bash
cp .env.example .env
```

Required:

- `DATABASE_URL`
- `SESSION_SECRET`

## Setup

```bash
cd server
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Auth API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Products API

See product routes in codebase. Public `GET`, admin-only `POST` / `PATCH` / `DELETE`.

## Cart API (authenticated)

All cart routes require a valid session.

#### `GET /api/cart`
Returns the user's cart with items, `totalItems`, and `totalPrice`.

#### `POST /api/cart/items`

```json
{
  "productId": "clx...",
  "quantity": 1
}
```

If the product is already in the cart, quantity is increased instead of creating a duplicate row. Price/name/image are snapshotted at add time.

#### `PATCH /api/cart/items/:id`

```json
{
  "quantity": 3
}
```

`:id` is the **cart item id**, not the product id.

#### `DELETE /api/cart/items/:id`
Remove one cart item.

#### `DELETE /api/cart`
Clear all cart items.

## Wishlist API (authenticated)

All wishlist routes require a valid session.

#### `GET /api/wishlist`
Returns the user's wishlist items.

#### `POST /api/wishlist/items`

```json
{
  "productId": "clx..."
}
```

Duplicate products return `409` with `"Product already in wishlist"`. Price/name/image/badge are snapshotted at add time.

#### `DELETE /api/wishlist/items/:id`
Remove one wishlist item.

#### `DELETE /api/wishlist`
Clear all wishlist items.

## Orders API (authenticated)

Users can only access their own orders.

#### `POST /api/orders`

Creates an order from the current cart, snapshots line-item pricing, and clears the cart.

```json
{
  "paymentMethod": "COD",
  "shippingName": "Jane Doe",
  "shippingEmail": "jane@example.com",
  "shippingPhone": "9876543210",
  "shippingAddress": "123 Main St",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingPincode": "400001"
}
```

`paymentMethod` is `COD` or `ONLINE`.

For `ONLINE` orders:

- `paymentStatus` is set to `PENDING`
- `onlinePaymentReview` is set to `PENDING`
- optional `userClaimedPaidAt` (ISO date) when the customer claims UPI payment

Returns `400` if the cart is empty.

#### `GET /api/orders`
Returns the authenticated user's orders (newest first).

#### `GET /api/orders/:id`
Returns a single order owned by the authenticated user.

## Admin Orders API (admin only)

Requires `ADMIN` role.

#### `GET /api/admin/orders`

Query parameters:

- `page` (default `1`)
- `limit` (default `20`, max `100`)
- `status` — `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
- `paymentStatus` — `PENDING`, `PAID`, `FAILED`
- `search` — matches order id, shipping fields, or customer email/name
- `fromDate` — ISO date (inclusive)
- `toDate` — ISO date (inclusive)

#### `GET /api/admin/orders/:id`
Returns full order details including customer summary.

#### `PATCH /api/admin/orders/:id/status`

```json
{
  "status": "PROCESSING"
}
```

#### `PATCH /api/admin/orders/:id/payment-review`

Online orders only. Approve or reject a customer's payment claim.

```json
{
  "action": "approve"
}
```

```json
{
  "action": "reject",
  "rejectionReason": "UTR could not be verified"
}
```

- `approve` sets `paymentStatus` to `PAID` and `onlinePaymentReview` to `APPROVED`
- `reject` sets `paymentStatus` to `FAILED` and `onlinePaymentReview` to `REJECTED`

## Uploads API

Uploaded files are stored under `server/uploads/` and served at `/uploads/*`.

Allowed types: `jpg`, `jpeg`, `png`, `webp` (max 5MB each). Filenames are server-generated; client filenames are not trusted.

Product `imageUrl` values may use either a full URL or a local path such as `/uploads/products/<uuid>.jpg`.

### Static files

#### `GET /uploads/*`
Serves files from the upload directory (for example `/uploads/products/abc.jpg`).

### Product images (admin only)

#### `POST /api/uploads/products`

`multipart/form-data` with field `images` (one or more files).

```json
{
  "success": true,
  "data": [
    { "url": "/uploads/products/abc.jpg" }
  ]
}
```

#### `DELETE /api/uploads/products`

```json
{
  "url": "/uploads/products/abc.jpg"
}
```

### Profile image (authenticated user)

#### `POST /api/uploads/profile`

`multipart/form-data` with field `image` (single file). Updates the user's `photoUrl` and deletes their previous local profile image if present.

```json
{
  "success": true,
  "data": {
    "url": "/uploads/users/abc.jpg"
  }
}
```

## Scripts

- `npm run dev` - start dev server
- `npm run build` - compile TypeScript
- `npm start` - run compiled server
- `npm run db:generate` - generate Prisma client
- `npm run db:migrate` - create/apply migrations
- `npm run db:migrate:deploy` - apply migrations in production
- `npm run db:push` - sync schema (non-migration)
- `npm run db:studio` - open Prisma Studio

## Out of scope (not implemented)

- Password reset flow
- Frontend integration

Firebase Storage and the Firebase-powered frontend remain untouched.
