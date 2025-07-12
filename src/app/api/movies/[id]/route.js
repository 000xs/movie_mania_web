// app/api/movies/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Movie from '@/lib/models/Movie';
import { 
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getMovieRecommendations,
  formatMovieData,
  formatCreditsData,
  getImageUrl,
  getBackdropUrl
} from '@/lib/tmdb-server';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'local';
    const includeCredits = searchParams.get('include_credits') === 'true';
    const includeVideos = searchParams.get('include_videos') === 'true';
    const includeSimilar = searchParams.get('include_similar') === 'true';
    const includeRecommendations = searchParams.get('include_recommendations') === 'true';

    // If source is TMDB, fetch from TMDB API
    if (source === 'tmdb') {
      try {
        const movieDetails = await getMovieDetails(resolvedParams.id);
        
        if (!movieDetails) {
          console.log('Movie not found in TMDB, falling back to local database');
          // Fall back to local database if not found in TMDB
        } else {
          let response = {
            ...movieDetails,
            formatted: formatMovieData(movieDetails),
            source: 'tmdb'
          };

          // Include additional data if requested
          if (includeCredits) {
            try {
              const credits = await getMovieCredits(resolvedParams.id);
              response.credits = formatCreditsData(credits);
            } catch (creditsError) {
              console.warn('Failed to fetch credits from TMDB:', creditsError.message);
            }
          }

          if (includeVideos) {
            try {
              const videos = await getMovieVideos(resolvedParams.id);
              response.videos = videos;
            } catch (videosError) {
              console.warn('Failed to fetch videos from TMDB:', videosError.message);
            }
          }

          if (includeSimilar) {
            try {
              const similar = await getSimilarMovies(resolvedParams.id);
              response.similar = similar.map(movie => formatMovieData(movie));
            } catch (similarError) {
              console.warn('Failed to fetch similar movies from TMDB:', similarError.message);
            }
          }

          if (includeRecommendations) {
            try {
              const recommendations = await getMovieRecommendations(resolvedParams.id);
              response.recommendations = recommendations.map(movie => formatMovieData(movie));
            } catch (recommendationsError) {
              console.warn('Failed to fetch recommendations from TMDB:', recommendationsError.message);
            }
          }

          return NextResponse.json(response);
        }
      } catch (tmdbError) {
        console.error('TMDB API Error, falling back to local database:', tmdbError.message);
        // Fall back to local database if TMDB fails
      }
    }

    // Local database query (default behavior)
    await connectDB();
    
    let movie = null;
    
    movie = await Movie.findOne({ movieId: resolvedParams.id });
    
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    // Format the response to match the expected structure
    const movieData = movie.toObject();
    
    // Ensure downloads and subtitles arrays exist
    if (!movieData.downloads) {
      movieData.downloads = [];
    }
    if (!movieData.subtitles) {
      movieData.subtitles = [];
    }
    
    // Return data in the expected paginated format
    return NextResponse.json({
      results: [movieData],
      page: 1,
      total_pages: 1,
      total_results: 1,
      source: 'local'
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    await connectDB();
    const data = await request.json();
    
    // Helper to check if a string is a relative path (starts with /)
    const isRelativePath = (path) => path && path.startsWith('/');

    // Process posterPath and backdropPath to ensure full URLs are saved
    if (data.posterPath && isRelativePath(data.posterPath)) {
      data.posterPath = getImageUrl(data.posterPath);
    }
    if (data.backdropPath && isRelativePath(data.backdropPath)) {
      data.backdropPath = getBackdropUrl(data.backdropPath);
    }

    const movie = await Movie.findOneAndUpdate({ movieId: resolvedParams.id }, data, { new: true });
    
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    return NextResponse.json(movie);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    await connectDB();
    const movie = await Movie.findOneAndDelete({ movieId: resolvedParams.id });
    
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
