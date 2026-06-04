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
    console.log("🚀 SAVE CLICKED:", matchId);

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    const user = userData.user;

    console.log("👤 USER:", user);

    if (userError) {
      console.error("❌ USER ERROR:", userError);
      return;
    }

    if (!user) {
      console.log("❌ NO USER");
      return;
    }

    const pred = predictions?.[matchId];

    console.log("📦 RAW PREDICTION:", pred);

    if (!pred) {
      console.log("❌ NO PREDICTION FOUND");
      return;
    }

    const home = pred.home;
    const away = pred.away;

    console.log("⚽ VALUES:", { home, away });

    if (home === undefined || away === undefined) {
      console.log("❌ UNDEFINED VALUES");
      return;
    }

    if (home === "" || away === "") {
      console.log("❌ EMPTY VALUES");
      return;
    }

    const payload = {
      user_id: user.id,
      match_id: matchId,
      pred_home: Number(home),
      pred_away: Number(away),
    };

    console.log("📤 SENDING TO SUPABASE:", payload);

    const { data, error } = await supabase
      .from("predictions")
      .upsert(payload, {
        onConflict: "user_id,match_id",
      })
      .select();

    console.log("📥 SUPABASE DATA:", data);
    console.log("📥 SUPABASE ERROR:", error);

    if (error) {
      console.error("❌ SAVE FAILED:", error);
    } else {
      console.log("✅ SAVE SUCCESS");
    }
  };

  return (
    <div className="space-y-6 px-3 sm:px-6 py-4">

      {/* TABS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5">
        <GroupTabs
          groups={groups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-3 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Tabelle
          </h3>
          <GroupTable group={currentGroup} />
        </div>
      </div>

      {/* MY TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-3 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Deine Tipps
          </h3>

          <MyGroupTable
            group={currentGroup}
            matches={matches}
            predictions={predictions ?? {}}
          />
        </div>
      </div>

      {/* MATCHES */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-3 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Spiele
          </h3>

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