import mongoose, { Schema, models, model } from "mongoose";

const attemptSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    selectedOption: { type: String, default: "" },
    isCorrect: { type: Boolean, required: true },
    timeTaken: { type: Number, default: 0 },
    attemptedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

attemptSchema.index({ userId: 1, questionId: 1 });

export const Attempt =
  models.Attempt ?? model("Attempt", attemptSchema);
