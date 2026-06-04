"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function getCountdown(targetDate: string) {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return "ANGESTOßEN";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return `${days}d ${hours}h ${minutes}m`;
}

function formatRank(rank: number | null) {
  if (!rank) return "-";
  return `${rank}.`;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextMatch?.utcDate) {
        setCountdown(getCountdown(nextMatch.utcDate));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [nextMatch]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.replace("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", user.id)
          .single();

        setPoints(profile?.points || 0);

        const { data: allUsers } = await supabase
          .from("profiles")
          .select("id, points")
          .order("points", { ascending: false });

        if (allUsers) {
          const position =
            allUsers.findIndex((u) => u.id === user.id) + 1;

          setRank(position > 0 ? position : null);
        }

        const res = await fetch("/api/matches");
        const data = await res.json();

        const matches = data?.matches || [];
        const now = new Date();

        const future = matches
          .filter((m: any) => new Date(m.utcDate) > now)
          .sort(
            (a: any, b: any) =>
              new Date(a.utcDate).getTime() -
              new Date(b.utcDate).getTime()
          );

        if (future.length > 0) {
          const next = future[0];
          setNextMatch(next);
          setCountdown(getCountdown(next.utcDate));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-slate-400">Dashboard lädt...</div>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-slate-950 text-white">
    <div className="mx-auto max-w-6xl px-3 py-4 sm:p-6 space-y-5">

      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300 mb-3">
            WM 2026 Tippspiel
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Dashboard
          </h1>

          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Punkte, Platzierung und nächstes Spiel.
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full sm:w-fit rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition"
        >
          Logout
        </button>
      </div>

      {/* POINTS + RANK */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-xl">
          <p className="text-xs sm:text-sm text-slate-400">Punkte</p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-black">
            {points}
          </h2>
          <p className="text-xs text-slate-500 mt-1">gesamt</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-xl">
          <p className="text-xs sm:text-sm text-slate-400">Platzierung</p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-black">
            {formatRank(rank)}
          </h2>
          <p className="text-xs text-slate-500 mt-1">im Ranking</p>
        </div>
      </div>

      {/* NEXT MATCH */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-800 p-4 sm:p-5">
          <p className="text-sm text-slate-400">Nächstes Spiel</p>
        </div>

        {nextMatch ? (
          <div className="p-4 sm:p-8 space-y-6">

            {/* MOBILE MATCH LAYOUT */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-6">
              <div className="flex flex-col items-center text-center gap-2 min-w-0">
                {nextMatch.homeTeam?.crest && (
                  <img
                    src={nextMatch.homeTeam.crest}
                    alt=""
                    className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                  />
                )}

                <h2 className="text-sm sm:text-2xl font-black leading-tight break-words">
                  {nextMatch.homeTeam?.name}
                </h2>
              </div>

              <div className="pt-5 sm:pt-7">
                <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm font-bold text-slate-300">
                  VS
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-2 min-w-0">
                {nextMatch.awayTeam?.crest && (
                  <img
                    src={nextMatch.awayTeam.crest}
                    alt=""
                    className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                  />
                )}

                <h2 className="text-sm sm:text-2xl font-black leading-tight break-words">
                  {nextMatch.awayTeam?.name}
                </h2>
              </div>
            </div>

            {/* COUNTDOWN */}
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 sm:p-5 text-center">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-yellow-300/80">
                Anstoß in
              </p>

              <div className="mt-2 text-3xl sm:text-5xl font-black text-yellow-300">
                {countdown}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-slate-400">
            Kein Spiel gefunden
          </div>
        )}
      </div>
    </div>
  </div>
);
}