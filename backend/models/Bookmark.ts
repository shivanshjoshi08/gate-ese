import mongoose, { Schema, models, model } from "mongoose";

const bookmarkSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const Bookmark =
  models.Bookmark ?? model("Bookmark", bookmarkSchema);
