"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const item = (href: string, label: string) => (
    <Link
      href={href}
      className={`
        shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition
        ${
          pathname === href
            ? "bg-emerald-600 text-white"
            : "bg-slate-900 text-slate-300 hover:bg-slate-800"
        }
      `}
    >
      {label}
    </Link>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 bg-slate-950 border-r border-slate-800 p-6 flex-col min-h-screen">
        <h1 className="text-3xl font-black mb-8 text-white">
          ⚽ WM 2026
        </h1>

        <div className="space-y-3">
          {item("/dashboard", "🏠 Dashboard")}
          {item("/matches", "⚽ Spiele")}
          {item("/leaderboard", "🏆 Rangliste")}
        </div>
      </aside>

      {/* MOBILE SWIPE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto px-3 py-3 scrollbar-hide">
          {item("/dashboard", "🏠 Dashboard")}
          {item("/matches", "⚽ Spiele")}
          {item("/leaderboard", "🏆 Rangliste")}
        </div>
      </nav>
    </>
  );
}