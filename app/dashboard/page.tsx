"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function getCountdown(targetDate: string) {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return "ANGESTOßEN";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return `${days}d ${hours}h ${minutes}m`;
}

function formatRank(rank: number | null) {
  if (!rank) return "-";
  return `${rank}.`;
}

function getMatchDate(match: any) {
  return match?.utc_date || match?.utcDate;
}

function getHomeName(match: any) {
  return match?.home_team || match?.homeTeam?.name || "Team offen";
}

function getAwayName(match: any) {
  return match?.away_team || match?.awayTeam?.name || "Team offen";
}

function getHomeCrest(match: any) {
  return match?.home_crest || match?.homeTeam?.crest;
}

function getAwayCrest(match: any) {
  return match?.away_crest || match?.awayTeam?.crest;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [countdown, setCountdown] = useState("");
  const [upcomingUntipped, setUpcomingUntipped] = useState<any[]>([]);
  const [totalOpenTips, setTotalOpenTips] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const date = getMatchDate(nextMatch);

      if (date) {
        setCountdown(getCountdown(date));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [nextMatch]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.replace("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", user.id)
          .single();

        setPoints(profile?.points || 0);

        const { data: allUsers } = await supabase
          .from("profiles")
          .select("id, points")
          .order("points", { ascending: false });

        if (allUsers) {
          const position =
            allUsers.findIndex((u) => u.id === user.id) + 1;

          setRank(position > 0 ? position : null);
        }

        const [{ data: matchesData, error: matchesError }, { data: predictionsData }] =
          await Promise.all([
            supabase
              .from("matches")
              .select("*")
              .order("utc_date", { ascending: true }),
            supabase
              .from("predictions")
              .select("match_id")
              .eq("user_id", user.id),
          ]);

        if (matchesError) {
          console.error("MATCHES ERROR:", matchesError);
        }

        const matches = matchesData || [];
        const predictions = predictionsData || [];
        const tippedMatchIds = new Set(
          predictions.map((prediction: any) => Number(prediction.match_id))
        );

        const now = new Date();

        const future = matches
          .filter((match: any) => {
            const date = getMatchDate(match);
            if (!date) return false;
            return new Date(date) > now;
          })
          .sort(
            (a: any, b: any) =>
              new Date(getMatchDate(a)).getTime() -
              new Date(getMatchDate(b)).getTime()
          );

        if (future.length > 0) {
          const next = future[0];
          const nextDate = getMatchDate(next);

          setNextMatch(next);
          setCountdown(nextDate ? getCountdown(nextDate) : "");
        }

        const openTips = future.filter(
          (match: any) => !tippedMatchIds.has(Number(match.id))
        );

        setTotalOpenTips(openTips.length);
        setUpcomingUntipped(openTips.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-slate-400">Dashboard lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pb-0">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:p-6 space-y-5">
        <div className="flex flex-col gap-4">
          <div>
            <div className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300 mb-3">
              WM 2026 Tippspiel
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Dashboard
            </h1>

            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Punkte, Platzierung und deine offenen Tipps.
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full sm:w-fit rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-xl">
            <p className="text-xs sm:text-sm text-slate-400">Punkte</p>
            <h2 className="mt-2 text-4xl sm:text-5xl font-black">
              {points}
            </h2>
            <p className="text-xs text-slate-500 mt-1">gesamt</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-xl">
            <p className="text-xs sm:text-sm text-slate-400">Platzierung</p>
            <h2 className="mt-2 text-4xl sm:text-5xl font-black">
              {formatRank(rank)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">im Ranking</p>
          </div>
        </div>

        {totalOpenTips > 0 ? (
          <div className="rounded-3xl border border-orange-400/30 bg-orange-400/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>

              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-orange-300">
                  Du hast noch {totalOpenTips} offene Tipps
                </h2>

                <p className="text-sm text-orange-100/70 mt-1">
                  Vergiss nicht, deine Tipps vor dem jeweiligen Anpfiff
                  einzutragen.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✅</div>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-emerald-300">
                  Alles getippt
                </h2>

                <p className="text-sm text-emerald-100/70 mt-1">
                  Aktuell hast du keine offenen Tipps für kommende Spiele.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 p-4 sm:p-5">
            <p className="text-sm text-slate-400">Nächstes Spiel</p>
          </div>

          {nextMatch ? (
            <div className="p-4 sm:p-8 space-y-6">
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-6">
                <div className="flex flex-col items-center text-center gap-2 min-w-0">
                  {getHomeCrest(nextMatch) && (
                    <img
                      src={getHomeCrest(nextMatch)}
                      alt=""
                      className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                    />
                  )}

                  <h2 className="text-sm sm:text-2xl font-black leading-tight break-words">
                    {getHomeName(nextMatch)}
                  </h2>
                </div>

                <div className="pt-5 sm:pt-7">
                  <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm font-bold text-slate-300">
                    VS
                  </div>
                </div>

                <div className="flex flex-col items-center text-center gap-2 min-w-0">
                  {getAwayCrest(nextMatch) && (
                    <img
                      src={getAwayCrest(nextMatch)}
                      alt=""
                      className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                    />
                  )}

                  <h2 className="text-sm sm:text-2xl font-black leading-tight break-words">
                    {getAwayName(nextMatch)}
                  </h2>
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 sm:p-5 text-center">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-yellow-300/80">
                  Anstoß in
                </p>

                <div className="mt-2 text-3xl sm:text-5xl font-black text-yellow-300">
                  {countdown}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-slate-400">
              Kein Spiel gefunden
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 p-4 sm:p-5">
            <p className="text-sm text-slate-400">Offene Tipps</p>
          </div>

          {upcomingUntipped.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {upcomingUntipped.map((match: any) => {
                const matchDate = getMatchDate(match);

                return (
                  <div
                    key={match.id}
                    className="p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">
                        {getHomeName(match)} vs {getAwayName(match)}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {matchDate
                          ? new Date(matchDate).toLocaleString("de-DE")
                          : "Datum offen"}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-xs font-bold text-orange-300">
                      Tipp fehlt
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-slate-400">
              Keine offenen Tipps gefunden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}