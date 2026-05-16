import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectMongo } from "@/lib/mongoose";
import { User } from "@/models/User";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(128),
  name: z.string().trim().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const json = (await req.json()) as unknown;
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password (min 8 characters)." },
        { status: 400 },
      );
    }
    const { email, password, name } = parsed.data;
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (adminEmail && email.toLowerCase() === adminEmail) {
      return NextResponse.json(
        { error: "This email is reserved for admin." },
        { status: 400 },
      );
    }

    await connectMongo();
    const exists = await User.findOne({ email: email.toLowerCase() })
      .lean()
      .exec();
    if (exists) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 11);
    await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name ?? "",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Registration failed." }, { status: 503 });
  }
}
