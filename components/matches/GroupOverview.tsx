"use client";

import GroupTabs from "./GroupTabs";
import GroupTable from "./GroupTable";
import GroupMatches from "./GroupMatches";
import MyGroupTable from "./MyGroupTable";
import { supabase } from "@/lib/supabase";

type Props = {
  groups: any[];
  currentGroup: any;
  selectedGroup: string;
  setSelectedGroup: (value: string) => void;
  matches: any[];
  predictions: Record<number, { home: string; away: string }>;
  updatePrediction: (
    matchId: number,
    side: "home" | "away",
    value: string
  ) => void;
};

export default function GroupOverview({
  groups,
  currentGroup,
  selectedGroup,
  setSelectedGroup,
  matches,
  predictions,
  updatePrediction,
}: Props) {
  const handleSavePrediction = async (matchId: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const pred = predictions?.[matchId];

    if (!pred) return;
    if (pred.home === "" || pred.away === "") return;

    await supabase.from("predictions").upsert(
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
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4">
        <GroupTabs
          groups={groups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <GroupTable group={currentGroup} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <MyGroupTable
          group={currentGroup}
          matches={matches}
          predictions={predictions ?? {}}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="text-lg sm:text-xl font-black">Spiele</h2>
        </div>

        <div className="p-3 sm:p-4">
          <GroupMatches
            matches={matches}
            selectedGroup={selectedGroup}
            predictions={predictions ?? {}}
            updatePrediction={updatePrediction}
            savePrediction={handleSavePrediction}
          />
        </div>
      </div>
    </div>
  );
}