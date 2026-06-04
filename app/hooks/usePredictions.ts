"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PredictionMap = Record<number, { home: string; away: string }>;

export function usePredictions(user: any) {
  const [predictions, setPredictions] = useState<PredictionMap>({});
  const [loading, setLoading] = useState(true);

  // LOAD
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id);

      const formatted: PredictionMap = {};

      (data || []).forEach((p: any) => {
        formatted[Number(p.match_id)] = {
          home: String(p.pred_home),
          away: String(p.pred_away),
        };
      });

      setPredictions(formatted);
      setLoading(false);
    };

    load();
  }, [user]);

  // UPDATE LOCAL STATE
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

  // SAVE (single source of truth)
  async function savePrediction(matchId: number) {
    if (!user) return;

    const pred = predictions[matchId];
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
  }

  return {
    predictions,
    updatePrediction,
    savePrediction,
    loading,
  };
}