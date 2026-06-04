"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  points: number;
};

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, points")
          .order("points", { ascending: false });

        if (error) {
          console.error("Leaderboard error:", error);
          return;
        }

        setUsers(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pb-0">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:p-6 space-y-5">
        <div>
        </div>

        {!loading && users.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {users.slice(0, 3).map((u, i) => (
              <div
                key={u.id}
                className={`rounded-2xl border p-3 sm:p-5 text-center shadow-xl ${
                  i === 0
                    ? "bg-yellow-500/10 border-yellow-500/40"
                    : i === 1
                    ? "bg-slate-400/10 border-slate-400/40"
                    : "bg-orange-500/10 border-orange-500/40"
                }`}
              >
                <div className="text-2xl sm:text-4xl">{getMedal(i)}</div>

                <div className="mt-2 truncate text-sm sm:text-lg font-black">
                  {u.username}
                </div>

                <div className="mt-1 text-xs sm:text-sm font-bold text-yellow-300">
                  {u.points ?? 0} Punkte
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="grid grid-cols-[70px_1fr_90px] sm:grid-cols-[90px_1fr_120px] p-4 text-xs sm:text-sm text-slate-400 border-b border-slate-800">
            <span>Platz</span>
            <span>User</span>
            <span className="text-right">Punkte</span>
          </div>

          {loading ? (
            <div className="p-6 text-slate-400 animate-pulse">
              Lade Leaderboard...
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-slate-400">
              Noch keine Daten vorhanden
            </div>
          ) : (
            users.map((u, index) => (
              <div
                key={u.id}
                className="grid grid-cols-[70px_1fr_90px] sm:grid-cols-[90px_1fr_120px] items-center p-4 border-b border-slate-800 hover:bg-slate-800/40 transition"
              >
                <span className="font-black text-slate-300">
                  {getMedal(index)}
                </span>

                <span className="min-w-0 truncate font-semibold">
                  {u.username}
                </span>

                <span className="text-right font-black text-yellow-300">
                  {u.points ?? 0}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}