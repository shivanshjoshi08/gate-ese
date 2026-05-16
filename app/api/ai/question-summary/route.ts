import { NextResponse } from "next/server";
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

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "AI summary is not configured. Set GROQ_API_KEY in .env.local and restart the dev server.",
        },
        { status: 503 },
      );
    }

    const model =
      process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 360,
        temperature: 0.35,
        messages: [
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
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[groq]", res.status, errText.slice(0, 500));
      return NextResponse.json(
        { error: "AI service error. Try again in a moment." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const summary = (data.choices?.[0]?.message?.content ?? "").trim();
    if (!summary) {
      return NextResponse.json(
        { error: "Empty AI response." },
        { status: 502 },
      );
    }

    setCached(questionId, summary);
    return NextResponse.json({ summary, cached: false });
  } catch (e) {
    console.error("[question-summary]", e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
