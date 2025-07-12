// app/api/search/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Movie from '@/lib/models/Movie';
import TVSeries from '@/lib/models/TVSeries';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { overview: { $regex: query, $options: 'i' } }
      ]
    };

    const skip = (page - 1) * limit;

    const movies = await Movie.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { overview: { $regex: query, $options: 'i' } }
      ]
    }).limit(limit / 2).skip(skip / 2);

    const tvSeries = await TVSeries.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { overview: { $regex: query, $options: 'i' } }
      ]
    }).limit(limit / 2).skip(skip / 2);

    const results = [
      ...movies.map(movie => ({ ...movie.toObject(), media_type: 'movie' })),
      ...tvSeries.map(tv => ({ ...tv.toObject(), media_type: 'tv' }))
    ];

    const totalMovies = await Movie.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { overview: { $regex: query, $options: 'i' } }
      ]
    });

    const totalTV = await TVSeries.countDocuments({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { overview: { $regex: query, $options: 'i' } }
      ]
    });

    const total = totalMovies + totalTV;

    return NextResponse.json({
      results,
      page,
      total_pages: Math.ceil(total / limit),
      total_results: total
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
