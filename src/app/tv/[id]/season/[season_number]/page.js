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
} from "lucide-react";

export default function SeasonPage({ params }) {
  /* ---------- Next.js 15 async params ---------- */
  const [resolvedParams, setResolvedParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- resolve params once ---------- */
  useEffect(() => {
    (async () => {
      const p = await params; // ← await the Promise
      setResolvedParams(p);
      const res = await fetch(`/api/tv/${p.id}`);
      setData(await res.json());
      setLoading(false);
    })();
  }, [params]);

  /* ---------- render ---------- */
  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!resolvedParams || !data)
    return <p className="text-white p-6">Season not found</p>;

  const { id, season_number } = resolvedParams;
  const season = data.seasons.find(
    (s) => s.seasonNumber === Number(season_number)
  );
  if (!season) return <p className="text-white p-6">Season not found</p>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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
            <h1 className="text-5xl font-bold">{season.name}</h1>
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
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Episodes</h2>
        <div className="space-y-6">
          {season.episodes.map((ep) => (
            <div
              key={ep.episodeNumber}
              className="bg-gray-900/50 rounded-lg p-6"
            >
              <div className="grid md:grid-cols-4 gap-6">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${ep.stillPath}`}
                  alt={ep.name}
                  width={320}
                  height={180}
                  className="rounded"
                />
                <div className="md:col-span-3 space-y-3">
                  <h3 className="text-xl font-semibold">
                    {ep.episodeNumber}. {ep.name}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {ep.runtime || data.episodeRunTime?.[0]} min •{" "}
                    {ep.airDate?.split("T")[0]}
                  </div>
                  <p className="text-gray-300 line-clamp-3">{ep.overview}</p>

                  {/* Downloads & Subtitles */}
                  {ep.downloads?.length || ep.subtitles?.length ? (
                    <>
                      {/* Downloads */}
                      {ep.downloads?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center">
                            <Download className="w-4 h-4 mr-1" /> Downloads
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ep.downloads.map((dl, idx) => (
                              <a
                                key={`dl-${idx}-${dl.quality}-${dl.format}`}
                                href={dl.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1 rounded"
                              >
                                {dl.quality} {dl.format}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Subtitles */}
                      {ep.subtitles?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-1" /> Subtitles
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ep.subtitles.map((sub, idx) => (
                              <a
                                key={`sub-${idx}-${sub.language}`}
                                href={sub.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1 rounded"
                              >
                                {sub.language}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic mt-2">
                      Episodes will be available soon
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
