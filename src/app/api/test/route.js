// Test API endpoint to verify connections
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getTrendingMovies } from '@/lib/tmdb-server';

export async function GET() {
  try {
    // Test database connection
    let dbStatus = 'disconnected';
    try {
      await connectDB();
      dbStatus = 'connected';
    } catch (dbError) {
      console.error('Database connection error:', dbError);
    }

    // Test TMDB API connection
    let tmdbStatus = 'disconnected';
    let tmdbData = null;
    try {
      const movies = await getTrendingMovies();
      if (movies && movies.length > 0) {
        tmdbStatus = 'connected';
        tmdbData = {
          count: movies.length,
          firstMovie: movies[0]?.title || 'Unknown'
        };
      }
    } catch (tmdbError) {
      console.error('TMDB API error:', tmdbError);
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      connections: {
        database: dbStatus,
        tmdb: tmdbStatus
      },
      tmdbData,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasTmdbKey: !!process.env.NEXT_PUBLIC_TMDB_API_KEY
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!botToken || !channelId) {
      return NextResponse.json({ status: 'error', message: 'Telegram bot not configured' }, { status: 500 });
    }

    const envData = {
      TEST_VAR: 'test_value',
      ANOTHER_VAR: 'another_test_value'
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/env-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ env: envData }),
    });

    const data = await response.json();

    return NextResponse.json({
      status: 'success',
      message: 'Test POST request to /api/env-submit successful',
      response: data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error testing /api/env-submit:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
