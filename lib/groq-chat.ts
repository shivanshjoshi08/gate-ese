export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class GroqNotConfiguredError extends Error {
  constructor() {
    super("GROQ_API_KEY is not configured");
    this.name = "GroqNotConfiguredError";
  }
}

export class GroqApiError extends Error {
  status: number;
  constructor(status: number, message = "AI service error") {
    super(message);
    this.name = "GroqApiError";
    this.status = status;
  }
}

export async function groqChatCompletion(
  messages: GroqMessage[],
  options?: { maxTokens?: number; temperature?: number },
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new GroqNotConfiguredError();

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
      max_tokens: options?.maxTokens ?? 900,
      temperature: options?.temperature ?? 0.4,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[groq]", res.status, errText.slice(0, 500));
    throw new GroqApiError(res.status);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new GroqApiError(502, "Empty AI response");
  return text;
}
