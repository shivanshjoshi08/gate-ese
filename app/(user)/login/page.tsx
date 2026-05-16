"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { EXAM_COLORS } from "@/lib/exam";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl")?.trim() || "/practice?bank=ai";
  const accent = EXAM_COLORS.ESE;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await signIn("learner", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 text-study-ink">
      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-study-muted">
        Practice progress is tied to your account and saves to MongoDB when
        configured.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-study-muted">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-study-border bg-study-raised px-4 py-2.5 text-study-ink"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-study-muted">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-study-border bg-study-raised px-4 py-2.5 text-study-ink"
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="text-sm text-amber-400/95">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl py-3 font-semibold text-white shadow-md shadow-black/15 transition hover:brightness-105 disabled:opacity-50"
          style={{ backgroundColor: accent.accent }}
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-study-muted">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-study-soft underline-offset-2 hover:underline"
        >
          Register
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link href="/" className="text-sm text-study-muted hover:text-study-soft">
          ← Home
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-study-muted">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
