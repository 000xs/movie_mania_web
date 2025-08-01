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
import AdClickTrigger from "@/components/AdClickTrigger";

export default function SeasonPage({ id, seasonNumber }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tv/${id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);


  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

   
  const season = data?.seasons?.find(
    (s) => s.seasonNumber === Number(seasonNumber)
  );
  if (!data || !season)
    return <p className="text-white p-6">Season not found</p>;

   

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <AdClickTrigger adUrl={'https://enrageperplexparable.com/rnrg8zs2?key=61e60774e6d154f2f9097db811069d0f'} / >

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
            <h1 className="text-5xl font-bold">
              {data.name} {season.name}{" "}
            </h1>
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
