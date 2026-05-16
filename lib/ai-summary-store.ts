import { promises as fs } from "fs";
import path from "path";
import { connectMongo } from "@/lib/mongoose";
import { AI_SUMMARY_VERSION } from "@/lib/ai-summary-constants";
import { AiQuestionSummary } from "@/models/AiQuestionSummary";

const FILE_PATH = path.join(process.cwd(), "data", "ai-summaries.json");

type FileStore = {
  version: number;
  summaryVersion: string;
  summaries: Record<string, string>;
};

const EMPTY_FILE_STORE: FileStore = {
  version: 1,
  summaryVersion: AI_SUMMARY_VERSION,
  summaries: {},
};

function fileKey(questionId: string): string {
  return questionId;
}

function canWriteJsonFile(): boolean {
  if (process.env.AI_SUMMARY_FILE_WRITE === "off") return false;
  if (process.env.VERCEL === "1") return false;
  return true;
}

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileStore>;
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.summaryVersion === AI_SUMMARY_VERSION &&
      parsed.summaries &&
      typeof parsed.summaries === "object"
    ) {
      return parsed as FileStore;
    }
  } catch {
    /* create on first write */
  }
  return { ...EMPTY_FILE_STORE };
}

async function getFromFile(questionId: string): Promise<string | null> {
  const store = await readFileStore();
  return store.summaries[fileKey(questionId)] ?? null;
}

async function setToFile(questionId: string, summary: string): Promise<void> {
  if (!canWriteJsonFile()) return;
  const store = await readFileStore();
  store.summaries[fileKey(questionId)] = summary;
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function getFromMongo(questionId: string): Promise<string | null> {
  if (!process.env.MONGODB_URI?.trim()) return null;
  try {
    await connectMongo();
    const doc = (await AiQuestionSummary.findOne({
      questionId,
      summaryVersion: AI_SUMMARY_VERSION,
    })
      .select("summary")
      .lean()) as { summary?: string } | null;
    return doc?.summary ?? null;
  } catch (e) {
    console.error("[ai-summary-store] mongo read", e);
    return null;
  }
}

async function setToMongo(questionId: string, summary: string): Promise<void> {
  if (!process.env.MONGODB_URI?.trim()) return;
  try {
    await connectMongo();
    await AiQuestionSummary.findOneAndUpdate(
      { questionId, summaryVersion: AI_SUMMARY_VERSION },
      { questionId, summaryVersion: AI_SUMMARY_VERSION, summary },
      { upsert: true, new: true },
    );
  } catch (e) {
    console.error("[ai-summary-store] mongo write", e);
  }
}

/** Load a persisted AI recap for this question id, if one exists. */
export async function getAiQuestionSummary(
  questionId: string,
): Promise<string | null> {
  const fromMongo = await getFromMongo(questionId);
  if (fromMongo) return fromMongo;

  return getFromFile(questionId);
}

/** Persist recap so future requests skip Groq. */
export async function saveAiQuestionSummary(
  questionId: string,
  summary: string,
): Promise<void> {
  await Promise.all([
    setToMongo(questionId, summary),
    setToFile(questionId, summary),
  ]);
}
