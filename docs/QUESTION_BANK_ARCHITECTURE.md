# Question Bank Architecture (GATE CE Practice)

Production-grade design for question storage, rendering, admin CMS, OCR import, and scale path — aligned with Testbook / Unacademy / PW patterns.

---

## 1. Storage format decision

| Format | Verdict | Why |
|--------|---------|-----|
| **HTML** | ❌ Canonical | XSS risk, hard to edit, breaks on paste |
| **Markdown** | ⚠️ Secondary export | Weak tables, no WYSIWYG for admins |
| **Slate JSON** | ⚠️ | Smaller ecosystem than TipTap |
| **Lexical JSON** | ⚠️ | Meta stack; fewer exam-specific examples |
| **Custom blocks only** | ⚠️ | Reinvents editor; high maintenance |
| **TipTap JSON + LaTeX (chosen)** | ✅ **Canonical** | ProseMirror doc, industry editor, round-trip, tables/code/math/images |

### Hybrid model (implemented)

```
QuestionDocument
├── stem: RichContent      { format: "tiptap-v1", doc: JSONContent, plainText }
├── options[].body: RichContent
├── solution: RichContent
├── correctAnswer: string | string[] | number
└── metadata (subject, tags, pyq, media[])
```

- **Equations**: store **LaTeX source** in `inlineMath` / `blockMath` nodes → render with **KaTeX** at read time (never store KaTeX HTML in DB).
- **Images**: URL in TipTap `image` node + optional `media[]` for CDN metadata.
- **plainText**: denormalized for search, OCR diff, AI indexing.
- **Legacy adapter**: flat `questions.json` → `QuestionDocument` via `legacyToQuestionDocument()`.

---

## 2. Data model

See `lib/question-bank/types.ts` and `lib/question-bank/schema.ts` (Zod).

**Question types**: `mcq` | `msq` | `numerical` | `subjective`  
**Status**: `draft` | `review` | `published` | `archived`  
**Source**: `manual` | `ocr` | `ai` | `import`

### Future PostgreSQL schema (migration-ready)

```sql
CREATE TABLE subjects (id TEXT PRIMARY KEY, name TEXT, exam TEXT);
CREATE TABLE topics (id TEXT PRIMARY KEY, subject_id TEXT, name TEXT);
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  version INT NOT NULL,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  stem JSONB NOT NULL,
  solution JSONB NOT NULL,
  correct_answer JSONB,
  subject_id TEXT REFERENCES subjects(id),
  topic_id TEXT REFERENCES topics(id),
  difficulty TEXT,
  marks SMALLINT,
  exam TEXT,
  tags TEXT[],
  pyq JSONB,
  has_answer_key BOOLEAN,
  source TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);
CREATE TABLE question_options (
  id TEXT PRIMARY KEY,
  question_id TEXT REFERENCES questions(id),
  label TEXT,
  body JSONB,
  sort_order INT
);
CREATE TABLE question_media (
  id TEXT PRIMARY KEY,
  question_id TEXT,
  url TEXT,
  alt TEXT
);
CREATE TABLE staging_questions (
  id TEXT PRIMARY KEY,
  status TEXT,
  raw_text TEXT,
  proposed JSONB,
  ocr_blocks JSONB,
  confidence REAL,
  source_file TEXT,
  reviewer_notes TEXT
);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_questions_stem_fts ON questions USING GIN(to_tsvector('english', stem->>'plainText'));
```

---

## 3. Rendering engine

```
TipTap JSON → RichContentRenderer → React tree
  ├── text + marks (bold, link…)
  ├── inlineMath / blockMath → EquationBlock (KaTeX)
  ├── image → ImageBlock (next/image, lazy)
  ├── table → TableBlock
  ├── codeBlock → CodeBlock (lowlight)
  └── html node → sanitizeHtml() only
```

**Components** (`components/question-renderer/`):

- `QuestionRenderer` — stem + media
- `OptionRenderer` — MCQ/MSQ option row
- `SolutionRenderer` — explanation block
- `RichContentRenderer` — core walker
- `EquationBlock`, `ImageBlock`, `TableBlock`, `CodeBlock`

**Practice integration**: `QuestionCard` uses rich fields when `richStem` / `richOptions` present.

---

## 4. Admin CMS — TipTap (why not others)

| Editor | Verdict |
|--------|---------|
| **TipTap** | ✅ Chosen — ProseMirror, tables, math, images, React 18, read-only preview |
| Lexical | Strong but fewer ready-made exam extensions |
| Slate | More DIY |
| EditorJS | Block-only, weak inline math |

**Admin routes**: `/admin`, `/admin/questions`, `/admin/questions/new`, `/admin/questions/[id]`, `/admin/staging`

**Features**: visual editor, live preview, autosave (30s), draft/publish, metadata form, image URL insert, upload API.

**Auth**: `ADMIN_SECRET` in `.env.local` → httpOnly cookie + middleware on `/admin/*` and `/api/admin/*`.

---

## 5. OCR import pipeline (future)

```
PDF → pdf-to-png → Tesseract / Groq vision
  → staging_questions (status: pending)
  → Admin /admin/staging review UI
  → Editor corrects stem/options
  → Publish → questions table
```

**Staging file**: `data/question-bank/staging.json`  
**API**: `POST /api/admin/staging` (OCR worker writes), admin approves → `publishQuestion()`.

---

## 6. Images & equations

| Asset | Store | Render |
|-------|-------|--------|
| Equations | LaTeX in JSON attrs | KaTeX client-side |
| Images | `/public/images/` or CDN URL | `next/image`, lazy, `isSafeImageUrl()` |
| Uploads | `POST /api/admin/upload` → `public/images/uploads/` | Same |

**CDN**: set `NEXT_PUBLIC_CDN_HOSTS=cdn.example.com` for allowlist.

**Do not store**: KaTeX HTML, SVG snapshots (breaks theme/dark mode).

---

## 7. Security

1. **Never** `dangerouslySetInnerHTML` on user HTML — only KaTeX output + DOMPurify-sanitized legacy HTML nodes.
2. **Admin APIs** behind middleware + secret cookie.
3. **Upload**: MIME whitelist, 5MB cap, random filename.
4. **Images**: path-only or HTTPS allowlist.
5. **CSP** (production): restrict `script-src`, allow KaTeX styles.

---

## 8. Performance

| Layer | Strategy |
|-------|----------|
| List API | Cursor pagination `?cursor=&limit=50` (add when DB) |
| Practice UI | Virtualize question list (`@tanstack/react-virtual`) |
| Render | Lazy images, memo `RichContentRenderer` |
| DB | Indexes on status, subject, GIN tags, FTS on plainText |
| CDN | Cache-Control on `/images/*` |
| Server | Redis cache published sets by subject |

---

## 9. Folder structure

```
lib/question-bank/     types, schema, store, sanitize, adapters, auth
components/question-renderer/
components/admin/
app/admin/
app/api/admin/
app/api/questions/published/
data/question-bank/    published.json, drafts.json, staging.json
docs/QUESTION_BANK_ARCHITECTURE.md
middleware.ts
```

---

## 10. API design

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin/auth` | — | Login, set cookie |
| GET/POST | `/api/admin/questions` | Admin | List/save drafts |
| GET/PUT/DELETE | `/api/admin/questions/[id]` | Admin | CRUD |
| POST | `/api/admin/questions/[id]/publish` | Admin | Draft → published |
| GET/POST | `/api/admin/staging` | Admin | OCR queue |
| POST | `/api/admin/upload` | Admin | Image upload |
| GET | `/api/questions/published` | Public | Practice feed |

---

## 11. Example question

See `data/question-bank/example-question.json`.

---

## 12. Setup

```bash
# .env.local
ADMIN_SECRET=your-long-random-secret

npm run dev
# Admin: http://localhost:3000/admin/login
```

Copy example into published bank via admin UI or POST to `/api/admin/questions`.
