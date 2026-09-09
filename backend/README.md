# Huddle Backend — Auth & Session

Backend service for Huddle's user registration, login, and session management, built for the Agile Practicum demo sprint.

This is one part of a larger backend split between two engineers:
- **This service** — registration, login, JWT session handling (owned here)
- **Channels/messaging** — owned by the other backend engineer, built as a separate module in this same project

## Tech stack

- NestJS
- MongoDB (via Mongoose)
- JWT (via `@nestjs/jwt` and Passport)
- bcrypt for password hashing

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with:
- `MONGODB_URI` — your MongoDB Atlas connection string (must include a database name, e.g. `/huddle`, right after `.mongodb.net`)
- `JWT_SECRET` — any long random string
- `PORT` — defaults to 5000 if unset

## Running it

```bash
npm run start:dev
```

Watch mode — it stays running and recompiles on file changes. A successful start ends with:

```
[Nest] ... Nest application successfully started
```

If you see a red `ERROR` line instead, the server isn't actually listening on any port even though the terminal looks "alive."

## API endpoints

See [`API.md`](./API.md) for full request/response formats. Quick summary:

| Method | Route | Auth required | Purpose |
|---|---|---|---|
| POST | `/api/register` | No | Create an account |
| POST | `/api/login` | No | Get a JWT |
| GET | `/api/me` | Yes | Get current user info |
| POST | `/api/logout` | Yes | Client-side token discard (JWTs are stateless — see note in API.md) |

## Testing

Using Thunder Client (VS Code extension) or any REST client:

1. `POST /api/register` with `{"email": "...", "password": "..."}` → expect `201`
2. `POST /api/login` with the same credentials → expect `200` with a `token`
3. `GET /api/me` with header `Authorization: Bearer <token>` → expect your user data back

Confirm data actually lands correctly by checking **MongoDB Atlas → Browse Collections** for a `huddle` database with a `users` collection.

## For the other backend engineer

`JwtAuthGuard` (`src/auth/guards/jwt-auth.guard.ts`) is exported from `AuthModule` and ready to protect your routes:

```typescript
@UseGuards(JwtAuthGuard)
@Get('some-protected-route')
someMethod(@Req() req: Request & { user: { userId: string } }) {
  // req.user.userId is available here
}
```

Import `AuthModule` into your module to get access to it.