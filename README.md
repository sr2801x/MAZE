# MAZE – AI Text to Image Generator (MERN SaaS)

Production-ready full-stack MERN SaaS:
- **Frontend**: React + Tailwind
- **Backend**: Node + Express (MVC)
- **DB**: MongoDB Atlas (Mongoose)
- **Auth**: Google OAuth + Email OTP (Nodemailer) + JWT
- **AI**: Hugging Face Inference API (Stable Diffusion)
- **Storage**: Cloudinary
- **Payments**: Stripe (credit packs)

## Monorepo structure

- `client/` React app
- `server/` Express API

## Quick start (local)

### 1) Environment variables

Create env files:
- `server/.env` (see `server/.env.example`)
- `client/.env` (see `client/.env.example`)

### 2) Install

From repo root:

```bash
npm run install:all
```

### 3) Run

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Deploy notes

- **Frontend**: Vercel (set `VITE_API_BASE_URL`)
- **Backend**: Render / Railway (set `CLIENT_URL`, DB + secrets, Stripe webhook secret)
- **MongoDB Atlas**: allow the backend IP / 0.0.0.0/0 for testing

## Required accounts / keys

- **MongoDB Atlas**: `MONGODB_URI`
- **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Hugging Face**: `HF_API_TOKEN` (+ optional `HF_MODEL`)
- **Google OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- **SMTP**: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (OTP emails)
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, success/cancel URLs

