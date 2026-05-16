# GATE & ESE CE Practice

Practice **GATE** and **ESE** Civil Engineering previous-year questions in your browser. No login required.

## Features

- **GATE & ESE** exam switcher with separate progress
- **Previous year PYQs** — practice by year (2018–2024) in-app
- **Official paper links** — open full papers on GATE / UPSC websites
- **Practice mode** — instant feedback and solutions
- **Mock tests** — GATE, ESE Prelims, ESE Paper 2 patterns
- **Bookmarks & analysis** — track accuracy per subject

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Out of scope (not using)

- **Separate Express backend** — API is Next.js Route Handlers only
- **Prisma**
- **PostgreSQL**

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production build |

> PDF upload & auto-extraction can be added later. Questions are bundled in `data/questions.json`.

## Folder structure (Vercel-ready)

Repo root = Vercel project root. **Do not** put the app inside a subfolder.

```
GATE/                    ← connect this folder to Vercel (or repo root)
├── app/                 ← Next.js App Router (pages + API)
│   ├── (user)/          ← Home, practice, PYQ, login, me, attempts
│   ├── (admin)/         ← Admin CMS
│   └── api/             ← Serverless routes (Mongo, NextAuth, AI)
├── public/              ← Static assets (URLs start with /)
│   └── images/          ← Diagram PNGs (/images/fig9.png)
├── components/          ← React UI
├── lib/                 ← Shared helpers
├── backend/             ← Services/mappers (imported by app/api — not a separate server)
├── data/                ← Bundled JSON banks
├── hooks/
├── package.json
├── next.config.js
└── vercel.json
```

**Not deployed** (see `.vercelignore`): `scripts/`, `pdfs/`, root `images/` duplicate, OCR data.

## Deploy on Vercel

1. Push the repo to **GitHub** (root = this project, not a parent folder).
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework: **Next.js** (auto-detected). Root directory: **`.`** (leave default).
4. **Environment variables** (Project → Settings → Environment Variables):

| Variable | Required | Example |
|----------|----------|---------|
| `MONGODB_URI` | Yes (for DB PYQ/practice) | `mongodb+srv://...` |
| `NEXTAUTH_SECRET` | Yes (production) | long random string |
| `NEXTAUTH_URL` | Yes | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | For admin CMS | your email |
| `ADMIN_PASSWORD` | For admin CMS | strong password |
| `GROQ_API_KEY` | Optional | AI recap after answer |
| `CLOUDINARY_*` | Optional | image uploads in admin |

Copy names from `.env.local.example`. **Do not** commit `.env.local`.

5. Deploy → visit `https://<project>.vercel.app`.

**MongoDB:** Use [Atlas](https://www.mongodb.com/atlas); allow `0.0.0.0/0` or Vercel IPs for serverless. Import PYQ with `sourceType: pyq` and status **approved**.

**After first deploy:** set `NEXTAUTH_URL` to your live URL and redeploy if login breaks.
