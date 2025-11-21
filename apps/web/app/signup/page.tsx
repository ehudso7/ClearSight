"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          contact_name: contactName,
          role: 'client', // Default role
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Failed to create account. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Create client record (using service role via API)
    // Note: In production, this should be done via a server action or API route
    // For now, we'll show success and let admin create the client record
    
    setSuccess(true);
    setLoading(false);

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login?message=Account created successfully');
    }, 2000);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-50 mb-2">Account created!</h2>
            <p className="text-slate-400 mb-6">
              Please check your email to verify your account, then sign in.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-lg bg-neo-turquoise text-slate-950 font-medium hover:bg-neo-turquoise/90 transition"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-neo-turquoise/10 border border-neo-turquoise/40 flex items-center justify-center">
            <span className="text-neo-turquoise text-2xl font-bold">C</span>
          </div>
          <span className="font-semibold text-2xl text-slate-50">ClearSight Ops</span>
        </Link>

        {/* Signup Card */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-slate-50 mb-2">Create your account</h1>
          <p className="text-sm text-slate-400 mb-6">
            Start automating your operations today
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-2">
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neo-turquoise focus:border-transparent"
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-slate-300 mb-2">
                Your Name
              </label>
              <input
                id="contactName"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neo-turquoise focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

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
                minLength={8}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neo-turquoise focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-neo-turquoise text-slate-950 font-medium hover:bg-neo-turquoise/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-neo-turquoise hover:underline">
                Sign in
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
