# AromaWrap

AromaWrap is a React + TypeScript e-commerce app for incense and fragrance products (agarbatti, dhoop, puja items), with Firebase-backed auth, cart, wishlist, and order management.

## Highlights

- Product catalog with category and search pages
- Product details, quick view, wishlist, and recently viewed
- Cart drawer + checkout with shipping form
- UPI QR payment modal for online payments
- Customer order history in account section
- Admin dashboard for order and product operations
- Firebase Firestore + Storage integration

## UPI Payment Flow (Current)

For online payments:

1. User selects `Online Payment (UPI)` on checkout.
2. A dynamic UPI QR is generated using merchant UPI ID + exact order amount.
3. User can tap `Open UPI App` (uses `upi://` deep link on mobile).
4. User taps `I Have Paid`.
5. Order is created with:
   - `paymentStatus: pending`
   - `onlinePaymentReview: pending`
6. Admin reviews claim in admin order details:
   - `Confirm` -> payment approved (`paid`)
   - `Reject` -> reason required, stored and shown to user

User can see approval/rejection status and rejection reason in `Account -> Orders`.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS + shadcn/ui (Radix)
- Framer Motion
- React Router DOM
- Firebase (Auth, Firestore, Storage)
- TanStack Query
- qrcode.react

## Routes

- `/` - Home
- `/search` - Search results
- `/category/:category` - Category listing
- `/product/:productId` - Product detail
- `/checkout` - Checkout
- `/account` - User account
- `/admin` - Admin dashboard
- `/admin/add-product` - Add product page

## Project Structure

```txt
src/
  components/
  context/
  hooks/
  lib/
  pages/
  services/
  App.tsx
  main.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase project (Auth, Firestore, Storage enabled)

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Firebase Setup Notes

- Firebase is currently initialized in `src/lib/firebase.ts`.
- If you want environment-based config, move credentials to `.env` and read via `import.meta.env`.
- Ensure Firestore rules allow:
  - users to read their own orders
  - admin to update payment review fields:
    - `paymentStatus`
    - `onlinePaymentReview`
    - `paymentRejectionReason`

## Admin Access

Admin access is granted if:

- user email is `admin@gmail.com`, or
- `userProfile.role === "admin"`

## Important Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run build:dev` - dev-mode build
- `npm run lint` - eslint
- `npm run preview` - preview build

## Notes

- Product data is currently a mix of static page data and Firebase-backed operations.
- Some test/demo prices may be temporarily changed during development.

## License

MIT
