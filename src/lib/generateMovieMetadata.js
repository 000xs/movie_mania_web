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
  };
}
