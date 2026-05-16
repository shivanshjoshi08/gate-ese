import { NextResponse } from "next/server";
import {
  groqChatCompletion,
  GroqApiError,
  GroqNotConfiguredError,
} from "@/lib/groq-chat";
import { GROQ_CONTEXT_CHAR_LIMIT } from "@/lib/groq-question-context";

type CacheEntry = { summary: string; t: number };

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const MAX_CACHE_KEYS = 400;
const CACHE_PREFIX = "en-v3|";

function getCached(questionId: string): string | null {
  const e = cache.get(CACHE_PREFIX + questionId);
  if (!e) return null;
  if (Date.now() - e.t > CACHE_TTL_MS) {
    cache.delete(CACHE_PREFIX + questionId);
    return null;
  }
  return e.summary;
}

function setCached(questionId: string, summary: string) {
  if (cache.size >= MAX_CACHE_KEYS) {
    const first = cache.keys().next().value as string | undefined;
    if (first) cache.delete(first);
  }
  cache.set(CACHE_PREFIX + questionId, { summary, t: Date.now() });
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

    const cached = getCached(questionId);
    if (cached) {
      return NextResponse.json({ summary: cached, cached: true });
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

    setCached(questionId, summary);
    return NextResponse.json({ summary, cached: false });
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
