// app/api/genres/route.js
import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_API_KEY}`
  }
};

export async function GET() {
  try {
    // Fetch both movie and TV genres from TMDB
    const [movieGenresResponse, tvGenresResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/genre/movie/list`, options),
      fetch(`${TMDB_BASE_URL}/genre/tv/list`, options)
    ]);

    const movieGenresData = await movieGenresResponse.json();
    const tvGenresData = await tvGenresResponse.json();

    // Combine and deduplicate genres
    const allGenres = [...movieGenresData.genres, ...tvGenresData.genres];
    const uniqueGenres = allGenres.reduce((acc, genre) => {
      if (!acc.find(g => g.id === genre.id)) {
        acc.push(genre);
      }
      return acc;
    }, []);

    return NextResponse.json({
      genres: uniqueGenres
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
