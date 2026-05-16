import { NextResponse } from "next/server";
import { groqChatCompletion, GroqApiError, GroqNotConfiguredError } from "@/lib/groq-chat";
import {
  parseAiPerformanceAnalysis,
  type PerformanceSnapshot,
} from "@/lib/performance-snapshot";

type CacheEntry = { analysis: string; t: number };

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const MAX_CACHE_KEYS = 120;
const MIN_ATTEMPTS = 5;
const MAX_BODY_CHARS = 12_000;

function getCached(key: string): string | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.t > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return e.analysis;
}

function setCached(key: string, analysis: string) {
  if (cache.size >= MAX_CACHE_KEYS) {
    const first = cache.keys().next().value as string | undefined;
    if (first) cache.delete(first);
  }
  cache.set(key, { analysis, t: Date.now() });
}

function isValidSnapshot(v: unknown): v is PerformanceSnapshot {
  if (!v || typeof v !== "object") return false;
  const s = v as PerformanceSnapshot;
  return (
    (s.exam === "GATE" || s.exam === "ESE") &&
    !!s.totals &&
    typeof s.totals.attempted === "number" &&
    Array.isArray(s.subjects)
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      snapshot?: unknown;
      cacheKey?: unknown;
    };

    const snapshot = body.snapshot;
    const cacheKey =
      typeof body.cacheKey === "string" ? body.cacheKey.trim().slice(0, 256) : "";

    if (!isValidSnapshot(snapshot)) {
      return NextResponse.json({ error: "Invalid snapshot" }, { status: 400 });
    }

    if (snapshot.totals.attempted < MIN_ATTEMPTS) {
      return NextResponse.json(
        {
          error: `Attempt at least ${MIN_ATTEMPTS} questions to unlock AI analysis.`,
          minAttempts: MIN_ATTEMPTS,
        },
        { status: 422 },
      );
    }

    const payload = JSON.stringify(snapshot);
    if (payload.length > MAX_BODY_CHARS) {
      return NextResponse.json({ error: "Snapshot too large" }, { status: 413 });
    }

    const storeKey = cacheKey || payload.slice(0, 200);
    const cached = getCached(storeKey);
    if (cached) {
      const parsed = parseAiPerformanceAnalysis(cached);
      return NextResponse.json({
        analysis: parsed,
        raw: parsed ? undefined : cached,
        cached: true,
      });
    }

    const raw = await groqChatCompletion(
      [
        {
          role: "system",
          content: `You are an expert coach for Indian civil engineering students preparing for ${snapshot.exam}. Analyze ONLY the statistics JSON provided—do not invent attempts or scores. Reply with a single JSON object (no markdown fences) matching this schema:
{
  "overview": "2-3 sentences on overall readiness",
  "strengths": [{"area": "subject or skill", "detail": "why it is a strength"}],
  "weaknesses": [{"area": "subject or topic", "detail": "what is going wrong"}],
  "prioritySubjects": [{"subject": "name", "reason": "why focus here now"}],
  "topicFocus": [{"topic": "topic name", "action": "concrete next step"}],
  "studyPlan": "short paragraph: weekly focus for the next 7 days"
}
Rules: 2-4 items per array where data supports it; if a subject has 0 attempts, say "not enough data" instead of guessing; prioritize subjects with low accuracy AND meaningful attempt counts; mention recent 7-day trend if available; use clear English; be specific and actionable; max ~600 words total in all string fields.`,
        },
        {
          role: "user",
          content: `Performance data:\n${payload}`,
        },
      ],
      { maxTokens: 1100, temperature: 0.35 },
    );

    setCached(storeKey, raw);
    const analysis = parseAiPerformanceAnalysis(raw);

    return NextResponse.json({
      analysis,
      raw: analysis ? undefined : raw,
      cached: false,
    });
  } catch (e) {
    if (e instanceof GroqNotConfiguredError) {
      return NextResponse.json(
        {
          error:
            "AI analysis is not configured. Set GROQ_API_KEY in .env.local and restart the server.",
        },
        { status: 503 },
      );
    }
    if (e instanceof GroqApiError) {
      return NextResponse.json(
        { error: "AI service error. Try again in a moment." },
        { status: 502 },
      );
    }
    console.error("[performance-analysis]", e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
