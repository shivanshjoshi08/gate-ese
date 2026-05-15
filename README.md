# GATE & ESE CE Practice

A Next.js 14 practice web app for **GATE** and **ESE** Civil Engineering, with automatic question extraction from PYQ PDF files using the Groq API.

## Features

- **Dual exam support** — GATE (blue) and ESE (purple) with separate progress tracking
- **PDF extraction** — Parse GATE & ESE PYQ PDFs into structured JSON via Groq (Llama)
- **Practice mode** — Instant feedback, solutions, filters by paper/subject/year
- **Mock tests** — GATE (65 Q / 3 hr), ESE Prelims (120 Q / 2 hr), ESE Paper 2 (~150 marks / 3 hr)
- **Bookmarks & analysis** — Per-exam stats, ESE paper-wise accuracy charts

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add PDFs

Place PDFs in `/pdfs/`:

**GATE:** `GATE_CE_YYYY.pdf`  
**ESE:** `ESE_CE_YYYY_PRE.pdf`, `ESE_CE_YYYY_P1.pdf`, `ESE_CE_YYYY_P2.pdf`

See `/pdfs/README.txt` for details.

### 3. Configure Groq API key

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### 4. Extract questions

```bash
npm run extract
```

**Notes:**
- Scanned/image PDFs are processed with **OCR** (slower, ~1–2 min per 16 pages).
- Large papers are sent to Groq in **chunks** to stay within API token limits.
- Optional `.env.local` tuning: `GROQ_CHUNK_CHARS`, `GROQ_REQUEST_DELAY_MS`, `OCR_ENABLED=false` to skip OCR.

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Exam switcher

Use the **GATE** / **ESE** tabs at the top of every page. Progress is stored separately:

- `progress_gate` — GATE attempts & bookmarks
- `progress_ese` — ESE attempts & bookmarks

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run extract` | Extract questions from PDFs (Groq) |
| `npm start` | Production server |

## Deploy to Vercel

Commit `/data/questions.json` after extraction. Add `GROQ_API_KEY` only if running extraction in CI.

## Tech stack

- Next.js 14 (App Router) · Tailwind CSS
- pdf-parse · Groq API (extraction)
- Recharts · localStorage (per-exam progress)
