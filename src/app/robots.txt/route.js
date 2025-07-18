// app/robots.txt/route.js
import { NextResponse } from 'next/server';

export const revalidate = 3600; // optional: re-cache every hour

export async function GET() {
  const robots = `
User-agent: *
Allow: /
Disallow: /api/*
Disallow: /dashboard/*
Disallow: /_next/*
Disallow: /404
Disallow: /500

Sitemap: https://www.moviemanialk.com/sitemap.xml
`.trim(); // .trim() removes leading/trailing whitespace

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
    },
  });
}