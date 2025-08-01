// app/sitemap.xml/route.js
import { NextResponse } from 'next/server';

const baseUrl = "https://www.moviemanialk.com";
// lib/sitemap-helpers.ts
 

export async function fetchMovieIds() {
  const res = await fetch(`${baseUrl}/api/movies`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch movie IDs');
  const data = await res.json();
  return data.results.map(m => m.movieId); // ["4951","4592","2865"...]
}

export async function fetchTvSeriesIds() {
  const res = await fetch(`${baseUrl}/api/tv`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch TV series IDs');
  const data = await res.json();
  return data.results.map(t => t.tvseriesId); // ["232402"...]
}

function generateXml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      ({ url, lastModified, changeFrequency, priority }) => `
    <url>
      <loc>${url}</loc>
      <lastmod>${lastModified.toISOString()}</lastmod>
      <changefreq>${changeFrequency}</changefreq>
      <priority>${priority}</priority>
    </url>
  `
    )
    .join('')}
</urlset>`;
}

export async function GET() {
  try {
    const movieIds = await fetchMovieIds();
    const tvSeriesIds = await fetchTvSeriesIds();

    const movieRoutes = movieIds.map((id) => ({
      url: `${baseUrl}/movie/${encodeURIComponent(id)}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    }));

    const tvSeriesRoutes = tvSeriesIds.map((id) => ({
      url: `${baseUrl}/tv/${encodeURIComponent(id)}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    }));

    const staticRoutes = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/tv`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/movie`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ];

    const allUrls = [...staticRoutes, ...movieRoutes, ...tvSeriesRoutes];
    const xml = generateXml(allUrls);

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Fallback to minimal sitemap
    const fallbackXml = generateXml([
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      }
    ]);
    
    return new Response(fallbackXml, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  }
}

// Important: Set revalidation time (in seconds)
export const revalidate = 3600; // Revalidate every hour