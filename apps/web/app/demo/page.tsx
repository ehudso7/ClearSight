"use client";

import { useState } from "react";
import Link from "next/link";

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runDemo() {
    setLoading(true);
    setError(null);
    setReport(null);

    const today = new Date().toISOString().slice(0, 10);

    try {
      const res = await fetch("/api/generate-daily-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: "demo-client", date: today })
      });

      const data = await res.json();
      setLoading(false);

      if (!data.ok) {
        setError(data.error || "Unknown error");
        return;
      }
      setReport(data.markdown);
    } catch (e: any) {
      setLoading(false);
      setError(e.message || "Network error");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="h-9 w-9 rounded-xl bg-neo-turquoise/10 border border-neo-turquoise/40 flex items-center justify-center">
            <span className="text-neo-turquoise text-xl font-bold">C</span>
          </div>
          <span className="font-semibold text-lg text-slate-50">ClearSight Ops</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-slate-300 hover:text-neo-turquoise transition"
        >
          ← Back to Home
        </Link>
      </header>

      {/* Demo Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-slate-50 mb-3">
            Live Demo – Daily Ops Report
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Click the button below to generate a simulated daily report using demo data.
            In production, this same flow runs every morning on your clients' real data.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={runDemo}
              disabled={loading}
              className="px-8 py-3 rounded-full bg-neo-turquoise text-slate-950 text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-neo-turquoise/90 transition"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Report...
                </span>
              ) : (
                "Generate Demo Report"
              )}
            </button>

            {loading && (
              <div className="text-sm text-slate-400 space-y-1">
                <p>→ Pulling operational data...</p>
                <p>→ Analyzing KPIs...</p>
                <p>→ Detecting issues...</p>
                <p>→ Generating recommendations...</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-5 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">
              <strong>Error:</strong> {error}
            </p>
            <p className="text-xs text-red-300 mt-2">
              Make sure OPENAI_API_KEY is set in your environment variables.
            </p>
          </div>
        )}

        {report && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-50">Generated Report</h2>
              <button
                onClick={() => navigator.clipboard.writeText(report)}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:border-neo-turquoise hover:text-neo-turquoise transition"
              >
                Copy to Clipboard
              </button>
            </div>

            <article className="p-6 rounded-2xl bg-slate-900/70 border border-slate-700">
              <pre className="whitespace-pre-wrap text-sm font-mono text-slate-100 leading-relaxed">
                {report}
              </pre>
            </article>

            <div className="bg-neo-turquoise/10 border border-neo-turquoise/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-neo-turquoise mb-2">
                What Happens in Production
              </h3>
              <ul className="text-sm text-slate-300 space-y-1.5">
                <li>• This report is generated automatically at 6:00 AM daily</li>
                <li>• Sent via email to your team</li>
                <li>• Posted to your Slack #ops channel</li>
                <li>• Saved to your dashboard for review</li>
                <li>• Critical issues trigger immediate alerts</li>
              </ul>
            </div>
          </div>
        )}

        {!report && !loading && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 mb-4">
              <svg className="w-8 h-8 text-neo-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-400">Click the button above to generate your first report</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-neo-turquoise/20 to-dark-teal/20 border border-neo-turquoise/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-50 mb-3">
            Ready to Automate Your Operations?
          </h2>
          <p className="text-slate-300 mb-6">
            Get started with ClearSight Ops and receive daily insights like this for your business.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-neo-turquoise text-slate-950 text-sm font-medium hover:bg-neo-turquoise/90 transition"
            >
              View Pricing
            </Link>
            <a
              href="mailto:contact@clearsightops.com"
              className="px-6 py-2.5 rounded-full border border-slate-600 text-slate-200 text-sm hover:border-neo-turquoise hover:text-neo-turquoise transition"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
