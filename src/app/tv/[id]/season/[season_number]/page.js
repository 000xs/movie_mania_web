"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Star,
  Calendar,
  Clock,
  CameraOff,
} from "lucide-react";
import Head from "next/head";

export default function SeasonPage({ params }) {
  const [resolvedParams, setResolvedParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

   
  useEffect(() => {
    (async () => {
      const p = await params;
      setResolvedParams(p);
      const res = await fetch(`/api/tv/${p.id}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    })();
  }, [params]);

  
  useEffect(() => {
    if (!data || !resolvedParams) return;
    const { id, season_number } = resolvedParams;
    const season = data.seasons?.find(
      (s) => s.seasonNumber === Number(season_number)
    );
    if (!season) return;

    
    document.title = `${data.name} ${season.name} (${
      season.airDate?.split("-")[0] || ""
    }) – Sinhala Subtitles & Downloads | Movie Mania`;

    const desc = (season.overview || "")
      .substring(0, 160)
      .trim()
      .replace(/\s+…?$/, "…");
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = desc;

 
    const baseUrl = `https://www.moviemanialk.com/tv/${id}/season/${season.seasonNumber}`;
    const imgUrl = `https://image.tmdb.org/t/p/w1280${season.posterPath}`;
    const ogTags = [
      { sel: 'meta[property="og:title"]', val: `${data.name} ${season.name}` },
      { sel: 'meta[property="og:description"]', val: desc },
      { sel: 'meta[property="og:url"]', val: baseUrl },
      { sel: 'meta[property="og:image"]', val: imgUrl },
      { sel: 'meta[name="twitter:title"]', val: `${data.name} ${season.name}` },
      { sel: 'meta[name="twitter:description"]', val: desc },
      { sel: 'meta[name="twitter:image"]', val: imgUrl },
    ];
    ogTags.forEach(({ sel, val }) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute("content", val);
    });

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = baseUrl;

     
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "TVSeason",
      name: season.name,
      partOfSeries: {
        "@type": "TVSeries",
        name: data.name,
        url: `https://www.moviemanialk.com/tv/${id}`,
      },
      seasonNumber: season.seasonNumber,
      numberOfEpisodes: season.episodes?.length || 0,
      datePublished: season.airDate,
      image: imgUrl,
      description: season.overview,
      aggregateRating: data.voteAverage
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(data.voteAverage.toFixed(1)),
            reviewCount: data.voteCount || 0,
          }
        : undefined,
      episode:
        season.episodes?.map((ep) => ({
          "@type": "TVEpisode",
          name: ep.name || `Episode ${ep.episodeNumber}`,
          episodeNumber: ep.episodeNumber,
          datePublished: ep.airDate,
          description: ep.overview,
          url: `${baseUrl}/episode/${ep.episodeNumber}`,
        })) || [],
    };
    const prev = document.querySelector('script[type="application/ld+json"]');
    if (prev) prev.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }, [data, resolvedParams]);
 
  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!data || !resolvedParams)
    return <p className="text-white p-6">Season not found</p>;

  const { id, season_number } = resolvedParams;
  const season = data.seasons?.find(
    (s) => s.seasonNumber === Number(season_number)
  );
  if (!season) return <p className="text-white p-6">Season not found</p>;

  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Head>
        {/* --- BASIC --- */}
        <title>
          {`${data.name} ${season.name} (${
            season.year || ""
          }) – Sinhala Subtitles & Downloads | Movie Mania`}
        </title>
        <meta
          name="description"
          content={
            season.overview
              ? `${season.overview.substring(0, 160).trim()}…`
              : `Watch or download ${data.name} ${season.name} with Sinhala subtitles.`
          }
        />
        <link
          rel="canonical"
          href={`https://www.moviemanialk.com/tv/${id}/season/${season.seasonNumber}`}
        />

        {/* --- OPEN-GRAPH / FACEBOOK --- */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://www.moviemanialk.com/tv/${id}/season/${season.seasonNumber}`}
        />
        <meta
          property="og:title"
          content={`${data.name} ${season.name} – Sinhala Sub & Download`}
        />
        <meta
          property="og:description"
          content={
            season.overview
              ? `${season.overview.substring(0, 160).trim()}…`
              : `Full season available to stream or download with Sinhala subtitles.`
          }
        />
        <meta
          property="og:image"
          content={`https://image.tmdb.org/t/p/w1280${season.posterPath}`}
        />

        {/* --- TWITTER --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:url"
          content={`https://www.moviemanialk.com/tv/${id}/season/${season.seasonNumber}`}
        />
        <meta
          name="twitter:title"
          content={`${data.name} ${season.name} – Sinhala Sub & Download`}
        />
        <meta
          name="twitter:description"
          content={
            season.overview
              ? `${season.overview.substring(0, 160).trim()}…`
              : `Watch or download with Sinhala subtitles.`
          }
        />
        <meta
          name="twitter:image"
          content={`https://image.tmdb.org/t/p/w1280${season.posterPath}`}
        />

        {/* --- JSON-LD structured data --- */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TVSeason",
              name: season.name,
              partOfSeries: {
                "@type": "TVSeries",
                name: data.name,
                url: `https://www.moviemanialk.com/tv/${id}`,
              },
              seasonNumber: season.seasonNumber,
              numberOfEpisodes: season.episodes?.length || 0,
              datePublished: season.airDate,
              image: `https://image.tmdb.org/t/p/w1280${season.posterPath}`,
              description: season.overview,
              aggregateRating: data.voteAverage
                ? {
                    "@type": "AggregateRating",
                    ratingValue: data.voteAverage.toFixed(1),
                    reviewCount: data.voteCount || 0,
                  }
                : undefined,
              episode: season.episodes?.map((ep) => ({
                "@type": "TVEpisode",
                name: ep.name || `Episode ${ep.episodeNumber}`,
                episodeNumber: ep.episodeNumber,
                datePublished: ep.airDate,
                description: ep.overview,
                url: `https://www.moviemanialk.com/tv/${id}/season/${season.seasonNumber}/episode/${ep.episodeNumber}`,
              })),
              potentialAction: {
                "@type": "WatchAction",
                target: `https://www.moviemanialk.com/tv/${id}/season/${season.seasonNumber}`,
              },
            }),
          }}
        />
      </Head>

      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between px-6 py-4">
          <Link
            href={`/tv/${id}`}
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to {data.name}</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w1280${data.backdropPath})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        <div className="relative z-10 px-6 max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 items-center">
          <Image
            src={`https://image.tmdb.org/t/p/w500${season.posterPath}`}
            alt={season.name}
            width={300}
            height={450}
            className="rounded-lg shadow-2xl"
          />
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-5xl font-bold">{data.name } {season.name} </h1>
            <div className="flex space-x-4 text-sm">
              <span className="flex items-center space-x-1">
                <Star className="w-4 text-yellow-400" />{" "}
                {data.voteAverage?.toFixed(1)}
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4" /> {season.airDate?.split("T")[0]}
              </span>
              <span className="px-2 py-1 bg-blue-700 text-xs rounded">
                {season.episodes?.length || 0} Episodes
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed">{season.overview}</p>
          </div>
        </div>
      </section>

      {/* Episodes */}
      {/* Episodes */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Episodes</h2>
        <div className="space-y-6">
          {season.episodes.map((ep) => {
            // Handle missing data
            const hasDownloads = ep.downloads?.length > 0;
            const hasSubtitles = ep.subtitles?.length > 0;
            const runtime =
              ep.runtime > 0
                ? `${ep.runtime} min`
                : data.episodeRunTime?.[0]
                ? `${data.episodeRunTime[0]} min`
                : "N/A";
            const airDate = ep.airDate
              ? new Date(ep.airDate).toLocaleDateString()
              : "TBA";

            return (
              <div
                key={ep.episodeNumber || ep._id}
                className="bg-gray-900/50 rounded-lg p-6"
              >
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Image with placeholder handling */}
                  <div className="relative aspect-video md:aspect-auto bg-gray-800 rounded flex items-center justify-center">
                    {ep.stillPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${ep.stillPath}`}
                        alt={ep.name || `Episode ${ep.episodeNumber}`}
                        width={420}
                        height={180}
                        className="rounded w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500 text-center p-4">
                        <div className="bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CameraOff className="w-8 h-8" />
                        </div>
                        <p>No image available</p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3 space-y-3">
                    <h1 className="text-2xl font-semibold">
                      {`${data.name} - Season ${season.seasonNumber} Episode${ep.episodeNumber} Sinhala Subtitle Download`}
                    </h1>
                    <h3 className="text-xl font-semibold">
                      {ep.episodeNumber ? `${ep.episodeNumber}. ` : ""}
                      {ep.name || `Episode ${ep.episodeNumber}`}
                    </h3>

                    <div className="text-sm text-gray-400">
                      {runtime} • {airDate}
                    </div>

                    <p className="text-gray-300 line-clamp-3">
                      {ep.overview || "No description available."}
                    </p>

                    {/* Downloads & Subtitles - only render if data exists */}
                    {(hasDownloads || hasSubtitles) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {hasDownloads && (
                          <div className="bg-black/40 p-4 rounded-xl border border-red-600/50">
                            <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center">
                              <Download className="w-5 h-5 mr-2" />
                              Available Downloads
                            </h3>
                            <div className="space-y-4">
                              {ep.downloads
                                .filter((d) => d.downloadType && d.link)
                                .reduce((acc, download) => {
                                  const existing = acc.find(
                                    (g) => g.type === download.downloadType
                                  );

                                  if (existing) {
                                    existing.items.push(download);
                                  } else {
                                    acc.push({
                                      type: download.downloadType,
                                      items: [download],
                                    });
                                  }
                                  return acc;
                                }, [])
                                .map((group, index) => (
                                  <div
                                    key={index}
                                    className="bg-black/30 p-4 rounded-lg border border-red-700/50"
                                  >
                                    <h4 className="font-bold mb-3 text-red-300">
                                      {group.type}
                                    </h4>
                                    <div className="space-y-3">
                                      {group.items.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-red-900/20 p-3 rounded-md border border-red-800/50 gap-3"
                                        >
                                          <div>
                                            <p className="text-white font-medium text-sm">
                                              {item.quality ||
                                                "Standard Quality"}
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                              {item.videoType || "MP4"}
                                            </p>
                                          </div>
                                          <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-white text-xs font-semibold transition-colors text-center"
                                          >
                                            Download
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {hasSubtitles && (
                          <div className="bg-black/40 p-4 rounded-xl border border-blue-600/50">
                            <h4 className="text-base font-semibold mb-3 text-blue-400 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Available Subtitles
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {ep.subtitles
                                .filter((sub) => sub.language && sub.url)
                                .map((sub, idx) => (
                                  <a
                                    key={idx}
                                    href={sub.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-blue-900/30 p-2 rounded text-xs hover:bg-blue-900/40 text-center truncate"
                                    title={sub.language}
                                  >
                                    {sub.language}
                                  </a>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
