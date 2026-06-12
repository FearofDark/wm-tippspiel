import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeText(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const footballRes = await fetch(
      "https://api.football-data.org/v4/competitions/2000/matches",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY!,
        },
        cache: "no-store",
      }
    );

    if (!footballRes.ok) {
      const text = await footballRes.text();

      return Response.json(
        {
          success: false,
          step: "football api",
          status: footballRes.status,
          message: text,
          hasFootballKey: Boolean(process.env.FOOTBALL_DATA_API_KEY),
        },
        { status: 200 }
      );
    }

    const data = await footballRes.json();

    if (!data?.matches) {
      return Response.json(
        {
          success: false,
          step: "football api parse",
          apiResponse: data,
        },
        { status: 200 }
      );
    }

    const formattedMatches = data.matches.map((match: any) => ({
      id: match.id,
      utc_date: match.utcDate,
      group: match.group ?? null,
      stage: match.stage ?? null,
      home_team: match.homeTeam?.name ?? null,
      away_team: match.awayTeam?.name ?? null,
      home_crest: match.homeTeam?.crest ?? null,
away_crest: match.awayTeam?.crest ?? null,
      home_score: match.score?.fullTime?.home ?? null,
      away_score: match.score?.fullTime?.away ?? null,
      status: match.status ?? null,
    }));

    for (const match of formattedMatches) {
  const { error: updateError } = await supabase
    .from("matches")
    .update(match)
    .eq("id", match.id);

  if (updateError) {
    return Response.json(
      {
        success: false,
        step: "update match",
        matchId: match.id,
        error: updateError.message,
      },
      { status: 200 }
    );
  }

  const { data: existing } = await supabase
    .from("matches")
    .select("id")
    .eq("id", match.id)
    .maybeSingle();

  if (!existing) {
    const { error: insertError } = await supabase
      .from("matches")
      .insert(match);

    if (insertError) {
      return Response.json(
        {
          success: false,
          step: "insert match",
          matchId: match.id,
          error: insertError.message,
        },
        { status: 200 }
      );
    }
  }
}
    const { data: dbMatches, error: matchesError } = await supabase
      .from("matches")
      .select("id, home_score, away_score, status");

    if (matchesError) {
      return Response.json(
        {
          success: false,
          step: "load matches from db",
          error: matchesError.message,
        },
        { status: 200 }
      );
    }

    const matchMap = new Map<number, any>();

    for (const match of dbMatches ?? []) {
      matchMap.set(Number(match.id), match);
    }

    const { data: predictions, error: predictionError } = await supabase
      .from("predictions")
      .select("user_id, match_id, pred_home, pred_away");

    if (predictionError) {
      return Response.json(
        {
          success: false,
          step: "load predictions",
          error: predictionError.message,
        },
        { status: 200 }
      );
    }

    const matchPointsByUser: Record<string, number> = {};

    for (const prediction of predictions ?? []) {
      const match = matchMap.get(Number(prediction.match_id));

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
        {
          success: false,
          step: "load special result",
          error: specialResultError.message,
        },
        { status: 200 }
      );
    }

    const { data: specialPredictions, error: specialPredictionsError } =
      await supabase.from("special_predictions").select("*");

    if (specialPredictionsError) {
      return Response.json(
        {
          success: false,
          step: "load special predictions",
          error: specialPredictionsError.message,
        },
        { status: 200 }
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

        points += Number(sp.manual_bonus_points ?? 0);
        
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
      return Response.json(
        {
          success: false,
          step: "load profiles",
          error: profilesError.message,
        },
        { status: 200 }
      );
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
        return Response.json(
          {
            success: false,
            step: "update profile points",
            profileId: profile.id,
            error: updateError.message,
          },
          { status: 200 }
        );
      }
    }

    return Response.json(
      {
        success: true,
        matchesUpdated: formattedMatches.length,
        usersUpdated: allProfiles?.length ?? 0,
        matchPointsByUser,
        specialPointsByUser,
        totalPointsByUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        step: "unexpected server error",
        message: error?.message || String(error),
      },
      { status: 200 }
    );
  }
}