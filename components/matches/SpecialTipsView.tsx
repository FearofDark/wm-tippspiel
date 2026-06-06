"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  matches: any[];
};

export default function SpecialTipsView({ matches }: Props) {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const didLoad = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [worldChampion, setWorldChampion] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [mostUnfairTeam, setMostUnfairTeam] = useState("");
  const [fairestTeam, setFairestTeam] = useState("");

  const teams = Array.from(
    new Set(
      matches
        .flatMap((m) => [
          m.home_team || m.homeTeam?.name,
          m.away_team || m.awayTeam?.name,
        ])
        .filter(Boolean)
    )
  ).sort();

  const firstWorldCupMatch = matches
    .map((m) => m.utc_date || m.utcDate)
    .filter(Boolean)
    .sort()[0];

  const specialLocked =
    firstWorldCupMatch &&
    new Date(firstWorldCupMatch).getTime() <= Date.now();

  useEffect(() => {
    loadTips();
  }, []);

  useEffect(() => {
    if (!didLoad.current) return;
    if (specialLocked) return;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      saveTips();
    }, 700);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [
    worldChampion,
    topScorer,
    mostUnfairTeam,
    fairestTeam,
    specialLocked,
  ]);

  async function loadTips() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("special_predictions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setWorldChampion(data.world_champion || "");
      setTopScorer(data.top_scorer || "");
      setMostUnfairTeam(data.most_unfair_team || "");
      setFairestTeam(data.fairest_team || "");
    }

    didLoad.current = true;
    setLoading(false);
  }

  async function saveTips() {
    if (specialLocked) return;

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

  const fieldClass = `
    w-full border rounded-xl px-4 py-3 text-white
    ${
      specialLocked
        ? "bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed opacity-70"
        : "bg-slate-800 border-slate-700"
    }
  `;

  if (loading) {
    return <div className="text-slate-400">Spezial Tipps laden...</div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-black">Spezial Tipps</h2>
        <p className="text-sm text-slate-400 mt-1">
          Wird automatisch gespeichert.
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-2">
          Weltmeister (30 Punkte)
        </p>
        <select
          disabled={specialLocked}
          value={worldChampion}
          onChange={(e) => setWorldChampion(e.target.value)}
          className={fieldClass}
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
        <p className="text-sm text-slate-400 mb-2">
          Torschützenkönig (50 Punkte)
        </p>
        <input
          disabled={specialLocked}
          value={topScorer}
          onChange={(e) => setTopScorer(e.target.value)}
          placeholder="z.B. Kylian Mbappé"
          className={fieldClass}
        />
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-2">
          Unfairstes Team (Gruppenphase -20 Punkte)
        </p>
        <select
          disabled={specialLocked}
          value={mostUnfairTeam}
          onChange={(e) => setMostUnfairTeam(e.target.value)}
          className={fieldClass}
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
        <p className="text-sm text-slate-400 mb-2">
          Fairstes Team (Gruppenphase - 20 Punkte)
        </p>
        <select
          disabled={specialLocked}
          value={fairestTeam}
          onChange={(e) => setFairestTeam(e.target.value)}
          className={fieldClass}
        >
          <option value="">Team auswählen</option>
          {teams.map((team: any) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {specialLocked && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center">
          <p className="text-sm font-bold text-red-300">
            🔒 Spezial Tipps sind gesperrt
          </p>
          <p className="text-xs text-red-200/70 mt-1">
            Die Weltmeisterschaft hat bereits begonnen.
          </p>
        </div>
      )}

      {saved && !specialLocked && (
        <p className="text-center text-sm text-emerald-400">
          ✓ automatisch gespeichert
        </p>
      )}
    </div>
  );
}