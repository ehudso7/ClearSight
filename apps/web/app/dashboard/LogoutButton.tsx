"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:border-red-500 hover:text-red-400 transition"
    >
      Sign Out
    </button>
  );
}
