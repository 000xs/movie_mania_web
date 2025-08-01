// app/movie/[id]/page.js
export const revalidate = 60; // ISR (optional)

export async function generateMetadata({ params }) {
  const { id } = await params;
  const HOST = process.env.NEXT_PUBLIC_HOST || "https://www.moviemanialk.com";

  const res = await fetch(`${HOST}/api/movies/${encodeURIComponent(id)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return {};

  const { results } = await res.json();
  if (!results?.length) return {};

  const m = results[0];

  const title = `${m.title} (${new Date(
    m.releaseDate
  ).getFullYear()}) | Movie Mania`;
  const description = (m.overview || "").slice(0, 160);
  const canonical = `${HOST}/movie/${encodeURIComponent(id)}`;
  const img = m.posterPath?.startsWith("http")
    ? m.posterPath
    : `${HOST}${m.posterPath}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "video.movie",
      title,
      description,
      url: canonical,
      images: [img],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [img],
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Movie",
            name: m.title,
            description: m.overview,
            image: img,
            datePublished: m.releaseDate,
            genre: m.genres,
            url: canonical,
            director: m.crew.find((c) => c.job === "Director"),
            actor: m.cast,
            genre: m.genres,
            datePublished: m.releaseDate,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: m.voteAverage,
              ratingCount: m.voteCount,
            },
            potentialAction: {
              "@type": "WatchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${HOST}/movie/${encodeURIComponent(m._id)}`,
              },
              actionPlatform: [
                "http://schema.org/DesktopWebPlatform",
                "http://schema.org/MobileWebPlatform",
              ],
            },
            subtitle: {
              "@type": "DigitalDocument",
              name: `[${m.title}] Sinhala Subtitle`,
              inLanguage: "si",
              encodingFormat: "application/x-subrip",
              url: m.subtitles[0]?.link,
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.moviemanialk.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Movies",
                item: "https://www.moviemanialk.com/movies/",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: m.name,
                item: canonical,
              },
            ],
          },
        ],
      }),
    },
  };
}
