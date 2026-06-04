import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch von Football API
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/2000/matches",
    {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY!,
      },
    }
  );

  const data = await res.json();

  if (!data?.matches) {
    return Response.json(
      { error: "No matches found from API" },
      { status: 500 }
    );
  }

  // Debug (optional aber hilfreich)
  console.log("First match example:", data.matches[0]);

  // 2. Upsert in Supabase (FIXED FIELD MAPPING)
  const { error: upsertError } = await supabase.from("matches").upsert(
    data.matches.map((match: any) => ({
      id: match.id,
      utc_date: match.utcDate,

      home_team: match.homeTeam?.name ?? null,
      away_team: match.awayTeam?.name ?? null,

      home_score: match.score?.fullTime?.home ?? null,
      away_score: match.score?.fullTime?.away ?? null,

      status: match.status ?? null,
    }))
  );

  if (upsertError) {
    return Response.json(
      { error: upsertError.message },
      { status: 500 }
    );
  }

  // 3. Daten aus Supabase holen (nicht API!)
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .order("utc_date", { ascending: true });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // 4. Response
  return Response.json({
    total: matches.length,
    matches,
  });
}