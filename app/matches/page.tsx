"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import GroupOverview from "@/components/matches/GroupOverview";
import KnockoutView from "@/components/matches/KnockoutView";
import AllPredictionsView from "@/components/matches/AllPredictionsView";
import SpecialTipsView from "@/components/matches/SpecialTipsView";

export default function MatchesPage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("groups");

  const [matches, setMatches] = useState<any[]>([]);
  const [groupsData, setGroupsData] = useState<any[]>([]);

  const [allPredictions, setAllPredictions] = useState<any[]>([]);
  const [specialPredictions, setSpecialPredictions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("GROUP_A");
  const [predictions, setPredictions] = useState<Record<number, any>>({});

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const [
        matchesRes,
        groupsRes,
        myPredsRes,
        allPredsRes,
        specialPredsRes,
        profilesRes,
      ] = await Promise.all([
        supabase.from("matches").select("*").order("utc_date", {
          ascending: true,
        }),
        fetch("/api/groups"),
        supabase.from("predictions").select("*").eq("user_id", user.id),
        supabase
          .from("predictions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("special_predictions").select("*"),
        supabase.from("profiles").select("id, username, points"),
      ]);

      const groupsJson = await groupsRes.json();

      if (matchesRes.error) {
        console.error("❌ MATCHES ERROR:", matchesRes.error);
      }

      setMatches(matchesRes.data || []);
      setGroupsData(groupsJson.standings || []);

      const formatted: Record<number, any> = {};

      (myPredsRes.data || []).forEach((p: any) => {
        formatted[p.match_id] = {
          home: String(p.pred_home),
          away: String(p.pred_away),
        };
      });

      setPredictions(formatted);
      setAllPredictions(allPredsRes.data || []);
      setSpecialPredictions(specialPredsRes.data || []);
      setProfiles(profilesRes.data || []);
    } catch (err) {
      console.error("❌ INIT ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  function updatePrediction(
    matchId: number,
    side: "home" | "away",
    value: string
  ) {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        home: prev[matchId]?.home || "",
        away: prev[matchId]?.away || "",
        [side]: value,
      },
    }));
  }

  const groups = groupsData.map((g: any) => ({
    label: g.group,
    value: g.group.replace("Group ", "GROUP_"),
  }));

  const currentGroup = groupsData.find(
    (g: any) => g.group.replace("Group ", "GROUP_") === selectedGroup
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
        ⚽ Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-5 sm:mb-7">
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => setTab("groups")}
            className={`rounded-2xl py-3 sm:py-4 text-xs sm:text-sm font-black transition-all ${
              tab === "groups"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Gruppen
          </button>

          <button
            onClick={() => setTab("ko")}
            className={`rounded-2xl py-3 sm:py-4 text-xs sm:text-sm font-black transition-all ${
              tab === "ko"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            KO
          </button>

          <button
            onClick={() => setTab("special")}
            className={`rounded-2xl py-3 sm:py-4 text-xs sm:text-sm font-black transition-all ${
              tab === "special"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Spezial
          </button>

                    <button
            onClick={() => setTab("tips")}
            className={`rounded-2xl py-3 sm:py-4 text-xs sm:text-sm font-black transition-all ${
              tab === "tips"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Tipps(alle)
          </button>

          
        </div>

        <div className="text-sm sm:text-base">
          {tab === "groups" && (
            <GroupOverview
              groups={groups}
              currentGroup={currentGroup}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              matches={matches}
              predictions={predictions}
              updatePrediction={updatePrediction}
            />
          )}

          {tab === "ko" && (
            <KnockoutView
              matches={matches}
              predictions={predictions}
              updatePrediction={updatePrediction}
            />
          )}

          {tab === "tips" && (
            <AllPredictionsView
              predictions={allPredictions}
              specialPredictions={specialPredictions}
              matches={matches}
              profiles={profiles}
            />
          )}

          {tab === "special" && <SpecialTipsView matches={matches} />}
        </div>
      </div>
    </div>
  );
}