"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";



export default function Sidebar() {
  const pathname = usePathname();

  const router = useRouter();

async function logout() {
  await fetch("/api/logout", {
    method: "POST",
  });

  router.push("/login");
}

  const item = (href: string, label: string) => (
    <Link
      href={href}
      className={`block p-3 rounded-xl transition ${
        pathname === href
          ? "bg-emerald-600 text-white"
          : "bg-slate-900 hover:bg-slate-800"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 p-6 flex flex-col">
      <h1 className="text-3xl font-bold mb-8 text-white">
        ⚽ WM 2026
      </h1>

      <div className="space-y-3">
        {item("/dashboard", "🏠 Dashboard")}
        {item("/matches", "⚽ Spiele")}
        {item("/leaderboard", "🏆 Rangliste")}

      </div>

      <div className="mt-auto">

      </div>
    </aside>
  );
}