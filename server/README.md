# MAZE Server (Express + MongoDB)

## Setup

1) Copy env:
- `cp .env.example .env` (or create `server/.env` on Windows)

2) Install:

```bash
npm install
```

3) Run:

```bash
npm run dev
```

## API

- `GET /api/health`

### Auth
- `POST /api/auth/otp/request` `{ email }`
- `POST /api/auth/otp/verify` `{ email, otp }` → sets cookie + returns `{ token, user }`
- `GET /api/auth/me` (protected)
- `GET /api/auth/google` (redirect)
- `GET /api/auth/google/callback` → redirects to `CLIENT_OAUTH_REDIRECT?token=...`

### Image
- `POST /api/image/generate` `{ prompt }` (protected, costs 1 credit)
- `GET /api/image/history` (protected)

### Payments (Stripe)
- `GET /api/payments/pricing`
- `POST /api/payments/checkout` `{ packId }` (protected) → returns Stripe Checkout URL
- `POST /api/payments/webhook/stripe` (Stripe webhook, raw body)

