// @ts-nocheck — next-auth callbacks vs credentials typing
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/lib/mongoose";
import { User } from "@/models/User";

const adminEmail = process.env.ADMIN_EMAIL ?? "";

/** JWT signing; required in production. Dev fallback avoids NO_SECRET when .env is incomplete. */
const authSecret =
  process.env.NEXTAUTH_SECRET?.trim() ||
  (process.env.NODE_ENV !== "production"
    ? "local-dev-nextauth-secret-change-me"
    : undefined);

export const authOptions = {
  providers: [
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim()?.toLowerCase();
        const password = credentials?.password ?? "";
        const expectedEmail = adminEmail.trim().toLowerCase();
        const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
        if (
          !expectedEmail ||
          email !== expectedEmail ||
          password !== expectedPassword
        ) {
          return null;
        }
        return {
          id: "admin",
          email: adminEmail,
          name: "Admin",
          role: "admin",
        };
      },
    }),
    Credentials({
      id: "learner",
      name: "Learner",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || password.length < 1) return null;
        await connectMongo();
        const user = await User.findOne({ email })
          .select("+passwordHash")
          .exec();
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash as string);
        if (!ok) return null;
        return {
          id: String(user._id),
          email: user.email as string,
          name: (user.name as string) || undefined,
          role: "learner",
        };
      },
    }),
  ],
  session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.sub = user.id;
        token.role = user.role ?? (user.id === "admin" ? "admin" : "learner");
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) ?? "";
        session.user.id = (token.sub as string) ?? "";
        session.user.role = (token.role as "admin" | "learner") ?? "learner";
        session.user.name = token.name as string | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: authSecret,
};
