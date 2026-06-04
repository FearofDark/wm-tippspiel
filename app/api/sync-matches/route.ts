import { createClient } from "@supabase/supabase-js";

function normalizeText(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const res = await fetch(
    "https://api.football-data.org/v4/competitions/2000/matches",
    {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY!,
      },
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!data?.matches) {
    return Response.json(
      { error: "No matches found from API", apiResponse: data },
      { status: 500 }
    );
  }

  const formattedMatches = data.matches.map((match: any) => ({
    id: match.id,
    utc_date: match.utcDate,
    home_team: match.homeTeam?.name ?? null,
    away_team: match.awayTeam?.name ?? null,
    home_score: match.score?.fullTime?.home ?? null,
    away_score: match.score?.fullTime?.away ?? null,
    status: match.status ?? null,
  }));

  const { error: upsertError } = await supabase
    .from("matches")
    .upsert(formattedMatches, {
      onConflict: "id",
    });

  if (upsertError) {
    return Response.json({ error: upsertError.message }, { status: 500 });
  }

  const { data: predictions, error: predictionError } = await supabase
    .from("predictions")
    .select(`
      user_id,
      pred_home,
      pred_away,
      matches (
        home_score,
        away_score,
        status
      )
    `);

  if (predictionError) {
    return Response.json({ error: predictionError.message }, { status: 500 });
  }

  const matchPointsByUser: Record<string, number> = {};

  for (const prediction of predictions ?? []) {
    const match = Array.isArray(prediction.matches)
      ? prediction.matches[0]
      : prediction.matches;

    if (!match || match.status !== "FINISHED") continue;
    if (match.home_score === null || match.away_score === null) continue;

    const predHome = Number(prediction.pred_home);
    const predAway = Number(prediction.pred_away);
    const homeScore = Number(match.home_score);
    const awayScore = Number(match.away_score);

    let points = 0;

    if (predHome === homeScore && predAway === awayScore) {
      points = 3;
    } else if (
      (predHome > predAway && homeScore > awayScore) ||
      (predHome < predAway && homeScore < awayScore) ||
      (predHome === predAway && homeScore === awayScore)
    ) {
      points = 1;
    }

    matchPointsByUser[prediction.user_id] =
      (matchPointsByUser[prediction.user_id] ?? 0) + points;
  }

  const { data: specialResult, error: specialResultError } = await supabase
    .from("special_results")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (specialResultError) {
    return Response.json(
      { error: specialResultError.message },
      { status: 500 }
    );
  }

  const { data: specialPredictions, error: specialPredictionsError } =
    await supabase.from("special_predictions").select("*");

  if (specialPredictionsError) {
    return Response.json(
      { error: specialPredictionsError.message },
      { status: 500 }
    );
  }

  const specialPointsByUser: Record<string, number> = {};

  if (specialResult) {
    for (const sp of specialPredictions ?? []) {
      let points = 0;

      if (
        specialResult.world_champion &&
        sp.world_champion === specialResult.world_champion
      ) {
        points += 30;
      }

      if (
        specialResult.top_scorer &&
        normalizeText(sp.top_scorer) === normalizeText(specialResult.top_scorer)
      ) {
        points += 50;
      }

      if (
        specialResult.most_unfair_team &&
        sp.most_unfair_team === specialResult.most_unfair_team
      ) {
        points += 20;
      }

      if (
        specialResult.fairest_team &&
        sp.fairest_team === specialResult.fairest_team
      ) {
        points += 20;
      }

      specialPointsByUser[sp.user_id] = points;
    }
  }

  const { data: allProfiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id");

  if (profilesError) {
    return Response.json({ error: profilesError.message }, { status: 500 });
  }

  const totalPointsByUser: Record<string, number> = {};

  for (const profile of allProfiles ?? []) {
    const matchPoints = matchPointsByUser[profile.id] ?? 0;
    const specialPoints = specialPointsByUser[profile.id] ?? 0;
    const totalPoints = matchPoints + specialPoints;

    totalPointsByUser[profile.id] = totalPoints;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ points: totalPoints })
      .eq("id", profile.id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }
  }

  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .order("utc_date", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    total: matches.length,
    usersUpdated: allProfiles?.length ?? 0,
    matchPointsByUser,
    specialPointsByUser,
    totalPointsByUser,
    matches,
  });
}