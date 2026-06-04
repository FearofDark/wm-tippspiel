"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const desktopItem = (href: string, label: string) => (
    <Link
      href={href}
      className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
        pathname === href
          ? "bg-emerald-600 text-white"
          : "bg-slate-900 text-slate-300 hover:bg-slate-800"
      }`}
    >
      {label}
    </Link>
  );

  const mobileItem = (href: string, icon: string, label: string) => (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center
        rounded-2xl py-2 text-[11px] font-bold transition
        ${
          pathname === href
            ? "bg-emerald-600 text-white"
            : "bg-slate-900 text-slate-300"
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      {/* DESKTOP */}
      <aside
        className="
          hidden md:flex
          fixed left-0 top-0
          h-screen w-72
          bg-slate-950
          border-r border-slate-800
          p-6 flex-col
          z-40
        "
      >
        <h1 className="text-3xl font-black mb-8 text-white">
           World Cup 2026
        </h1>

        <div className="space-y-3">
          {desktopItem("/dashboard", "🏠 Dashboard")}
          {desktopItem("/matches", "⚽ Spiele")}
          {desktopItem("/leaderboard", "🏆 Rangliste")}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav
        className="
          md:hidden
          fixed bottom-0 left-0 right-0
          z-50
          border-t border-slate-800
          bg-slate-950/95
          backdrop-blur
          px-3 py-3
        "
      >
        <div className="grid grid-cols-3 gap-2">
          {mobileItem("/dashboard", "🏠", "Dashboard")}
          {mobileItem("/matches", "⚽", "Spiele")}
          {mobileItem("/leaderboard", "🏆", "Ranking")}
        </div>
      </nav>
    </>
  );
}