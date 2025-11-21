import { requireAuth, isAdmin } from '@/lib/auth';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const admin = await isAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="h-9 w-9 rounded-xl bg-neo-turquoise/10 border border-neo-turquoise/40 flex items-center justify-center">
                <span className="text-neo-turquoise text-xl font-bold">C</span>
              </div>
              <span className="font-semibold text-lg text-slate-50">ClearSight Ops</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-sm text-slate-300 hover:text-neo-turquoise transition"
              >
                Reports
              </Link>
              <Link 
                href="/dashboard/uploads" 
                className="text-sm text-slate-300 hover:text-neo-turquoise transition"
              >
                Upload Data
              </Link>
              <Link 
                href="/dashboard/issues" 
                className="text-sm text-slate-300 hover:text-neo-turquoise transition"
              >
                Issues
              </Link>
              <Link 
                href="/dashboard/actions" 
                className="text-sm text-slate-300 hover:text-neo-turquoise transition"
              >
                Actions
              </Link>
              {admin && (
                <Link 
                  href="/admin" 
                  className="text-sm text-amber-400 hover:text-amber-300 transition font-medium"
                >
                  Admin
                </Link>
              )}
              
              {/* User Menu */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-700">
                <div className="text-right">
                  <p className="text-sm text-slate-300">{user.email}</p>
                  {admin && (
                    <p className="text-xs text-amber-400">Admin</p>
                  )}
                </div>
                <LogoutButton />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
