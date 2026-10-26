# laila-core

Backend API for Gviano (Express 5, Drizzle ORM on PostgreSQL, Firebase Admin auth).

## Setup

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL
npm run db:migrate
npm run dev            # http://localhost:3000/api
```

For local auth, run the Firebase Auth emulator from the `laila` project (`npx firebase emulators:start --only auth`)
and keep `FIREBASE_AUTH_EMULATOR_HOST` set.

## Auth

Protected routes expect `Authorization: Bearer <Firebase ID token>`. The token must carry the `admin`
custom claim (set during sign-up). The organisation and stores are always resolved from the token's
user, never from the request. Diners (Gviano app) get the `diner` claim from `/auth/diner-sign-up` and
are refused by every admin route.

## Endpoints (prefix `/api`)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/auth/admin-sign-up` | public | Creates Firebase user, user row, organisation, and a store when `singleLocation` |
| POST | `/auth/diner-sign-up` | public | `{ email, password }`: creates a Firebase user with the `diner` role and a diners row |
| GET | `/org` | admin | The signed-in admin's organisation |
| GET | `/stores` | admin | Stores of the admin's organisation |
| POST | `/stores` | admin | Create a store (flips `singleLocation` off once there are 2+) |
| GET | `/stores/:id` | admin | 404 if not in the admin's organisation |
| PATCH | `/stores/:id` | admin | Partial update |
| DELETE | `/stores/:id` | admin | |
| PUT | `/stores/:id/hours`, `/stores/:id/tables` | admin | Replace opening hours / tables (tables upsert by id) |
| POST, DELETE | `/stores/:id/closures[/:closureId]` | admin | Whole-day closures |
| GET, POST, PATCH, DELETE, PUT | `/stores/:storeId/menu/…` | admin | Groups, items, `PUT groups/order` |
| GET, POST, PATCH, DELETE | `/stores/:storeId/reservations[/:id]` | admin | `GET` needs `?from=&to=` (YYYY-MM-DD) |
| GET | `/dashboard` | admin | Today, attention items, arrivals, 14-day history per store |
| POST | `/waitlist` | public | Landing-page launch notification sign-up |

Errors are returned as `{ "message": string }`. Unique-constraint violations map to 409.
