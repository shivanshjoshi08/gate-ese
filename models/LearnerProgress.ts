import mongoose, { Schema, models, model } from "mongoose";

/**
 * Holds anonymised learner progress blobs (Slots: ESE / GATE) keyed by stable publicId.
 */
const learnerProgressSchema = new Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slots: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

export const LearnerProgress =
  models.LearnerProgress ?? model("LearnerProgress", learnerProgressSchema);
