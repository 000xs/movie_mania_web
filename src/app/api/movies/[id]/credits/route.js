import { getMovieCredits, formatCreditsData } from "@/lib/tmdb-server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
  }

  try {
    const rawCredits = await getMovieCredits(id);
    const formattedCredits = formatCreditsData(rawCredits);
    return NextResponse.json(formattedCredits);
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    return NextResponse.json({ error: "Failed to fetch movie credits" }, { status: 500 });
  }
}
