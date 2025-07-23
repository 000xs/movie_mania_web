export async function generateMetadata({ params }) {
  const { id, season_number } = await params;
  const HOST = process.env.NEXT_PUBLIC_HOST || "https://www.moviemanialk.com";

  const res = await fetch(`${HOST}/api/tv/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return {};

  const payload = await res.json();
  const series = payload 
  if (!series) return {};

  const season = series.seasons?.find(
    (s) => s.seasonNumber === Number(season_number)
  );
  if (!season) return {};

  const year = season.airDate?.split("-")[0] || "";
  const title = `${series.name} ${season.name} (${year}) – Sinhala Subtitles & Downloads | Movie Mania`;
  const description =
    season.overview
      ?.trim()
      .slice(0, 160)
      .replace(/\s+…?$/, "…") ||
    `Watch or download ${series.name} ${season.name} with Sinhala subtitles.`;
  const canonical = `${HOST}/tv/${id}/season/${season_number}`;
  const imgUrl = `https://image.tmdb.org/t/p/w1280${season.posterPath}`;

  // 3️⃣ Return Next.js metadata object
  return {
    title,
    description,
    alternates: { canonical },

    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: [imgUrl],
    },

    twitter: {
      card: "summary_large_image",
      url: canonical,
      title,
      description,
      images: [imgUrl],
    },

    // 4️⃣ JSON-LD structured data
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TVSeason",
        name: season.name,
        partOfSeries: {
          "@type": "TVSeries",
          name: series.name,
          url: `${HOST}/tv/${id}`,
        },
        seasonNumber: season.seasonNumber,
        numberOfEpisodes: season.episodes?.length || 0,
        datePublished: season.airDate,
        image: imgUrl,
        description: season.overview,
        aggregateRating: series.voteAverage
          ? {
              "@type": "AggregateRating",
              ratingValue: series.voteAverage.toFixed(1),
              reviewCount: series.voteCount || 0,
            }
          : undefined,
        episode:
          season.episodes?.map((ep) => ({
            "@type": "TVEpisode",
            name: ep.name || `Episode ${ep.episodeNumber}`,
            episodeNumber: ep.episodeNumber,
            datePublished: ep.airDate,
            description: ep.overview,
            url: `${canonical}/episode/${ep.episodeNumber}`,
          })) || [],
        potentialAction: {
          "@type": "WatchAction",
          target: canonical,
        },
      }),
    },
  };
}
