"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  matches: any[];
  predictions: Record<number, { home: string; away: string }>;
  updatePrediction: (
    matchId: number,
    side: "home" | "away",
    value: string
  ) => void;
};

export default function KnockoutView({
  matches,
  predictions,
  updatePrediction,
}: Props) {
  const last32 = matches.filter((m) => m.stage === "LAST_32");
  const last16 = matches.filter((m) => m.stage === "LAST_16");
  const quarterFinals = matches.filter((m) => m.stage === "QUARTER_FINALS");
  const semiFinals = matches.filter((m) => m.stage === "SEMI_FINALS");
  const final = matches.filter((m) => m.stage === "FINAL");

  return (
    <div className="space-y-6">
      <Round
        title="🏆 Sechzehntelfinale"
        matches={last32}
        predictions={predictions}
        updatePrediction={updatePrediction}
      />

      <Round
        title="🏆 Achtelfinale"
        matches={last16}
        predictions={predictions}
        updatePrediction={updatePrediction}
      />

      <Round
        title="🏆 Viertelfinale"
        matches={quarterFinals}
        predictions={predictions}
        updatePrediction={updatePrediction}
      />

      <Round
        title="🏆 Halbfinale"
        matches={semiFinals}
        predictions={predictions}
        updatePrediction={updatePrediction}
      />

      <Round
        title="👑 Finale"
        matches={final}
        predictions={predictions}
        updatePrediction={updatePrediction}
      />
    </div>
  );
}

function Round({
  title,
  matches,
  predictions,
  updatePrediction,
}: {
  title: string;
  matches: any[];
  predictions: Record<number, { home: string; away: string }>;
  updatePrediction: (
    matchId: number,
    side: "home" | "away",
    value: string
  ) => void;
}) {
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const isLocked = (match: any) => {
    const matchDate = match.utc_date || match.utcDate;
    if (!matchDate) return false;

    return new Date(matchDate).getTime() <= Date.now();
  };

  const savePrediction = async (matchId: number) => {
    const match = matches.find((m) => Number(m.id) === Number(matchId));

    if (match && isLocked(match)) {
      console.log("❌ Tipp geschlossen");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const pred = predictions?.[matchId];

    if (!pred) return;
    if (pred.home === "" || pred.away === "") return;

    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        pred_home: Number(pred.home),
        pred_away: Number(pred.away),
      },
      {
        onConflict: "user_id,match_id",
      }
    );

    if (!error) {
      setSaved((prev) => ({
        ...prev,
        [matchId]: true,
      }));

      setTimeout(() => {
        setSaved((prev) => ({
          ...prev,
          [matchId]: false,
        }));
      }, 1500);
    }
  };

  const handleChange = (
    matchId: number,
    side: "home" | "away",
    value: string
  ) => {
    const match = matches.find((m) => Number(m.id) === Number(matchId));

    if (match && isLocked(match)) return;

    const cleanValue = value.replace(/\D/g, "");

    updatePrediction(matchId, side, cleanValue);

    if (saveTimers.current[matchId]) {
      clearTimeout(saveTimers.current[matchId]);
    }

    saveTimers.current[matchId] = setTimeout(() => {
      savePrediction(matchId);
    }, 700);
  };

  if (!matches.length) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800">
        <h2 className="text-lg sm:text-xl font-black">{title}</h2>
      </div>

      <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {matches.map((match) => {
          const pred = predictions?.[match.id] || {
            home: "",
            away: "",
          };

          const matchDate = match.utc_date || match.utcDate;

          const homeName =
            match.home_team || match.homeTeam?.name || "Team offen";

          const awayName =
            match.away_team || match.awayTeam?.name || "Team offen";

          const homeCrest = match.home_crest || match.homeTeam?.crest;
          const awayCrest = match.away_crest || match.awayTeam?.crest;

          const locked = isLocked(match);

          const inputClass = `
            w-10
            h-8
            text-center
            text-sm
            border
            rounded
            ${
              locked
                ? "bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed opacity-60"
                : "bg-slate-800 border-slate-700"
            }
          `;

          return (
            <div
              key={match.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4"
            >
              <div className="text-center text-xs text-slate-500 mb-3">
                {matchDate
                  ? new Date(matchDate).toLocaleString("de-DE")
                  : "Datum offen"}
              </div>

              <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-2">
                <div className="flex flex-col items-center gap-1 min-w-0">
                  {homeCrest && (
                    <img
                      src={homeCrest}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                  )}

                  <div className="text-xs sm:text-sm font-bold text-center break-words">
                    {homeName}
                  </div>
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  disabled={locked}
                  value={pred.home ?? ""}
                  onChange={(e) =>
                    handleChange(match.id, "home", e.target.value)
                  }
                  onBlur={() => savePrediction(match.id)}
                  className={inputClass}
                />

                <span className="font-bold">:</span>

                <input
                  type="text"
                  inputMode="numeric"
                  disabled={locked}
                  value={pred.away ?? ""}
                  onChange={(e) =>
                    handleChange(match.id, "away", e.target.value)
                  }
                  onBlur={() => savePrediction(match.id)}
                  className={inputClass}
                />

                <div className="flex flex-col items-center gap-1 min-w-0">
                  {awayCrest && (
                    <img
                      src={awayCrest}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                  )}

                  <div className="text-xs sm:text-sm font-bold text-center break-words">
                    {awayName}
                  </div>
                </div>
              </div>

              {locked && (
                <div className="mt-2 text-center text-xs text-slate-500">
                  Tipp geschlossen
                </div>
              )}

              {saved[match.id] && (
                <div className="mt-2 text-center text-xs text-emerald-400">
                  ✓ gespeichert
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}