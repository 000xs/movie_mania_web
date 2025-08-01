// app/movie/[id]/page.js
export const revalidate = 60; // ISR (optional)

export const generateMetadata = async () => {
  return {
    title:
      "Movies with Sinhala Subtitles (2025) – Watch & Download HD | MovieMania.lk",
    description:
      "Browse 10 000+ movies with Sinhala subtitles. Filter by genre, year or IMDb rating. Fast HD stream or direct download—100 % free, updated daily.",
    keywords: [
      "sinhala subtitles movies",
      "watch movies online sinhala",
      "download sinhala subs",
      "2025 sinhala subtitles",
      "sri lanka movie site",
    ],
    alternates: {
      canonical: "https://www.moviemanialk.com/movie",
    },
    metadataBase: new URL("https://www.moviemanialk.com"),
    openGraph: {
      type: "website",
      locale: "si_LK",
      url: "https://www.moviemanialk.com/movie",
      title: "Movies with Sinhala Subtitles (2025) – Watch & Download HD",
      description:
        "The largest collection of HD movies with Sinhala subtitles—updated every hour.",
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
      title: "Movies with Sinhala Subtitles (2025) – Watch & Download HD",
      description:
        "Stream or download every trending movie with Sinhala subtitles. No sign-up.",
      images: ["https://www.moviemanialk.com/baner.png"],
    },
    robots: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    other: {
      language: "si",
      "geo.region": "LK",
      "geo.placename": "Sri Lanka",
    },
  };
};
