import { getTVSeriesCredits } from "@/lib/tmdb-server";
import { NextResponse } from "next/server";

export async function GET(request, context) {
 
  const params = await context.params;
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "TV Series ID is required" }, { status: 400 });
  }

  try {
    const credits = await getTVSeriesCredits(id);
    return NextResponse.json(credits);
  } catch (error) {
    console.error("Error fetching TV series credits:", error);
    return NextResponse.json({ error: "Failed to fetch TV series credits" }, { status: 500 });
  }
}
