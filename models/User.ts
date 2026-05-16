import mongoose, { Schema, models, model } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, default: "" },
  },
  { timestamps: true },
);

export const User = models.User ?? model("User", userSchema);
