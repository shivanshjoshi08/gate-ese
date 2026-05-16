"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("admin", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-sm pt-24 text-zinc-100">
      <h1 className="text-xl font-bold">Admin sign in</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Use the email set in <code className="rounded bg-zinc-800 px-1 text-xs text-zinc-300">ADMIN_EMAIL</code>
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-500"
          autoComplete="username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-500"
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-100 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
