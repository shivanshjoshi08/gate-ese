"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EXAM_COLORS } from "@/lib/exam";

export default function RegisterPage() {
  const router = useRouter();
  const accent = EXAM_COLORS.ESE;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      const sign = await signIn("learner", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (sign?.error) {
        setError("Account created — sign in manually.");
        router.push("/login");
        return;
      }
      router.push("/practice?bank=ai");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 text-study-ink">
      <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-study-muted">
        Password at least 8 characters. Used for Practice progress tracking.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-study-muted">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-study-border bg-study-raised px-4 py-2.5 text-study-ink"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-study-muted">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-study-border bg-study-raised px-4 py-2.5 text-study-ink"
            autoComplete="email"
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
            autoComplete="new-password"
            minLength={8}
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
          {pending ? "Creating…" : "Register"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-study-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-study-soft underline-offset-2 hover:underline"
        >
          Sign in
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
