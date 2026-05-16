import { connectMongo } from "@/lib/mongoose";
import { Attempt } from "@/backend/models/Attempt";
import { Bookmark } from "@/backend/models/Bookmark";
import mongoose from "mongoose";

export async function recordAttempt(input: {
  userId: string;
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timeTaken?: number;
}) {
  await connectMongo();
  if (!mongoose.Types.ObjectId.isValid(input.questionId)) {
    throw new Error("Invalid questionId");
  }
  return Attempt.create({
    userId: input.userId,
    questionId: input.questionId,
    selectedOption: input.selectedOption,
    isCorrect: input.isCorrect,
    timeTaken: input.timeTaken ?? 0,
    attemptedAt: new Date(),
  });
}

export async function listAttempts(userId: string, page = 1, limit = 50) {
  await connectMongo();
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Attempt.find({ userId })
      .sort({ attemptedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attempt.countDocuments({ userId }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function addBookmark(userId: string, questionId: string) {
  await connectMongo();
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw new Error("Invalid questionId");
  }
  try {
    await Bookmark.create({ userId, questionId });
    return { created: true };
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 11000) {
      return { created: false };
    }
    throw e;
  }
}

export async function removeBookmark(userId: string, questionId: string) {
  await connectMongo();
  const res = await Bookmark.deleteOne({ userId, questionId });
  return res.deletedCount === 1;
}

export async function listBookmarks(userId: string) {
  await connectMongo();
  return Bookmark.find({ userId }).sort({ createdAt: -1 }).lean();
}
