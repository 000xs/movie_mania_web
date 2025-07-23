"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Plus,
  Share,
  Star,
  Calendar,
  Clock,
  Globe,
  ChevronRight,
  Download,
} from "lucide-react";
import { getImageUrl, getBackdropUrl } from "../../../lib/tmdb";

export default function TvSeriesPage({ seriesId }) {
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
 

  useEffect(() => {
    const fetchSeriesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tv/${seriesId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        if (!responseData || !responseData._id) {
          throw new Error("TV Series not found");
        }

        setSeries(formatSeries(responseData));
      } catch (err) {
        console.error("Error fetching TV series:", err);
        setError(err.message || "Failed to load TV series");
      } finally {
        setLoading(false);
      }
    };

    if (seriesId) {
      fetchSeriesData();
    }
  }, [seriesId]);
  
  

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl">Loading TV series details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Error</h1>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">{error}</p>
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors inline-flex items-center text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">
            TV Series Not Found
          </h1>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            The TV series you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors inline-flex items-center text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}

      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded flex items-center justify-center font-bold text-sm sm:text-xl">
                M
              </div>
              <span className="text-lg sm:text-xl font-bold text-red-600 hidden xs:block">
                Movie Mania
              </span>
            </Link>
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <Share className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 sm:pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${series.backdrop})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40 sm:to-transparent"></div>
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Series Poster */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="relative aspect-[3/4] max-w-xs sm:max-w-sm mx-auto lg:mx-0">
                <Image
                  src={series.image || "/placeholder.svg"}
                  alt={series.title}
                  fill
                  className="object-cover rounded-lg shadow-2xl"
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
            {/* Series Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight">
                  {series.title}
                </h1>
                {series.tagline && (
                  <p className="text-lg sm:text-xl text-gray-300 italic mb-4">
                    {series.tagline}
                  </p>
                )}
              </div>
              {/* Series Meta */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{series.rating}</span>
                  <span className="text-gray-400">
                    ({series.voteCount} votes)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {series.firstAirDate
                      ? new Date(series.firstAirDate).getFullYear()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{series.episodeRunTime}min episodes</span>
                </div>
                <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                  {series.status}
                </span>
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30">
                  {series.numberOfSeasons} Season
                  {series.numberOfSeasons !== 1 ? "s" : ""}
                </span>
              </div>
              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {series.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded-full border border-red-600/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              {/* Description */}
              <p className="text-base sm:text-lg leading-relaxed max-w-3xl text-gray-200">
                {series.overview}
              </p>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-md transition-colors flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  Play Trailer
                </button>
                <Link href={`#seasons`} className="border border-gray-400 text-white hover:bg-gray-800 px-6 sm:px-8 py-3 text-base sm:text-lg bg-transparent rounded-md transition-colors flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Link>
                {series.homepage && (
                  <a
                    href={series.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-400 text-white hover:bg-gray-800 px-6 sm:px-8 py-3 text-base sm:text-lg bg-transparent rounded-md transition-colors flex items-center justify-center"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    Official Site
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seasons Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl mx-auto" id="seasons">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Seasons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {series.seasons.map((season) => (
            <Link
              key={season.seasonNumber}
              href={`/tv/${series.id}/season/${season.seasonNumber}`}
            >
              <div className="group cursor-pointer transition-transform hover:scale-105">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3">
                  <Image
                    src={season.posterPath || "/placeholder.svg"}
                    alt={season.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span>{season.episodeCount} episodes</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">
                    {season.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {season.airDate
                      ? new Date(season.airDate).getFullYear()
                      : "N/A"}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {season.episodeCount} episodes
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Cast Section */}
      {series.cast.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
            Top Cast
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
            {series.cast.slice(0, 6).map((actor, index) => {
              const profileImageUrl = getImageUrl(actor.profilePath, "w185");
              return (
                <div key={actor.id ?? index} className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 relative rounded-full overflow-hidden mx-auto mb-2 sm:mb-3 ring-2 ring-red-600/30 bg-gray-800">
                    <Image
                      src={profileImageUrl || "/placeholder.svg"}
                      alt={actor.name || "Actor"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                    />
                  </div>
                  <p className="text-white font-medium text-xs sm:text-sm line-clamp-2">
                    {actor.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {actor.character}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Company
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="hover:text-white transition-colors"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Support
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="hover:text-white transition-colors"
                  >
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Legal
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Connect
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2024 Movie Mania. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatSeries(tv) {
  return {
    id: tv.tmdbId || tv.tvseriesId || tv.id,
    tvseriesId: tv.tvseriesId || tv.tmdbId || tv.id,
    name: tv.name,
    title: tv.name,
    year: tv.firstAirDate ? new Date(tv.firstAirDate).getFullYear() : null,
    rating: tv.voteAverage,
    voteCount: tv.voteCount,
    popularity: tv.popularity,
    image: tv.posterPath || "/placeholder.svg",
    backdrop: tv.backdropPath || "/placeholder.svg",
    genres: tv.genres || [],
    description: tv.overview,
    episodeRunTime:
      tv.episodeRunTime && tv.episodeRunTime.length
        ? `${tv.episodeRunTime[0]}m/ep`
        : "N/A",
    numberOfSeasons: tv.numberOfSeasons,
    numberOfEpisodes: tv.numberOfEpisodes,
    status: tv.status,
    firstAirDate: tv.firstAirDate,
    lastAirDate: tv.lastAirDate,
    tagline: tv.tagline,
    homepage: tv.homepage,
    adult: tv.adult,
    originalLanguage: tv.originalLanguage,
    originalName: tv.originalName,
    inProduction: tv.inProduction,
    type: tv.type,
    downloads: tv.downloads || [],
    subtitles: tv.subtitles || [],
    cast: (tv.cast || []).map((person) => ({
      name: person.name,
      character: person.character,
      profilePath: person.profilePath || "/placeholder.svg",
    })),
    crew: (tv.crew || []).map((person) => ({
      name: person.name,
      job: person.job,
      department: person.department,
      profilePath: person.profilePath || "/placeholder.svg",
    })),
    networks: tv.networks || [],
    productionCompanies: tv.productionCompanies || [],
    productionCountries: tv.productionCountries || [],
    spokenLanguages: tv.spokenLanguages || [],
    seasons: (tv.seasons || []).map((season) => ({
      airDate: season.airDate,
      episodeCount: season.episodeCount,
      name: season.name,
      overview: season.overview,
      posterPath: season.posterPath || "/placeholder.svg",
      seasonNumber: season.seasonNumber,
      episodes: (season.episodes || []).map((episode) => ({
        episodeId: episode.episodeId,
        name: episode.name,
        overview: episode.overview,
        airDate: episode.airDate,
        episodeNumber: episode.episodeNumber,
        seasonNumber: episode.seasonNumber,
        stillPath: episode.stillPath || "/placeholder.svg",
        voteAverage: episode.voteAverage,
        voteCount: episode.voteCount,
        runtime: episode.runtime,
        downloads: episode.downloads || [],
        subtitles: episode.subtitles || [],
      })),
    })),
  };
}
