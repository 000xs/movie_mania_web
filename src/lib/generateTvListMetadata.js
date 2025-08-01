// app/movie/[id]/page.js
export const revalidate = 60; // ISR (optional)
// app/tv/page.tsx or app/tv/metadata.ts (depending on setup)
export const generateMetadata = async () => {
  return {
    title: "TV Series with Sinhala Subtitles (2025) – Stream & Download | MovieMania.lk",
    description: "Watch the newest TV series with Sinhala subtitles in HD. Filter by genre, year, IMDb rating, or search by name. No ads, fast servers, daily updates.",
    keywords: [
      "sinhala subtitles tv series",
      "watch tv shows online sinhala",
      "download sinhala subs",
      "sri lanka tv series",
      "2025 sinhala subtitle",
      "movie mania lk"
    ],
    alternates: {
      canonical: "https://www.moviemanialk.com/tv",
    },
    metadataBase: new URL("https://www.moviemanialk.com"),
    openGraph: {
      type: "website",
      locale: "si_LK",
      url: "https://www.moviemanialk.com/tv",
      title: "TV Series with Sinhala Subtitles (2025) – Stream & Download",
      description: "The biggest collection of TV series with Sinhala subtitles—updated daily.",
      images: [
        {
          url: "https://www.moviemanialk.com/baner.png",
          width: 1200,
          height: 630,
        },
      ],
      siteName: "MovieMania.lk",
    },
    twitter: {
      card: "summary_large_image",
      title: "TV Series with Sinhala Subtitles (2025) – Stream & Download",
      description: "Fast HD streaming & download of every trending series with Sinhala subs.",
      images: ["https://www.moviemanialk.com/baner.png"],
    },
    other: {
      "language": "si",
      "geo.region": "LK",
      "geo.placename": "Sri Lanka",
    }
  };
};
