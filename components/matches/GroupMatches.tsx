"use client";

import { useRef, useState } from "react";

type Props = {
  matches: any[];
  selectedGroup: string;
  predictions: Record<number, { home: string; away: string }>;
  updatePrediction: (
    matchId: number,
    side: "home" | "away",
    value: string
  ) => void;
  savePrediction: (matchId: number) => Promise<void>;
};

export default function GroupMatches({
  matches,
  selectedGroup,
  predictions,
  updatePrediction,
  savePrediction,
}: Props) {
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const groupMatches = matches.filter(
    (match: any) =>
      match.group === selectedGroup ||
      match.group?.toUpperCase() === selectedGroup?.toUpperCase()
  );

  const isLocked = (match: any) => {
    const matchDate = match.utc_date || match.utcDate;
    if (!matchDate) return false;

    return new Date(matchDate).getTime() <= Date.now();
  };

  const runSave = async (matchId: number) => {
    const match = matches.find((m) => Number(m.id) === Number(matchId));

    if (match && isLocked(match)) {
      console.log("❌ Tipp geschlossen");
      return;
    }

    const pred = predictions?.[matchId];

    if (!pred) return;

    if (pred.home === "" || pred.away === "") {
      console.log("⏳ Noch nicht vollständig:", pred);
      return;
    }

    await savePrediction(matchId);

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
      runSave(matchId);
    }, 700);
  };

  if (!groupMatches.length) {
    return (
      <div className="text-slate-400 text-sm">
        Keine Spiele gefunden.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groupMatches.map((match: any) => {
        const pred = predictions?.[match.id] || {
          home: "",
          away: "",
        };

        const matchDate = match.utc_date || match.utcDate;
        const homeName = match.home_team || match.homeTeam?.name || "Offen";
        const awayName = match.away_team || match.awayTeam?.name || "Offen";
        const homeCrest = match.home_crest || match.homeTeam?.crest;
        const awayCrest = match.away_crest || match.awayTeam?.crest;
        const locked = isLocked(match);

        const inputClass = `
          w-10 h-8 text-center text-sm border rounded
          ${
            locked
              ? "bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed opacity-60"
              : "bg-slate-800 border-slate-700"
          }
        `;

        return (
          <div
            key={match.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3"
          >
            <div className="text-center text-xs text-slate-500 mb-2">
              {matchDate
                ? new Date(matchDate).toLocaleString("de-DE")
                : "Datum offen"}
            </div>

            <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-2 sm:gap-3">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-1 sm:gap-2 min-w-0">
                {homeCrest && (
                  <img
                    src={homeCrest}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                )}

                <span className="text-xs sm:text-sm text-center sm:text-right break-words">
                  {homeName}
                </span>
              </div>

              <input
                type="text"
                inputMode="numeric"
                disabled={locked}
                value={pred.home ?? ""}
                onChange={(e) =>
                  handleChange(match.id, "home", e.target.value)
                }
                onBlur={() => runSave(match.id)}
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
                onBlur={() => runSave(match.id)}
                className={inputClass}
              />

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 min-w-0">
                <span className="text-xs sm:text-sm text-center sm:text-left break-words">
                  {awayName}
                </span>

                {awayCrest && (
                  <img
                    src={awayCrest}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                )}
              </div>
            </div>

            {locked && (
              <div className="mt-2 text-center text-xs text-slate-500">
                Tipp geschlossen
              </div>
            )}

            {saved[match.id] && (
              <div className="mt-1 text-center text-xs text-emerald-400">
                ✓ gespeichert
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}