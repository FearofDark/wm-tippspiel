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

  return (
    <div className="p-6 text-white space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold">🏆 Leaderboard</h1>
        <p className="text-slate-400">
          WM 2026 Tippspiel Rangliste
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">

        {/* HEADER ROW */}
        <div className="grid grid-cols-3 p-4 text-slate-400 border-b border-slate-800">
          <span>Platz</span>
          <span>User</span>
          <span className="text-right">Punkte</span>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="p-6 text-slate-400">Lade...</div>
        ) : (
          users.map((u, index) => (
            <div
              key={u.id}
              className="grid grid-cols-3 p-4 border-b border-slate-800"
            >
              <span className="font-bold">#{index + 1}</span>

              <span>{u.username}</span>

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