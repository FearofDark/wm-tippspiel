"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  predictions: any[];
  specialPredictions: any[];
  matches: any[];
  profiles: any[];
};

export default function AllPredictionsView({
  predictions,
  specialPredictions,
  matches,
  profiles,
}: Props) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("GROUP_A");

  useEffect(() => {
    if (!selectedUser && profiles.length > 0) {
      setSelectedUser(profiles[0].id);
    }
  }, [profiles, selectedUser]);

  const groups = useMemo(() => {
    const found = matches.map((m) => m.group).filter(Boolean);
    return Array.from(new Set(found)).sort();
  }, [matches]);

  const filteredPredictions = predictions.filter(
    (p) => p.user_id === selectedUser
  );

  const selectedSpecial = specialPredictions.find(
    (s) => s.user_id === selectedUser
  );

  const getMatch = (matchId: number) =>
    matches.find((m) => Number(m.id) === Number(matchId));

  const selectedProfile = profiles.find((p) => p.id === selectedUser);

  const groupPredictions = filteredPredictions.filter((prediction) => {
    const match = getMatch(prediction.match_id);
    return match?.group === selectedGroup;
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <p className="text-sm text-slate-400 mb-2">Spieler auswählen</p>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.username || "Unbekannter Spieler"}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div>
          <p className="text-xs text-slate-400">Spezial Tipps von</p>
          <h3 className="text-xl font-black">
            {selectedProfile?.username || "Unbekannter Spieler"}
          </h3>
        </div>

        {selectedSpecial ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Weltmeister</p>
              <p className="font-bold mt-1">
                {selectedSpecial.world_champion || "-"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Torschützenkönig</p>
              <p className="font-bold mt-1">
                {selectedSpecial.top_scorer || "-"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Unfairstes Team</p>
              <p className="font-bold mt-1">
                {selectedSpecial.most_unfair_team || "-"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Fairstes Team</p>
              <p className="font-bold mt-1">
                {selectedSpecial.fairest_team || "-"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-sm">
            Dieser Spieler hat noch keine Spezial Tipps abgegeben.
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {groups.map((group: any) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`shrink-0 w-12 h-12 rounded-xl font-bold ${
              selectedGroup === group
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {group.replace("GROUP_", "")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {groupPredictions.length === 0 ? (
          <div className="text-slate-400 text-sm">
            Keine normalen Tipps für diese Auswahl gefunden.
          </div>
        ) : (
          groupPredictions.map((prediction) => {
            const match = getMatch(prediction.match_id);

            const homeName =
              match?.home_team || match?.homeTeam?.name || "Team offen";

            const awayName =
              match?.away_team || match?.awayTeam?.name || "Team offen";

            const matchDate = match?.utc_date || match?.utcDate;

            return (
              <div
                key={prediction.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-emerald-400 font-semibold">
                      {selectedProfile?.username || "Unbekannter Spieler"}
                    </p>

                    <p className="text-sm font-bold mt-1 break-words">
                      {homeName} vs {awayName}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {matchDate
                        ? new Date(matchDate).toLocaleString("de-DE")
                        : "Datum offen"}
                    </p>
                  </div>

                  <div className="text-2xl font-black text-yellow-300">
                    {prediction.pred_home}:{prediction.pred_away}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}