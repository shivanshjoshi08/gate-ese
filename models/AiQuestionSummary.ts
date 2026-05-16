import mongoose, { Schema, models, model } from "mongoose";
import { AI_SUMMARY_VERSION } from "@/lib/ai-summary-constants";

const aiQuestionSummarySchema = new Schema(
  {
    questionId: { type: String, required: true, index: true },
    summaryVersion: { type: String, required: true, default: AI_SUMMARY_VERSION },
    summary: { type: String, required: true },
  },
  { timestamps: true },
);

aiQuestionSummarySchema.index(
  { questionId: 1, summaryVersion: 1 },
  { unique: true },
);

export const AiQuestionSummary =
  models.AiQuestionSummary ??
  model("AiQuestionSummary", aiQuestionSummarySchema);
