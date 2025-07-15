// app/api/tv/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TVSeries from '@/lib/models/TVSeries';
import { 
  getTVSeriesDetails,
  getTVSeriesCredits,
  getTVSeriesVideos,
  getSimilarTVSeries,
  getTVSeriesRecommendations,
  getTVSeasonDetails,
  getTVEpisodeDetails,
  formatTVSeriesData,
  formatCreditsData
} from '@/lib/tmdb';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'local';
    const includeCredits = searchParams.get('include_credits') === 'true';
    const includeVideos = searchParams.get('include_videos') === 'true';
    const includeSimilar = searchParams.get('include_similar') === 'true';
    const includeRecommendations = searchParams.get('include_recommendations') === 'true';
    const seasonNumber = searchParams.get('season');
    const episodeNumber = searchParams.get('episode');

    // If source is TMDB, fetch from TMDB API
    if (source === 'tmdb') {
      try {
        // If season and episode are specified, get episode details
        if (seasonNumber && episodeNumber) {
          const episodeDetails = await getTVEpisodeDetails(params.id, seasonNumber, episodeNumber);
          
          if (!episodeDetails) {
            return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
          }

          return NextResponse.json({
            ...episodeDetails,
            source: 'tmdb',
            type: 'episode'
          });
        }

        // If only season is specified, get season details
        if (seasonNumber) {
          const seasonDetails = await getTVSeasonDetails(resolvedParams.id, seasonNumber);
          
          if (!seasonDetails) {
            return NextResponse.json({ error: 'Season not found' }, { status: 404 });
          }

          return NextResponse.json({
            ...seasonDetails,
            source: 'tmdb',
            type: 'season'
          });
        }

        // Get TV series details
        const tvSeriesDetails = await getTVSeriesDetails(resolvedParams.id);
        
        if (!tvSeriesDetails) {
          return NextResponse.json({ error: 'TV Series not found' }, { status: 404 });
        }

        let response = {
          ...tvSeriesDetails,
          formatted: formatTVSeriesData(tvSeriesDetails),
          source: 'tmdb',
          type: 'series'
        };

        // Include additional data if requested
        if (includeCredits) {
          const credits = await getTVSeriesCredits(resolvedParams.id);
          response.credits = formatCreditsData(credits);
        }

        if (includeVideos) {
          const videos = await getTVSeriesVideos(resolvedParams.id);
          response.videos = videos;
        }

        if (includeSimilar) {
          const similar = await getSimilarTVSeries(resolvedParams.id);
          response.similar = similar.map(tvSeries => formatTVSeriesData(tvSeries));
        }

        if (includeRecommendations) {
          const recommendations = await getTVSeriesRecommendations(resolvedParams.id);
          response.recommendations = recommendations.map(tvSeries => formatTVSeriesData(tvSeries));
        }

        return NextResponse.json(response);
      } catch (tmdbError) {
        console.error('TMDB API Error:', tmdbError);
        return NextResponse.json({ error: 'Failed to fetch TV series from TMDB' }, { status: 500 });
      }
    }

    // Local database query (default behavior)
    await connectDB();
    const tvSeries = await TVSeries.findOne({ tvseriesId: resolvedParams.id });
    
    
    if (!tvSeries) {
      return NextResponse.json({ error: 'TV Series not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      ...tvSeries.toObject(),
      source: 'local'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const data = await request.json();
    
    const tvSeries = await TVSeries.findByIdAndUpdate(resolvedParams.id, data, { new: true });
    
    if (!tvSeries) {
      return NextResponse.json({ error: 'TV Series not found' }, { status: 404 });
    }
    
    return NextResponse.json(tvSeries);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  try {
    await connectDB();
    const tvSeries = await TVSeries.findByIdAndDelete(id);
    
    if (!tvSeries) {
      return NextResponse.json({ error: 'TV Series not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'TV Series deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
