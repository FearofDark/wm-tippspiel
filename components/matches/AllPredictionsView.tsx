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
  const [section, setSection] = useState<"groups" | "ko">("groups");
  const [selectedGroup, setSelectedGroup] = useState<string>("GROUP_A");
  const [selectedStage, setSelectedStage] = useState<string>("LAST_32");

  useEffect(() => {
    if (!selectedUser && profiles.length > 0) {
      setSelectedUser(profiles[0].id);
    }
  }, [profiles, selectedUser]);

  const groups = useMemo(() => {
    const found = matches.map((m) => m.group).filter(Boolean);
    return Array.from(new Set(found)).sort();
  }, [matches]);

  const stages = useMemo(() => {
    const allowed = [
      "LAST_32",
      "LAST_16",
      "QUARTER_FINALS",
      "SEMI_FINALS",
      "FINAL",
    ];

    const found = matches
      .map((m) => m.stage)
      .filter((stage) => allowed.includes(stage));

    return Array.from(new Set(found));
  }, [matches]);

  useEffect(() => {
    if (stages.length > 0 && !stages.includes(selectedStage)) {
      setSelectedStage(stages[0]);
    }
  }, [stages, selectedStage]);

  const filteredPredictions = predictions.filter(
    (p) => p.user_id === selectedUser
  );

  const selectedSpecial = specialPredictions.find(
    (s) => s.user_id === selectedUser
  );

  const getMatch = (matchId: number) =>
    matches.find((m) => Number(m.id) === Number(matchId));

  const selectedProfile = profiles.find((p) => p.id === selectedUser);

  const visiblePredictions = filteredPredictions.filter((prediction) => {
    const match = getMatch(prediction.match_id);

    if (!match) return false;

    if (section === "groups") {
      return match.group === selectedGroup;
    }

    return match.stage === selectedStage;
  });

  const stageLabel = (stage: string) => {
    switch (stage) {
      case "LAST_32":
        return "32";
      case "LAST_16":
        return "16";
      case "QUARTER_FINALS":
        return "VF";
      case "SEMI_FINALS":
        return "HF";
      case "FINAL":
        return "Finale";
      default:
        return stage;
    }
  };

  return (
    <div className="space-y-5">
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

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSection("groups")}
          className={`rounded-xl py-2.5 text-sm font-black ${
            section === "groups"
              ? "bg-emerald-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Gruppen
        </button>

        <button
          onClick={() => setSection("ko")}
          className={`rounded-xl py-2.5 text-sm font-black ${
            section === "ko"
              ? "bg-emerald-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          KO
        </button>
      </div>

      {section === "groups" && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {groups.map((group: any) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-bold ${
                selectedGroup === group
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {group.replace("GROUP_", "")}
            </button>
          ))}
        </div>
      )}

      {section === "ko" && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {stages.map((stage: any) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`shrink-0 px-3 h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-bold ${
                selectedStage === stage
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {stageLabel(stage)}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {visiblePredictions.length === 0 ? (
          <div className="text-slate-400 text-sm">
            Keine Tipps für diese Auswahl gefunden.
          </div>
        ) : (
          visiblePredictions.map((prediction) => {
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