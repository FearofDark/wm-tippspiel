"use client";

import { useRef, useState } from "react";

type Props = {
  matches: any[];
  selectedGroup: string;
  predictions: Record<
    number,
    {
      home: string;
      away: string;
    }
  >;
  updatePrediction: (
    matchId: number,
    side: "home" | "away",
    value: string
  ) => void;
  savePrediction: (
    matchId: number
  ) => Promise<void>;
};

export default function GroupMatches({
  matches,
  selectedGroup,
  predictions,
  updatePrediction,
  savePrediction,
}: Props) {
  const [saved, setSaved] = useState<
    Record<number, boolean>
  >({});

  const saveTimers = useRef<
    Record<number, NodeJS.Timeout>
  >({});

  const groupMatches = matches.filter(
    (match: any) =>
      match.group === selectedGroup ||
      match.group?.toUpperCase() ===
        selectedGroup?.toUpperCase()
  );

  const handleChange = (
    matchId: number,
    side: "home" | "away",
    value: string
  ) => {
    updatePrediction(
      matchId,
      side,
      value
    );

    if (saveTimers.current[matchId]) {
      clearTimeout(
        saveTimers.current[matchId]
      );
    }

    saveTimers.current[matchId] =
      setTimeout(async () => {
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
      }, 1000);
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
        const pred =
          predictions?.[match.id] || {};

        return (
          <div
            key={match.id}
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-xl
              p-3
            "
          >
            {/* DATUM */}
            <div className="text-center text-xs text-slate-500 mb-2">
              {new Date(
                match.utcDate
              ).toLocaleString("de-DE")}
            </div>

            {/* MATCH */}
            <div className="flex items-center justify-center gap-3">

              {/* HOME */}
              <div className="flex items-center gap-2 w-40 justify-end">
                <img
                  src={match.homeTeam?.crest}
                  alt=""
                  className="w-5 h-5 object-contain"
                />

                <span className="text-sm">
                  {match.homeTeam?.name}
                </span>
              </div>

              {/* HOME INPUT */}
              <input
                type="number"
                inputMode="numeric"
                value={pred.home || ""}
                onChange={(e) =>
                  handleChange(
                    match.id,
                    "home",
                    e.target.value
                  )
                }
                className="
                  w-10
                  h-8
                  text-center
                  text-sm
                  bg-slate-800
                  border
                  border-slate-700
                  rounded
                  [appearance:textfield]
                "
              />

              <span className="font-bold">
                :
              </span>

              {/* AWAY INPUT */}
              <input
                type="number"
                inputMode="numeric"
                value={pred.away || ""}
                onChange={(e) =>
                  handleChange(
                    match.id,
                    "away",
                    e.target.value
                  )
                }
                className="
                  w-10
                  h-8
                  text-center
                  text-sm
                  bg-slate-800
                  border
                  border-slate-700
                  rounded
                  [appearance:textfield]
                "
              />

              {/* AWAY */}
              <div className="flex items-center gap-2 w-40">
                <span className="text-sm">
                  {match.awayTeam?.name}
                </span>

                <img
                  src={match.awayTeam?.crest}
                  alt=""
                  className="w-5 h-5 object-contain"
                />
              </div>
            </div>

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