"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  matches: any[];
};

export default function SpecialTipsView({ matches }: Props) {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const [worldChampion, setWorldChampion] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [mostUnfairTeam, setMostUnfairTeam] = useState("");
  const [fairestTeam, setFairestTeam] = useState("");

  const teams = Array.from(
    new Set(
      matches
        .flatMap((m) => [m.home_team || m.homeTeam?.name, m.away_team || m.awayTeam?.name])
        .filter(Boolean)
    )
  ).sort();

  useEffect(() => {
    loadTips();
  }, []);

  async function loadTips() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("special_predictions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
    if (data) {
      setWorldChampion(data.world_champion || "");
      setTopScorer(data.top_scorer || "");
      setMostUnfairTeam(data.most_unfair_team || "");
      setFairestTeam(data.fairest_team || "");
    }

    setLoading(false);
  }

  async function saveTips() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("special_predictions").upsert(
      {
        user_id: user.id,
        world_champion: worldChampion,
        top_scorer: topScorer,
        most_unfair_team: mostUnfairTeam,
        fairest_team: fairestTeam,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  const selectClass =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white";

  if (loading) {
    return <div className="text-slate-400">Spezial Tipps laden...</div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5">
      <h2 className="text-2xl font-black">Spezial Tipps</h2>

      <div>
        <p className="text-sm text-slate-400 mb-2">Weltmeister</p>
        <select
          value={worldChampion}
          onChange={(e) => setWorldChampion(e.target.value)}
          className={selectClass}
        >
          <option value="">Team auswählen</option>
          {teams.map((team: any) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-2">Torschützenkönig</p>
        <input
          value={topScorer}
          onChange={(e) => setTopScorer(e.target.value)}
          placeholder="z.B. Kylian Mbappé"
          className={selectClass}
        />
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-2">Unfairstes Team</p>
        <select
          value={mostUnfairTeam}
          onChange={(e) => setMostUnfairTeam(e.target.value)}
          className={selectClass}
        >
          <option value="">Team auswählen</option>
          {teams.map((team: any) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-2">Fairstes Team</p>
        <select
          value={fairestTeam}
          onChange={(e) => setFairestTeam(e.target.value)}
          className={selectClass}
        >
          <option value="">Team auswählen</option>
          {teams.map((team: any) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={saveTips}
        className="w-full rounded-xl bg-emerald-600 py-3 font-bold hover:bg-emerald-500 transition"
      >
        Spezial Tipps speichern
      </button>

      {saved && (
        <p className="text-center text-sm text-emerald-400">
          ✓ gespeichert
        </p>
      )}
    </div>
  );
}