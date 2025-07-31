// app/api/movies/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/lib/models/Movie";
import { randomInt } from 'crypto';
import { 
  getPopularMovies as getTMDBPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  discoverMovies,
  formatMovieData,
  getImageUrl,
  getBackdropUrl
} from "@/lib/tmdb-server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const genre = searchParams.get("genre");
    const sortBy = searchParams.get("sort_by") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const category = searchParams.get("category"); // New parameter for TMDB categories
    const source = searchParams.get("source") || "local"; // 'local' or 'tmdb'

    // If source is TMDB, fetch from TMDB API
    if (source === "tmdb") {
      try {
        let tmdbResults = [];
        
        switch (category) {
          case "trending":
            tmdbResults = await getTrendingMovies();
            break;
          case "popular":
            tmdbResults = await getTMDBPopularMovies();
            break;
          case "top_rated":
            tmdbResults = await getTopRatedMovies();
            break;
          case "upcoming":
            tmdbResults = await getUpcomingMovies();
            break;
          case "now_playing":
            tmdbResults = await getNowPlayingMovies();
            break;
          case "discover":
            const filters = {};
            if (genre) filters.with_genres = genre;
            if (searchParams.get("year")) filters.year = searchParams.get("year");
            if (searchParams.get("sort_by")) filters.sort_by = searchParams.get("sort_by");
            tmdbResults = await discoverMovies(filters);
            break;
          default:
            tmdbResults = await getTMDBPopularMovies();
        }

        // Format the results
        const formattedResults = tmdbResults.map(movie => formatMovieData(movie));
        
        return NextResponse.json({
          results: formattedResults,
          page: 1,
          total_pages: 1,
          total_results: formattedResults.length,
          source: "tmdb"
        });
      } catch (tmdbError) {
        console.error("TMDB API Error:", tmdbError);
        // Fall back to local database if TMDB fails
      }
    }

    // Local database query (default behavior)
    await connectDB();
    
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { overview: { $regex: search, $options: "i" } },
        { originalTitle: { $regex: search, $options: "i" } },
      ];
    }

    if (genre) {
      query.genres = { $in: [genre] };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === "desc" ? -1 : 1;

    const movies = await Movie.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Movie.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      results: movies,
      page,
      total_pages: totalPages,
      total_results: total,
      source: "local"
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Generate a secure unique 4-digit ID using Mongoose
async function generateUnique4DigitId() {
  let unique = false;
  let customId = "";

  while (!unique) {
    customId = randomInt(1000, 10000).toString();
    const exists = await Movie.findOne({ movieId: customId });
    if (!exists) {
      unique = true;
    }
  }

  return customId;
}

export async function POST(request) {
  try {
    const db = await connectDB();
    const data = await request.json();
    console.log('Received movie data:', data);

    // Generate and assign a unique 4-digit movieId
    const customId = await generateUnique4DigitId(db);
    const movieId = data.title ? data.title.replace(/\s/g, '-') + "-" + customId : customId;
    data.movieId = data.title ? data.title.replace(/\s/g, '-') + "-" + customId : customId;

    // Helper to check if a string is a relative path (starts with /)
    const isRelativePath = (path) => path && path.startsWith('/');

    // Process posterPath and backdropPath to ensure full URLs are saved
    if (data.posterPath && isRelativePath(data.posterPath)) {
      data.posterPath = getImageUrl(data.posterPath);
    }
    if (data.backdropPath && isRelativePath(data.backdropPath)) {
      data.backdropPath = getBackdropUrl(data.backdropPath);
    }

    // Ensure downloads is properly formatted as an array
    if (data.downloads) {
      if (!Array.isArray(data.downloads)) {
        data.downloads = [];
      }

      // Flatten downloads so each link becomes its own download object matching schema
      const flattenedDownloads = data.downloads.filter(download => 
        (typeof download.downloadType === 'string' && ['DIRECT', 'TELEGRAM', 'DRIVE'].includes(download.downloadType.toUpperCase())) &&
        (typeof download.videoType === 'string' && download.videoType.trim() !== '') &&
        (typeof download.link === 'string' || Array.isArray(download.links))
      ).flatMap(download => {
        if (typeof download.link === 'string' && download.link.trim() !== '') {
          return [{
            downloadType: download.downloadType.toUpperCase(),
            videoType: download.videoType.trim(),
            quality: download.quality,
            link: download.link.trim()
          }];
        } else if (Array.isArray(download.links)) {
          return download.links.filter(link =>
            typeof link === 'object' &&
            typeof link.url === 'string' &&
            link.url.trim() !== ''
          ).map(link => ({
            downloadType: download.downloadType.toUpperCase(),
            videoType: download.videoType.trim(),
            quality: download.quality,
            link: link.url.trim()
          }));
        }
        return [];
      });

      data.downloads = flattenedDownloads;
    }

    // Ensure subtitles is properly formatted as an array
    if (data.subtitles) {
      if (typeof data.subtitles === 'string') {
        try {
          data.subtitles = JSON.parse(data.subtitles);
        } catch (parseError) {
          console.error('Failed to parse subtitles JSON:', parseError);
          data.subtitles = [];
        }
      }
      if (!Array.isArray(data.subtitles)) {
        data.subtitles = [];
      } else {
        data.subtitles = data.subtitles.filter(subtitle => 
          subtitle && 
          typeof subtitle === 'object' && 
          subtitle.language && typeof subtitle.language === 'string' && subtitle.language.trim() !== '' &&
          subtitle.language && 
          subtitle.url &&
          typeof subtitle.url === 'string'
        );
      }
    } else {
      data.subtitles = [];
    }    

    // Ensure cast is properly formatted as an array
    if (data.cast) {
      if (typeof data.cast === 'string') {
        try {
          data.cast = JSON.parse(data.cast);
        } catch (parseError) {
          console.error('Failed to parse cast JSON:', parseError);
          data.cast = [];
        }
      }
      if (!Array.isArray(data.cast)) {
        data.cast = [];
      } else {
        data.cast = data.cast.filter(member => 
          member && 
          typeof member === 'object' && 
          member.name
        ).map(member => ({
          ...member,
          profilePath: member.profilePath && isRelativePath(member.profilePath) 
            ? getImageUrl(member.profilePath) 
            : member.profilePath
        }));
      }
    } else {
      data.cast = [];
    }

    // Ensure crew is properly formatted as an array
    if (data.crew) {
      if (typeof data.crew === 'string') {
        try {
          data.crew = JSON.parse(data.crew);
        } catch (parseError) {
          console.error('Failed to parse crew JSON:', parseError);
          data.crew = [];
        }
      }
      if (!Array.isArray(data.crew)) {
        data.crew = [];
      } else {
        data.crew = data.crew.filter(member => 
          member && 
          typeof member === 'object' && 
          member.name
        ).map(member => ({
          ...member,
          profilePath: member.profilePath && isRelativePath(member.profilePath) 
            ? getImageUrl(member.profilePath) 
            : member.profilePath
        }));
      }
    } else {
      data.crew = [];
    }

    // Ensure other array fields are properly formatted
    const arrayFields = ['genres', 'productionCompanies', 'productionCountries', 'spokenLanguages'];
    arrayFields.forEach(field => {
      if (data[field]) {
        if (typeof data[field] === 'string') {
          try {
            data[field] = JSON.parse(data[field]);
          } catch (parseError) {
            console.error(`Failed to parse ${field} JSON:`, parseError);
            data[field] = [];
          }
        }
        if (!Array.isArray(data[field])) {
          data[field] = [];
        }
      } else {
        data[field] = [];
      }
    });

    // Log the processed data for debugging
    console.log('Processed movie data for saving:', {
      movieId: data.movieId,
      title: data.title,
      downloads: data.downloads,
      subtitles: data.subtitles,
      cast: data.cast,
      crew: data.crew,
      genres: data.genres,
      posterPath: data.posterPath,
      backdropPath: data.backdropPath
    });

    // Create and save the movie
    const movie = new Movie(data);
    await movie.save();

    return NextResponse.json(
      { message: "Movie created successfully", movieId: movieId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Full error details:', error);
    
    if (error.name === "ValidationError") {
      console.error("Validation error:", error);
      console.error("Validation error details:", JSON.stringify(error.errors, null, 2));
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.message,
        errors: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
