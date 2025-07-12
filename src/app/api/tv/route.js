// app/api/tv/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TVSeries from '@/lib/models/TVSeries';
import { 
  getPopularTVSeries,
  getTrendingTvSeries,
  getTopRatedTVSeries,
  getAiringTodayTVSeries,
  getOnTheAirTVSeries,
  discoverTVSeries,
} from "@/lib/tmdb";
import { 
  getTVSeriesDetails as getTVSeriesDetailsFromServer, 
  getTVSeriesCredits, 
  formatTVSeriesDataForServer 
} from "@/lib/tmdb-server";
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');
    const sortBy = searchParams.get('sort_by') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const category = searchParams.get('category'); // New parameter for TMDB categories
    const source = searchParams.get('source') || 'local'; // 'local' or 'tmdb'

    // If source is TMDB, fetch from TMDB API
    if (source === 'tmdb') {
      try {
        let tmdbResults = [];
        
        switch (category) {
          case 'trending':
            tmdbResults = await getTrendingTvSeries();
            break;
          case 'popular':
            tmdbResults = await getPopularTVSeries();
            break;
          case 'top_rated':
            tmdbResults = await getTopRatedTVSeries();
            break;
          case 'airing_today':
            tmdbResults = await getAiringTodayTVSeries();
            break;
          case 'on_the_air':
            tmdbResults = await getOnTheAirTVSeries();
            break;
          case 'discover':
            const filters = {};
            if (genre) filters.with_genres = genre;
            if (searchParams.get('year')) filters.first_air_date_year = searchParams.get('year');
            if (searchParams.get('sort_by')) filters.sort_by = searchParams.get('sort_by');
            tmdbResults = await discoverTVSeries(filters);
            break;
          default:
            tmdbResults = await getPopularTVSeries();
        }

        // Format the results
        const formattedResults = tmdbResults.map(tvSeries => formatTVSeriesDataForServer(tvSeries));
        
        return NextResponse.json({
          results: formattedResults,
          page: 1,
          total_pages: 1,
          total_results: formattedResults.length,
          source: 'tmdb'
        });
      } catch (tmdbError) {
        console.error('TMDB API Error:', tmdbError);
        // Fall back to local database if TMDB fails
      }
    }

    // Local database query (default behavior)
    await connectDB();
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { overview: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      query.genres = { $in: [genre] };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

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
      source: 'local'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    let data = await request.json();

    // Check if TMDB ID or URL is provided
    if (data.tmdbId || data.tmdbUrl) {
      let tmdbId = data.tmdbId;
      if (data.tmdbUrl) {
        const match = data.tmdbUrl.match(/(?:movie|tv)\/(\d+)/);
        tmdbId = match ? match[1] : null;
      }

      if (tmdbId) {
        // Fetch TV series details from TMDB
        const tvSeriesDetails = await getTVSeriesDetailsFromServer(tmdbId);

        if (!tvSeriesDetails) {
          return NextResponse.json({ error: "TV series not found on TMDB" }, { status: 404 });
        }

        const credits = await getTVSeriesCredits(tmdbId);

        // Format the data
        data = {
          ...tvSeriesDetails,
          ...data, // Keep any other data passed in the request
          name: tvSeriesDetails.name,
          overview: tvSeriesDetails.overview,
          posterPath: tvSeriesDetails.poster_path,
          backdropPath: tvSeriesDetails.backdrop_path,
          firstAirDate: tvSeriesDetails.first_air_date,
          voteAverage: tvSeriesDetails.vote_average,
          genres: tvSeriesDetails.genres?.map(genre => genre.name) || [],
          cast: credits.cast?.map(member => ({ name: member.name, character: member.character, profilePath: member.profile_path })) || [],
          crew: credits.crew?.map(member => ({ name: member.name, job: member.job, department: member.department, profilePath: member.profile_path })) || [],
          episodeRunTime: tvSeriesDetails.episode_run_time || [],
          networks: tvSeriesDetails.networks?.map(network => ({ name: network.name, id: network.id, logoPath: network.logo_path, originCountry: network.origin_country })) || [],
          seasons: tvSeriesDetails.seasons?.map(season => ({
            ...season,
            episodes: (season.episodes || []).map(episode => ({
              episodeId: uuidv4(),
              ...episode,
              downloads: [],
              subtitles: []
            }))
          })) || [],
        };
      }
    }

    // Ensure downloads is properly formatted as an array
    if (data.downloads) {
      // If downloads is a string, try to parse it as JSON
      if (typeof data.downloads === 'string') {
        try {
          data.downloads = JSON.parse(data.downloads);
        } catch (parseError) {
          console.error('Failed to parse downloads JSON:', parseError);
          data.downloads = [];
        }
      }
      
      // Ensure it's an array and filter out invalid entries
      if (!Array.isArray(data.downloads)) {
        data.downloads = [];
      } else {
        data.downloads = data.downloads.filter(download => 
          download && 
          typeof download === 'object' && 
          download.quality &&
          download.format &&
          download.url
        );
      }
    } else {
      data.downloads = [];
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
          subtitle.language && 
          subtitle.url
        );
      }
    } else {
      data.subtitles = [];
    }

    // Ensure cast is properly formatted as an array of objects
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
        data.cast = data.cast.map(member => {
          if (typeof member === 'string') {
            return { name: member };
          }
          return member && typeof member === 'object' && member.name ? member : null;
        }).filter(Boolean);
      }
    } else {
      data.cast = [];
    }

    // Ensure crew is properly formatted as an array of objects
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
        data.crew = data.crew.map(member => {
          if (typeof member === 'string') {
            return { name: member };
          }
          return member && typeof member === 'object' && member.name ? member : null;
        }).filter(Boolean);
      }
    } else {
      data.crew = [];
    }

    // Ensure networks is properly formatted as an array of objects
    if (data.networks) {
      if (typeof data.networks === 'string') {
        try {
          data.networks = JSON.parse(data.networks);
        } catch (parseError) {
          console.error('Failed to parse networks JSON:', parseError);
          data.networks = [];
        }
      }
      if (!Array.isArray(data.networks)) {
        data.networks = [];
      } else {
        data.networks = data.networks.map(network => {
          if (typeof network === 'string') {
            return { name: network };
          }
          return network && typeof network === 'object' && network.name ? network : null;
        }).filter(Boolean);
      }
    } else {
      data.networks = [];
    }

    // Ensure other array fields are properly formatted
    const arrayFields = ['genres', 'episodeRunTime', 'productionCompanies', 'productionCountries', 'spokenLanguages', 'seasons'];
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
    console.log('Processed TV series data:', {
      name: data.name,
      downloads: data.downloads,
      downloadsType: typeof data.downloads,
      downloadsLength: Array.isArray(data.downloads) ? data.downloads.length : 'not array'
    });
    
    const tvSeries = new TVSeries(data);
    await tvSeries.save();
    
    return NextResponse.json(
      { message: "TV Series created successfully", data: tvSeries },
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
