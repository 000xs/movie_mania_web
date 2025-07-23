// app/api/tv/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TVSeries from "@/lib/models/TVSeries";
import {
  getPopularTVSeries,
  getTrendingTvSeries,
  getTopRatedTVSeries,
  getAiringTodayTVSeries,
  getOnTheAirTVSeries,
  discoverTVSeries,
} from "@/lib/tmdb";
import { v4 as uuidv4 } from "uuid";

function safeParseJSON(field) {
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  }
  return Array.isArray(field) ? field : [];
}

function sanitizeArrayOfObjects(arr, requiredKeys = ["name"]) {
  return arr
    .map((item) => {
      if (typeof item === "string") return { name: item };
      if (
        item &&
        typeof item === "object" &&
        requiredKeys.every((key) => key in item)
      )
        return item;
      return null;
    })
    .filter(Boolean);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const genre = searchParams.get("genre");
    const sortBy = searchParams.get("sort_by") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const category = searchParams.get("category");
    const source = searchParams.get("source") || "local";

    if (source === "tmdb") {
      let tmdbResults = [];

      switch (category) {
        case "trending":
          tmdbResults = await getTrendingTvSeries();
          break;
        case "popular":
          tmdbResults = await getPopularTVSeries();
          break;
        case "top_rated":
          tmdbResults = await getTopRatedTVSeries();
          break;
        case "airing_today":
          tmdbResults = await getAiringTodayTVSeries();
          break;
        case "on_the_air":
          tmdbResults = await getOnTheAirTVSeries();
          break;
        case "discover":
          const filters = {};
          if (genre) filters.with_genres = genre;
          if (searchParams.get("year"))
            filters.first_air_date_year = searchParams.get("year");
          if (searchParams.get("sort_by"))
            filters.sort_by = searchParams.get("sort_by");
          tmdbResults = await discoverTVSeries(filters);
          break;
        default:
          tmdbResults = await getPopularTVSeries();
      }

      return NextResponse.json({
        results: tmdbResults,
        page: 1,
        total_pages: 1,
        total_results: tmdbResults.length,
        source: "tmdb",
      });
    }

    await connectDB();

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { overview: { $regex: search, $options: "i" } },
        { originalName: { $regex: search, $options: "i" } },
      ];
    }
    if (genre) {
      query.genres = { $in: [genre] };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === "desc" ? -1 : 1;

    const tvSeries = await TVSeries.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await TVSeries.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      results: tvSeries,
      page,
      total_pages: totalPages,
      total_results: total,
      source: "local",
    });
  } catch (error) {
    console.error("GET /api/tv error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(request) {
  try {
    await connectDB();
    let data = await request.json();

    const sanitize = (field, requiredKeys) =>
      sanitizeArrayOfObjects(safeParseJSON(field), requiredKeys);

    data.downloads = sanitize(data.downloads, ["quality", "format", "url"]);
    data.subtitles = sanitize(data.subtitles, ["language", "url"]);
    data.cast = sanitize(data.cast);
    data.crew = sanitize(data.crew);
    data.networks = sanitize(data.networks);

    [
      "genres",
      "episodeRunTime",
      "productionCompanies",
      "productionCountries",
      "spokenLanguages",
      "seasons",
    ].forEach((field) => {
      data[field] = safeParseJSON(data[field]);
    });

    function cleanObject(obj) {
      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      } else if (obj && typeof obj === "object") {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined && value !== null) {
            cleaned[key] = cleanObject(value);
          }
        }
        return cleaned;
      }
      return obj;
    }

    // Clean seasons and episodes to remove undefined/null and fix fields
    
    if (Array.isArray(data.seasons)) {
      data.seasons = data.seasons.map((season) => {
        // Clean season fields, e.g. ensure air_date and season_number have fallback values or are removed if undefined
        const cleanedSeason = cleanObject(season);

        // Auto-generate episode IDs if present
        if (Array.isArray(cleanedSeason.episodes)) {
          cleanedSeason.episodes = cleanedSeason.episodes.map((episode) => {
            const cleanedEpisode = cleanObject(episode);
            return {
              episodeId: uuidv4(),
              ...cleanedEpisode,
              downloads: cleanedEpisode.downloads || [],
              subtitles: cleanedEpisode.subtitles || [],
            };
          });
        } else {
          cleanedSeason.episodes = [];
        }
        return cleanedSeason;
      });
    }

    // Clean whole data object before saving
    const cleanedData = cleanObject(data);

    const tvSeries = new TVSeries(cleanedData);
    await tvSeries.save();

    return NextResponse.json(
      { message: "TV Series created successfully", data: tvSeries },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tv error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.message,
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
