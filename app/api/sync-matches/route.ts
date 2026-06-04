import { createClient } from "@supabase/supabase-js";

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
    }
  );

  const data = await res.json();

  const finished = data.matches.filter(
    (m: any) => m.status === "FINISHED"
  );

for (const match of data.matches) {
  await supabase.from("matches").upsert({
    id: match.id,
    status: match.status,
    home_score: match.score.fullTime.home,
    away_score: match.score.fullTime.away,
    utc_date: match.utcDate,
  });
}

  return Response.json({
      firstMatch: data.matches?.[0],
  total: data.matches?.length,
  });
}