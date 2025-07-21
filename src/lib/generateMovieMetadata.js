// lib/movieMeta.js — 100 % server-side, zero React
export async function generateMetadata({ params }) {
  const { id } = await params;
  const HOST = process.env.NEXT_PUBLIC_HOST || "https://www.moviemanialk.com";

  // absolute URL for fetch inside server component
  const res = await fetch(`${HOST}/api/movies/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return {};

  const { results } = await res.json();
  const m = results[0];

  const title = `${m.title} (${new Date(
    m.releaseDate
  ).getFullYear()}) | Movie Mania`;
  const description = (m.overview || "").slice(0, 160);
  const canonical = `${HOST}/movie/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "video.movie",
      title,
      description,
      url: canonical,
      images: [m.posterPath],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [m.posterPath],
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Movie",
        name: m.title,
        description: m.overview,
        image: m.posterPath,
        datePublished: m.releaseDate,
        genre: m.genres,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: m.voteAverage,
          reviewCount: m.voteCount,
        },
        duration: m.runtime,
        trailer: { "@type": "VideoObject", url: canonical },
      }),
    },
  };
}
