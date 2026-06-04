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

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState<number | null>(null);

  const [nextMatch, setNextMatch] = useState<any>(null);
  const [countdown, setCountdown] = useState("");

  // LIVE COUNTDOWN UPDATE
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextMatch?.utcDate) {
        setCountdown(getCountdown(nextMatch.utcDate));
      }
    }, 60000); // jede Minute reicht (ruhiger)

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

        // POINTS
        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", user.id)
          .single();

        setPoints(profile?.points || 0);

        // RANK
        const { data: allUsers } = await supabase
          .from("profiles")
          .select("id, points")
          .order("points", { ascending: false });

        if (allUsers) {
          const position =
            allUsers.findIndex((u) => u.id === user.id) + 1;

          setRank(position);
        }

        // MATCHES
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

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-4xl font-bold">WM 2026 Dashboard</h1>
          <p className="text-slate-400">
            Tippspiel Übersicht
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 px-3 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 gap-4">

        <div className="bg-slate-900 p-5 rounded-xl">
          <p className="text-slate-400">Punkte</p>
          <h2 className="text-3xl font-bold">{points}</h2>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl">
          <p className="text-slate-400">Platzierung</p>
          <h2 className="text-3xl font-bold">{rank ?? "-"}</h2>
        </div>
      </div>

      {/* NEXT MATCH */}
      <div className="bg-slate-900 p-6 rounded-xl space-y-4">

        <p className="text-slate-400">Nächstes Spiel</p>

        {nextMatch ? (
          <>
            {/* TEAMS + FLAGS */}
            <div className="flex items-center gap-4">

              <img
                src={nextMatch.homeTeam.crest}
                className="w-10 h-10"
              />

              <span className="text-xl font-bold">
                {nextMatch.homeTeam.name}
              </span>

              <span className="text-slate-400">vs</span>

              <span className="text-xl font-bold">
                {nextMatch.awayTeam.name}
              </span>

              <img
                src={nextMatch.awayTeam.crest}
                className="w-10 h-10"
              />
            </div>

            {/* CLEAN COUNTDOWN */}
            <div className="text-3xl font-bold text-yellow-400">
              ⏳ {countdown}
            </div>
          </>
        ) : (
          <p className="text-slate-400">Kein Spiel gefunden</p>
        )}
      </div>
    </div>
  );
}