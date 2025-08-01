// Next.js 15 App Router – 100 % server-side
export async function generateMetadata({ params }) {
  const { id } = await params; // async params (Next 15+)
  const HOST = process.env.NEXT_PUBLIC_HOST || "https://www.moviemanialk.com";

  // Fetch series safely
  const res = await fetch(`${HOST}/api/tv/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return {};

  const payload = await res.json();
  const series = payload;
  if (!series) return {};

  // Core strings
  const year = series.firstAirDate
    ? new Date(series.firstAirDate).getFullYear()
    : "";
  const title = `${series.name} (${year}) – Sinhala Subtitles & Download | Movie Mania`;
  const description =
    (series.overview || "")
      .trim()
      .slice(0, 160)
      .replace(/\s+…?$/, "…") ||
    `Watch or download ${series.name} with Sinhala subtitles.`;
  const canonical = `${HOST}/tv/${id}`;

  // Return Next.js metadata object
  return {
    title,
    description,
    alternates: { canonical },

    openGraph: {
      type: "video.tv_show",
      title,
      description,
      url: canonical,
      images: [series.posterPath],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [series.posterPath],
    },

    
  };
}
