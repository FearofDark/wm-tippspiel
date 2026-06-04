import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/standings",
    {
      headers: {
        "X-Auth-Token":
          process.env.FOOTBALL_DATA_API_KEY!,
      },
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}