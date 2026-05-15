const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const { extractTextFromPdf } = require("./pdfExtract");

const PDFS_DIR = path.join(__dirname, "..", "pdfs");
const DATA_FILE = path.join(__dirname, "..", "data", "questions.json");

const CHUNK_CHARS = parseInt(process.env.GROQ_CHUNK_CHARS || "5000", 10);
const REQUEST_DELAY_MS = parseInt(process.env.GROQ_REQUEST_DELAY_MS || "4000", 10);
const MAX_OUTPUT_TOKENS = parseInt(process.env.GROQ_MAX_TOKENS || "4096", 10);

const SYSTEM_PROMPT = `You are an expert exam question parser for GATE and ESE (Engineering Services Examination) Civil Engineering papers.

Extract all questions from the given exam text segment. Return a JSON array where each object has:
- id (string, unique — see id format rules below)
- question (full question text, clean)
- type (mcq / nat / msq)
- options (array of 4 strings for mcq/msq, empty array for nat)
- correct (index 0-3 for mcq, number string for nat, array of indices for msq)
- solution (clear step-by-step solution based on the correct answer)
- subject (must match allowed subjects for this exam/paper)
- topic (specific topic within subject)
- marks (1 or 2)
- year (integer from filename)
- difficulty (Easy / Medium / Hard)
- exam ('GATE' or 'ESE')
- paper (null for GATE; 'PRE' | 'P1' | 'P2' for ESE)

ID format:
- GATE: gate_ce_YYYY_NN (e.g. gate_ce_2023_01)
- ESE PRE: ese_ce_YYYY_pre_NN
- ESE P1: ese_ce_YYYY_p1_NN
- ESE P2: ese_ce_YYYY_p2_NN

GATE Civil subjects:
Structural Engineering / Geotechnical Engineering / Fluid Mechanics & Hydraulics /
Environmental Engineering / Transportation Engineering / Surveying /
Engineering Mathematics / General Aptitude

ESE Paper 1 & Prelims subjects:
Current Affairs & General Studies / Engineering Aptitude /
Engineering Mathematics & Numerical Analysis / General Principles of Design & Safety /
Standards & Quality Practices / Project Management / Material Science /
Information & Communication Technologies

ESE Paper 2 (Civil Technical) subjects:
Building Materials / Solid Mechanics / Structural Analysis / Design of Steel Structures /
Design of Concrete Structures / Geotechnical Engineering / Fluid Mechanics & Hydraulics /
Irrigation & Water Resources / Environmental Engineering / Transportation Engineering /
Surveying & Geology / Construction Management

Return ONLY a valid JSON array, no explanation, no markdown.`;

function parseFilename(filename) {
  const gateMatch = filename.match(/^GATE_CE_(\d{4})\.pdf$/i);
  if (gateMatch) {
    return { exam: "GATE", paper: null, year: parseInt(gateMatch[1], 10) };
  }

  const eseMatch = filename.match(/^ESE_CE_(\d{4})_(PRE|P1|P2)\.pdf$/i);
  if (eseMatch) {
    return {
      exam: "ESE",
      paper: eseMatch[2].toUpperCase(),
      year: parseInt(eseMatch[1], 10),
    };
  }

  throw new Error(
    `Invalid filename "${filename}". Expected GATE_CE_YYYY.pdf or ESE_CE_YYYY_PRE|P1|P2.pdf`
  );
}

function loadExistingQuestions() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    console.warn(`Warning: Could not parse ${DATA_FILE}, starting fresh.`);
    return [];
  }
}

function saveQuestions(questions) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2), "utf8");
}

function mergeQuestions(existing, incoming) {
  const byId = new Map(existing.map((q) => [q.id, q]));
  let added = 0;
  for (const q of incoming) {
    if (!byId.has(q.id)) {
      byId.set(q.id, q);
      added++;
    }
  }
  return { merged: Array.from(byId.values()), added };
}

function parseLlmResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error("LLM response is not a JSON array");
  }
  return parsed;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function splitIntoChunks(text, size) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + size, text.length);
    if (end < text.length) {
      const slice = text.slice(start, end);
      const lastQ = slice.lastIndexOf("\nQ");
      const lastNum = slice.search(/\n\d+[\.\)]\s/);
      const breakAt = Math.max(lastQ, lastNum);
      if (breakAt > size * 0.5) end = start + breakAt;
    }
    chunks.push(text.slice(start, end).trim());
    start = end;
  }
  return chunks.filter((c) => c.length > 50);
}

async function callGroq(systemPrompt, userContent, retries = 3) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not set. Add it to .env.local in project root.");
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    }

    const errText = await res.text();
    const isRateLimit =
      res.status === 413 ||
      res.status === 429 ||
      errText.includes("rate_limit") ||
      errText.includes("too large");

    if (isRateLimit && attempt < retries) {
      const wait = REQUEST_DELAY_MS * attempt * 2;
      console.warn(`  Rate limited, waiting ${wait / 1000}s before retry...`);
      await sleep(wait);
      continue;
    }

    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }
}

async function extractQuestionsFromText(rawText, meta, onProgress) {
  const chunks = splitIntoChunks(rawText, CHUNK_CHARS);
  const paperLabel = meta.paper ? ` Paper ${meta.paper}` : "";
  const idHint =
    meta.exam === "GATE"
      ? `gate_ce_${meta.year}_`
      : `ese_ce_${meta.year}_${(meta.paper || "pre").toLowerCase()}_`;

  const allQuestions = [];

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) {
      onProgress(`Groq chunk ${i + 1}/${chunks.length} (${meta.exam} ${meta.year})`);
    }

    const userContent = `Extract all ${meta.exam} Civil Engineering questions from this ${meta.year}${paperLabel} exam text (part ${i + 1} of ${chunks.length}).
Set exam="${meta.exam}", paper=${meta.paper === null ? "null" : `"${meta.paper}"`}, year=${meta.year} for every question.
Use id prefix: ${idHint} with zero-padded numbers (e.g. ${idHint}01). Do not duplicate ids across parts.

---\n${chunks[i]}`;

    const responseText = await callGroq(SYSTEM_PROMPT, userContent);
    const questions = parseLlmResponse(responseText);
    allQuestions.push(...questions);

    if (i < chunks.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return allQuestions;
}

async function extractFromPdf(filePath, onProgress) {
  const filename = path.basename(filePath);
  const meta = parseFilename(filename);

  const { text: rawText, method } = await extractTextFromPdf(filePath, onProgress);
  console.log(`  Text via ${method}: ${rawText.length} characters`);

  if (onProgress) onProgress(`Sending to Groq: ${filename} (${splitIntoChunks(rawText, CHUNK_CHARS).length} chunks)`);

  const questions = await extractQuestionsFromText(rawText, meta, onProgress);

  return questions.map((q) => ({
    ...q,
    exam: q.exam ?? meta.exam,
    paper: q.paper !== undefined ? q.paper : meta.paper,
    year: q.year ?? meta.year,
  }));
}

async function processAllPdfs(onProgress) {
  if (!fs.existsSync(PDFS_DIR)) fs.mkdirSync(PDFS_DIR, { recursive: true });

  const files = fs
    .readdirSync(PDFS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();

  if (files.length === 0) {
    return { results: [], totalAdded: 0, errors: [], totalQuestions: 0 };
  }

  let existing = loadExistingQuestions();
  const results = [];
  const errors = [];
  let totalAdded = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(PDFS_DIR, file);
    if (onProgress) onProgress(`Processing ${file} (${i + 1}/${files.length})`);
    try {
      const questions = await extractFromPdf(filePath, onProgress);
      const { merged, added } = mergeQuestions(existing, questions);
      existing = merged;
      saveQuestions(existing);
      totalAdded += added;
      results.push({ file, extracted: questions.length, added, success: true });
      console.log(
        `✅ ${questions.length} questions extracted from ${file} (${added} new)`
      );
    } catch (err) {
      const msg = err.message || String(err);
      errors.push({ file, error: msg });
      results.push({
        file,
        extracted: 0,
        added: 0,
        success: false,
        error: msg,
      });
      console.error(`❌ Error processing ${file}: ${msg}`);
    }
  }

  return { results, totalAdded, errors, totalQuestions: existing.length };
}

module.exports = {
  processAllPdfs,
  extractFromPdf,
  loadExistingQuestions,
  parseFilename,
  PDFS_DIR,
  DATA_FILE,
};
