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
        fetch("/api/matches"),
        fetch("/api/groups"),
        supabase.from("predictions").select("*").eq("user_id", user.id),
        supabase
          .from("predictions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("special_predictions").select("*"),
        supabase.from("profiles").select("id, username, points"),
      ]);

      const matchesJson = await matchesRes.json();
      const groupsJson = await groupsRes.json();

      setMatches(matchesJson.matches || []);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        ⚽ Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            FIFA World Cup 2026
          </h1>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setTab("groups")}
            className={`shrink-0 px-5 py-3 rounded-xl ${
              tab === "groups" ? "bg-emerald-600" : "bg-slate-800"
            }`}
          >
            Gruppenphase
          </button>

          <button
            onClick={() => setTab("ko")}
            className={`shrink-0 px-5 py-3 rounded-xl ${
              tab === "ko" ? "bg-emerald-600" : "bg-slate-800"
            }`}
          >
            KO Phase
          </button>

          <button
            onClick={() => setTab("tips")}
            className={`shrink-0 px-5 py-3 rounded-xl ${
              tab === "tips" ? "bg-emerald-600" : "bg-slate-800"
            }`}
          >
            Alle Tipps
          </button>

          <button
            onClick={() => setTab("special")}
            className={`shrink-0 px-5 py-3 rounded-xl ${
              tab === "special" ? "bg-emerald-600" : "bg-slate-800"
            }`}
          >
            Spezial Tipps
          </button>
        </div>

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

        {tab === "ko" && <KnockoutView matches={matches} />}

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
  );
}