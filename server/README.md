# AromaWrap Server

Standalone Express + Prisma + MySQL API for the AromaWrap migration from Firebase.

This backend is **not connected to the React frontend yet**. The existing Firebase-powered frontend is unchanged.

## Implemented module

- Authentication only (`/api/auth/*`)
- Session-based auth using `express-session` (MemoryStore for now)
- Prisma `User` model + migration
- Zod request validation
- Consistent error format:

```json
{
  "success": false,
  "error": "..."
}
```

## Tech stack

- Node.js 18+
- Express 5
- Prisma ORM
- MySQL
- bcryptjs
- express-session
- zod
- dotenv, cors

## Folder structure

```txt
server/
  prisma/
    schema.prisma
    migrations/
      20260630153000_add_user_auth/
        migration.sql
      migration_lock.toml
  src/
    auth/
      schemas.ts
    lib/
      env.ts
      prisma.ts
    middleware/
      errorHandler.ts
      notFound.ts
      requireAuth.ts
      validate.ts
    routes/
      auth.ts
      health.ts
      index.ts
    types/
      express.d.ts
    uploads/
    app.ts
    index.ts
```

## Environment

Copy and configure:

```bash
cp .env.example .env
```

Required keys:

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

### POST `/api/auth/register`
Body:

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "displayName": "User Name"
}
```

### POST `/api/auth/login`
Body:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Creates a session and stores `userId` in session.

### POST `/api/auth/logout`
Destroys the session.

### GET `/api/auth/me`
Returns current user from session or `null`.

### GET `/api/auth/session`
Protected route using `requireAuth` middleware (returns logged-in user).

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

- Orders
- Products
- Cart
- Wishlist
- Upload workflows
- Admin management endpoints
- Password reset flow

Firebase frontend remains untouched.
