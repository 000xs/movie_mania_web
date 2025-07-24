import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q   = searchParams.get("q") || searchParams.get("query");
    const page  = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip  = (page - 1) * limit;

    if (!q?.trim()) {
      return NextResponse.json({ error: "q or query required" }, { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("movie_mania");

    // Fuzzy / autocomplete search
    const movies = await db
      .collection("movies")
      .aggregate([
        {
          $search: {
            index: "movies_search",
            compound: {
              should: [
                { autocomplete: { query: q, path: "title", score: { boost: 3 } } },
                { text: { query: q, path: "title", fuzzy: { maxEdits: 2 } } },
                { text: { query: q, path: "overview", fuzzy: { maxEdits: 1 } } },
              ],
            },
          },
        },
        { $addFields: { media_type: "movie", score: { $meta: "searchScore" } } },
        { $skip: skip / 2 },
        { $limit: Math.ceil(limit / 2) },
      ])
      .toArray();

    const tvSeries = await db
      .collection("tvseries")
      .aggregate([
        {
          $search: {
            index: "tvseries_search",
            compound: {
              should: [
                { autocomplete: { query: q, path: "name", score: { boost: 3 } } },
                { text: { query: q, path: "name", fuzzy: { maxEdits: 2 } } },
                { text: { query: q, path: "overview", fuzzy: { maxEdits: 1 } } },
              ],
            },
          },
        },
        { $addFields: { media_type: "tv", score: { $meta: "searchScore" } } },
        { $skip: skip / 2 },
        { $limit: Math.ceil(limit / 2) },
      ])
      .toArray();

    // Merge & sort by relevance
    const results = [...movies, ...tvSeries]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Fast counts for pagination
    const [totalMovies, totalTV] = await Promise.all([
      db.collection("movies").countDocuments({ $text: { $search: q } }),
      db.collection("tvseries").countDocuments({ $text: { $search: q } }),
    ]);
    const total = totalMovies + totalTV;

    return NextResponse.json({
      results,
      page,
      total_pages: Math.ceil(total / limit),
      total_results: total,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}