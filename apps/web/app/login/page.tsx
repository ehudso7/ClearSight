"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Success - redirect
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-neo-turquoise/10 border border-neo-turquoise/40 flex items-center justify-center">
            <span className="text-neo-turquoise text-2xl font-bold">C</span>
          </div>
          <span className="font-semibold text-2xl text-slate-50">ClearSight Ops</span>
        </Link>

        {/* Login Card */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-slate-50 mb-2">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-6">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neo-turquoise focus:border-transparent"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neo-turquoise focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-neo-turquoise text-slate-950 font-medium hover:bg-neo-turquoise/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-neo-turquoise hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-neo-turquoise transition"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
