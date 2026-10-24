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
user, never from the request.

## Endpoints (prefix `/api`)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/auth/admin-sign-up` | public | Creates Firebase user, user row, organisation, and a store when `singleLocation` |
| GET | `/org` | admin | The signed-in admin's organisation |
| GET | `/stores` | admin | Stores of the admin's organisation |
| POST | `/stores` | admin | Create a store (flips `singleLocation` off once there are 2+) |
| GET | `/stores/:id` | admin | 404 if not in the admin's organisation |
| PATCH | `/stores/:id` | admin | Partial update |
| DELETE | `/stores/:id` | admin | |
| POST | `/waitlist` | public | Landing-page launch notification sign-up |

Errors are returned as `{ "message": string }`. Unique-constraint violations map to 409.
