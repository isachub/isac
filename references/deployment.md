# ISAC — Deployment Plan

**Stack:** Next.js (Vercel) + NestJS (Railway) + PostgreSQL (Railway)

---

## Recommended Setup

| Service | Platform | Why |
|---|---|---|
| Frontend (Next.js) | Vercel | Built for Next.js, zero config, free tier |
| Backend (NestJS) | Railway | Simple Node.js deploys, free tier, built-in PostgreSQL |
| Database (PostgreSQL) | Railway plugin | Auto-provisioned, DATABASE_URL injected automatically |

---

## Environment Variables

### Backend — Railway (apps/api)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Auto-set by Railway PostgreSQL plugin |
| `JWT_SECRET` | Strong random string — run: `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `7d` |
| `ANTHROPIC_API_KEY` | Your Anthropic key |
| `FRONTEND_URL` | Your Vercel URL — e.g. `https://isac.vercel.app` |
| `PORT` | Set by Railway automatically — do not override |

### Frontend — Vercel (apps/web)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your Railway API URL — e.g. `https://isac-api.railway.app/api` |

---

## Deployment Steps

### Step 1 — Push code to GitHub

```bash
git init
git add .
git commit -m "Initial commit — ISAC MVP"
git remote add origin https://github.com/your-username/isac.git
git push -u origin main
```

---

### Step 2 — Deploy backend on Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo
3. Set **Root directory** to `apps/api`
4. Add a **PostgreSQL** plugin — Railway auto-sets `DATABASE_URL`
5. Set environment variables (see table above)
6. Set the following in Railway service settings:
   - **Build command:** `npm run build`
   - **Start command:** `npm run start:prod`

Railway will:
- Install dependencies
- Run `prisma generate` (included in `npm run build`)
- Build the NestJS app
- On start: run `prisma migrate deploy` then start the server

7. Copy the Railway public URL — e.g. `https://isac-api.railway.app`

---

### Step 3 — Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repo
3. Set **Root directory** to `apps/web`
4. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://isac-api.railway.app/api`
5. Deploy

Vercel will auto-detect Next.js and run `next build`.

---

### Step 4 — Update CORS on Railway

After Vercel gives you a URL (e.g. `https://isac.vercel.app`):

1. Go to Railway → your API service → Variables
2. Set `FRONTEND_URL` = `https://isac.vercel.app`
3. Redeploy the service (Railway auto-redeploys on variable changes)

---

## Build and Run Commands

### Backend (apps/api)

| Command | What it does |
|---|---|
| `npm run build` | Runs `prisma generate` then compiles TypeScript → `dist/` |
| `npm run start:prod` | Runs `prisma migrate deploy` then starts `node dist/main` |
| `npm run dev` | Development mode with hot reload |

### Frontend (apps/web)

| Command | What it does |
|---|---|
| `npm run build` | Builds Next.js production bundle |
| `npm run start` | Starts the production server |
| `npm run dev` | Development mode |

---

## Database Migrations

### Local development

```bash
cd apps/api
npx prisma migrate dev --name <migration-name>
```

### Production (Railway)

Migrations run automatically on every deployment via `npm run start:prod`:

```bash
npx prisma migrate deploy
```

`migrate deploy` applies any pending migrations without prompting.
It is safe to run on every startup — it is idempotent.

> **Important:** Never run `prisma migrate dev` in production. It resets the database.

---

## Pre-deployment Checklist

- [ ] `JWT_SECRET` is a strong random value (not the default)
- [ ] `ANTHROPIC_API_KEY` is set on Railway
- [ ] `FRONTEND_URL` on Railway matches the Vercel domain exactly
- [ ] `NEXT_PUBLIC_API_URL` on Vercel matches the Railway domain exactly
- [ ] At least one migration exists in `prisma/migrations/` — run `prisma migrate dev --name init` locally first
- [ ] `.env` files are in `.gitignore` (they are)
- [ ] `generated/` folder is in `.gitignore` (it is)

---

## Local Development Reference

```bash
# Terminal 1 — API
cd apps/api
cp .env.example .env   # fill in your values
npm run dev

# Terminal 2 — Frontend
cd apps/web
cp .env.example .env.local  # fill in your values
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001/api/v1/health
