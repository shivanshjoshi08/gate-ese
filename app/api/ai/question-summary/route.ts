import { NextResponse } from "next/server";
import {
  getAiQuestionSummary,
  saveAiQuestionSummary,
} from "@/lib/ai-summary-store";
import {
  groqChatCompletion,
  GroqApiError,
  GroqNotConfiguredError,
} from "@/lib/groq-chat";
import { GROQ_CONTEXT_CHAR_LIMIT } from "@/lib/groq-question-context";

type CacheEntry = { summary: string; t: number };

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const MAX_CACHE_KEYS = 400;

function getMemoryCached(questionId: string): string | null {
  const e = memoryCache.get(questionId);
  if (!e) return null;
  if (Date.now() - e.t > CACHE_TTL_MS) {
    memoryCache.delete(questionId);
    return null;
  }
  return e.summary;
}

function setMemoryCached(questionId: string, summary: string) {
  if (memoryCache.size >= MAX_CACHE_KEYS) {
    const first = memoryCache.keys().next().value as string | undefined;
    if (first) memoryCache.delete(first);
  }
  memoryCache.set(questionId, { summary, t: Date.now() });
}

async function loadStoredSummary(questionId: string): Promise<string | null> {
  const memory = getMemoryCached(questionId);
  if (memory) return memory;

  const persisted = await getAiQuestionSummary(questionId);
  if (persisted) setMemoryCached(questionId, persisted);
  return persisted;
}

export async function GET(req: Request) {
  const questionId =
    new URL(req.url).searchParams.get("questionId")?.trim().slice(0, 128) ??
    "";

  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }

  const summary = await loadStoredSummary(questionId);
  if (!summary) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  return NextResponse.json({ summary, cached: true, source: "store" });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      questionId?: unknown;
      context?: unknown;
    };

    const questionId =
      typeof body.questionId === "string" ? body.questionId.trim().slice(0, 128) : "";
    const context =
      typeof body.context === "string" ? body.context.trim() : "";

    if (!questionId || !context) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (context.length > GROQ_CONTEXT_CHAR_LIMIT) {
      return NextResponse.json({ error: "Context too long" }, { status: 413 });
    }

    const stored = await loadStoredSummary(questionId);
    if (stored) {
      return NextResponse.json({ summary: stored, cached: true, source: "store" });
    }

    const summary = await groqChatCompletion(
      [
        {
          role: "system",
          content:
            "You help civil engineering students preparing for GATE and ESE. Using only the material in the user's message (stem, options, solution, referenced correct answer), write a brief recap of 2–4 short sentences total (about 120 words maximum). Mention the core concept or formula being tested and the reasoning that leads to the correct answer. Output must be entirely in clear technical English (Latin script only): no Hindi, no Hinglish, no other languages—even if the question text is in Hindi or bilingual, explain in English. Do not invent numbers, constants, or options that are absent from the text. No markdown, no headings, no lead-in like \"Here is\".",
        },
        {
          role: "user",
          content: `Question pack (content may be bilingual; your reply must be English only):\n\n${context}`,
        },
      ],
      { maxTokens: 360, temperature: 0.35 },
    );

    setMemoryCached(questionId, summary);
    await saveAiQuestionSummary(questionId, summary);

    return NextResponse.json({ summary, cached: false, source: "ai" });
  } catch (e) {
    if (e instanceof GroqNotConfiguredError) {
      return NextResponse.json(
        {
          error:
            "AI summary is not configured. Set GROQ_API_KEY in .env.local and restart the dev server.",
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
    console.error("[question-summary]", e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
