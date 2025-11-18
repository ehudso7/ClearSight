import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-neo-turquoise/10 border border-neo-turquoise/40 flex items-center justify-center">
            <span className="text-neo-turquoise text-xl font-bold">C</span>
          </div>
          <span className="font-semibold text-lg text-slate-50">ClearSight Ops</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm text-slate-200">
          <a href="#features" className="hover:text-neo-turquoise transition">Features</a>
          <a href="#pricing" className="hover:text-neo-turquoise transition">Pricing</a>
          <a href="#integrations" className="hover:text-neo-turquoise transition">Integrations</a>
        </nav>
        <Link
          href="/demo"
          className="text-sm font-medium px-4 py-2 rounded-full bg-neo-turquoise text-slate-950 hover:bg-neo-turquoise/90 transition"
        >
          Get Free Ops Audit
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-neo-turquoise/90 mb-4">
              AI OPERATIONS MANAGER
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-slate-50 mb-4 leading-tight">
              Operations. Automated. Perfected.
            </h1>
            <p className="text-base md:text-lg text-slate-300 mb-6 leading-relaxed">
              AI that monitors, analyzes, and optimizes your business 24/7 — replacing dozens of
              manual tasks with a single intelligent system.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/demo"
                className="px-5 py-2.5 rounded-full bg-neo-turquoise text-slate-950 text-sm font-medium hover:bg-neo-turquoise/90 transition"
              >
                Get a Free Ops Audit
              </Link>
              <a
                href="#sample-report"
                className="px-5 py-2.5 rounded-full border border-slate-600 text-slate-200 text-sm hover:border-neo-turquoise hover:text-neo-turquoise transition"
              >
                View Sample Report
              </a>
            </div>
            <p className="text-xs text-slate-400">
              Save 10–40 hours of manual ops work per week. Catch problems before they cost you money.
            </p>
          </div>

          {/* Sample Report Preview */}
          <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5 shadow-xl">
            <p className="text-xs font-semibold text-neo-turquoise mb-2">
              Daily Ops Snapshot • 7:00 AM
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Sales</span>
                <span className="font-mono text-neo-turquoise">$14,329 (+7%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Orders</span>
                <span className="font-mono text-slate-100">421</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Pick Accuracy</span>
                <span className="font-mono text-emerald-300">98.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Overtime</span>
                <span className="font-mono text-amber-300">3.2 hrs (flagged)</span>
              </div>
              <div className="mt-4 rounded-xl bg-slate-950/60 border border-slate-700 p-3">
                <p className="text-xs font-semibold text-slate-200 mb-2">Top Actions Today</p>
                <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                  <li>Assign QC to review SKU-113 bin (refund spike)</li>
                  <li>Shift 1 picker to Pack Line 2 from 2–4 PM</li>
                  <li>Temporarily freeze overtime until Friday</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What ClearSight Ops Does */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-50 mb-4">
            Your AI Operations Manager
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Built to watch, analyze, and run your daily operations — so you don't have to.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "📊", title: "Daily Reports", desc: "Automated performance reports with KPIs, trends, and forecasts" },
            { icon: "🚨", title: "Instant Alerts", desc: "Real-time notifications when issues are detected" },
            { icon: "💡", title: "Smart Recommendations", desc: "AI-generated action items prioritized by impact" },
            { icon: "📈", title: "KPI Tracking", desc: "Monitor sales, inventory, staffing, and more" },
            { icon: "👥", title: "Staff Optimization", desc: "Scheduling insights and overtime alerts" },
            { icon: "📝", title: "Auto SOPs", desc: "Generates checklists, workflows, and protocols" },
          ].map((feature, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-neo-turquoise/50 transition">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-50 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-50 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-slate-300">No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Starter",
              price: "$1,500",
              desc: "For small businesses",
              features: [
                "Daily performance reports",
                "KPI tracking",
                "Issue detection",
                "Weekly summaries",
                "Email delivery",
              ]
            },
            {
              name: "Pro",
              price: "$3,500 - $7,000",
              desc: "For growing teams",
              features: [
                "Everything in Starter",
                "Live dashboard",
                "Team optimization",
                "Slack integration",
                "Custom KPIs",
                "SOP library",
              ],
              featured: true
            },
            {
              name: "Enterprise",
              price: "$10,000+",
              desc: "For large operations",
              features: [
                "Everything in Pro",
                "Multi-location",
                "Custom integrations",
                "Dedicated support",
                "Quarterly audits",
              ]
            },
          ].map((plan, i) => (
            <div key={i} className={`rounded-xl p-6 ${plan.featured ? 'bg-neo-turquoise/10 border-2 border-neo-turquoise' : 'bg-slate-900/50 border border-slate-700'}`}>
              <h3 className="text-xl font-semibold text-slate-50 mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-neo-turquoise mb-2">{plan.price}</div>
              <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-neo-turquoise mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/demo"
                className={`block text-center py-2.5 rounded-full text-sm font-medium transition ${
                  plan.featured
                    ? 'bg-neo-turquoise text-slate-950 hover:bg-neo-turquoise/90'
                    : 'border border-slate-600 text-slate-200 hover:border-neo-turquoise'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-50 mb-4">Connects to Your Stack</h2>
          <p className="text-lg text-slate-300">Plug into the tools you already use</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-slate-400">
          {["Shopify", "ShipStation", "Stripe", "Square", "QuickBooks", "Suma", "Gmail", "Slack", "Notion", "Google Sheets"].map((int, i) => (
            <div key={i} className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm">
              {int}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="sample-report" className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-neo-turquoise/20 to-dark-teal/20 border border-neo-turquoise/30 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-semibold text-slate-50 mb-4">
            Ready to See Your Business in Action?
          </h2>
          <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
            Get a free sample daily report for your business within 24 hours.
          </p>
          <Link
            href="/demo"
            className="inline-block px-6 py-3 rounded-full bg-neo-turquoise text-slate-950 text-base font-medium hover:bg-neo-turquoise/90 transition"
          >
            Start Your Free Ops Audit
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-neo-turquoise/10 border border-neo-turquoise/40 flex items-center justify-center">
              <span className="text-neo-turquoise text-xs font-bold">C</span>
            </div>
            <span>ClearSight Ops © 2025</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neo-turquoise transition">Privacy</a>
            <a href="#" className="hover:text-neo-turquoise transition">Terms</a>
            <a href="#" className="hover:text-neo-turquoise transition">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
