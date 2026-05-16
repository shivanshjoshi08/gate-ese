import mongoose, { Schema, models, model } from "mongoose";

/** Per-user persisted practice progress (exam slot mirrors local ProgressData). */
const userProgressSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    exam: { type: String, required: true, enum: ["ESE", "GATE"] },
    snapshot: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

userProgressSchema.index({ userId: 1, exam: 1 }, { unique: true });

export const UserProgress =
  models.UserProgress ?? model("UserProgress", userProgressSchema);
