import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const cookieStore = await cookies();

  const userId =
    cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json(
      { error: "Nicht eingeloggt" },
      { status: 401 }
    );
  }

  const { matchId, predHome, predAway } =
    body;

  const { error } = await supabase
    .from("predictions")
    .upsert({
      user_id: Number(userId),
      match_id: matchId,
      pred_home: predHome,
      pred_away: predAway,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}