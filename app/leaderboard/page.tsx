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
    return `#${index + 1}`;
  };

  return (
    <div className="p-6 text-white space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold">🏆 Leaderboard</h1>
        <p className="text-slate-400">
          WM 2026 Tippspiel Ranglisteeeeeee
        </p>
      </div>

      {/* PODIUM */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-3 gap-3">

          {users.slice(0, 3).map((u, i) => (
            <div
              key={u.id}
              className={`
                p-4 rounded-xl border text-center
                ${
                  i === 0
                    ? "bg-yellow-500/10 border-yellow-500"
                    : i === 1
                    ? "bg-slate-400/10 border-slate-400"
                    : "bg-orange-500/10 border-orange-500"
                }
              `}
            >
              <div className="text-2xl">{getMedal(i)}</div>
              <div className="font-bold mt-2">{u.username}</div>
              <div className="text-yellow-400 font-bold">
                {u.points ?? 0} Punkte
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-3 p-4 text-slate-400 border-b border-slate-800">
          <span>Platz</span>
          <span>User</span>
          <span className="text-right">Punkte</span>
        </div>

        {/* CONTENT */}
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
              className={`grid grid-cols-3 p-4 border-b border-slate-800 hover:bg-slate-800/40 transition`}
            >
              <span className="font-bold text-slate-300">
                {getMedal(index)}
              </span>

              <span className="font-medium">
                {u.username}
              </span>

              <span className="text-right font-bold text-yellow-400">
                {u.points ?? 0}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}