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
} from "lucide-react";
import { getImageUrl, getBackdropUrl } from "../../../lib/tmdb";
import  MovieList  from "../../../components/MovieList";


export default function MoviePage({ params }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/movies/${params.id}`);
        const responseData = await response.json();
        if (!responseData.results || responseData.results.length === 0) {
          throw new Error("Movie not found");
        }

        const movieData = responseData.results[0];
        setMovie(formatMovie(movieData));
      } catch (err) {
        setError(err.message || "Failed to load movie");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-md transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Movie Not Found</h1>
          <p className="text-gray-400 mb-8">
            The movie you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-md transition-colors inline-flex items-center"
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
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-xl">
                M
              </div>
              <span className="text-xl font-bold text-red-600">Movie Mania</span>
            </Link>
            <button
              onClick={() => useRouter().back()}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <Share className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-red-600 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getBackdropUrl(movie.backdropPath)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        </div>

        <div className="relative z-10 px-4 md:px-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Movie Poster */}
            <div className="lg:col-span-1">
              <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0">
                <Image
                  src={movie.posterPath || "/placeholder.svg"}
                  alt={movie.title}
                  fill
                  className="object-cover rounded-lg shadow-2xl"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>

            {/* Movie Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-2">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-xl text-gray-300 italic mb-4">
                    {movie.tagline}
                  </p>
                )}
              </div>

              {/* Movie Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{movie.rating}</span>
                  <span className="text-gray-400">({movie.voteCount} votes)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{movie.year}</span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{movie.runtime}</span>
                  </div>
                )}
                <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                  {movie.status}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded-full border border-red-600/30"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-lg leading-relaxed max-w-3xl text-gray-200">
                {movie.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold rounded-md transition-colors flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Play Trailer
                </button>
                <button className="border border-gray-400 text-white hover:bg-gray-800 px-8 py-3 text-lg bg-transparent rounded-md transition-colors flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add to List
                </button>
                {movie.homepage && (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-400 text-white hover:bg-gray-800 px-8 py-3 text-lg bg-transparent rounded-md transition-colors flex items-center"
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

      {/* Top Cast Section */}
      {movie.cast.length > 0 && (
        <section className="px-4 md:px-8 py-16 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Top Cast</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {movie.cast.slice(0, 5).map((actor, index) => {
              const profileImageUrl = getImageUrl(
                actor.profilePath,
                "w185"
              );
              return (
                <div key={actor.id ?? index} className="text-center">
                  <div className="w-24 h-24 relative rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-red-600/30 bg-gray-800">
                    <Image
                      src={profileImageUrl || "/placeholder.svg"}
                      alt={actor.name || "Actor"}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <p className="text-white font-medium text-sm">
                    {actor.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {actor.character}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Downloads & Subtitles Section */}
      {(movie.downloads.length > 0 || movie.subtitles.length > 0) && (
        <section className="px-4 md:px-8 py-16 max-w-6xl mx-auto bg-gradient-to-r from-red-900/20 to-blue-900/20 rounded-2xl border border-red-600/30">
          <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
            🎬 Downloads & Subtitles
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {movie.downloads.length > 0 && (
              <div className="bg-black/40 p-6 rounded-xl border border-red-600/50">
                <h3 className="text-2xl font-semibold mb-6 text-red-400 flex items-center">
                  📥 Available Downloads
                </h3>
                <div className="space-y-6">
                  {movie.downloads.reduce((acc, download) => {
                    if (acc.length === 0 || acc[acc.length - 1].type !== download.type) {
                      acc.push({ type: download.type, items: [download] });
                    } else {
                      acc[acc.length - 1].items.push(download);
                    }
                    return acc;
                  }, []).map((group, index) => (
                    <div key={index} className="bg-black/30 p-5 rounded-lg border border-red-700/50">
                      <h4 className="text-xl font-bold mb-4 text-red-300">
                        {group.type}
                      </h4>
                      <div className="space-y-3">
                        {group.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-red-900/20 p-4 rounded-md border border-red-800/50">
                            <div>
                              <p className="text-white font-medium">
                                {item.quality || "Unknown Quality"}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {item.videoType || "Unknown Type"}
                              </p>
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white text-sm font-semibold transition-colors"
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

            {movie.subtitles.length > 0 && (
              <div className="bg-black/40 p-6 rounded-xl border border-blue-600/50">
                <h3 className="text-2xl font-semibold mb-6 text-blue-400 flex items-center">
                  💬 Available Subtitles
                </h3>
                <div className="space-y-3">
                  {movie.subtitles.map((subtitle, index) => (
                    <div key={subtitle.id ?? index} className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-5 rounded-lg border border-blue-600/40 hover:border-blue-500 transition-shadow duration-300 shadow-lg hover:shadow-blue-600/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-bold text-lg">
                            {subtitle.language}
                          </p>
                        </div>
                        <a
                          href={subtitle.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 px-6 py-3 rounded-lg text-white font-bold transition-all transform hover:scale-105"
                        >
                          📄 Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Suggested Movies Section */}
      {/* <section className="px-4 md:px-8 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Suggested Movies</h2>
        <MovieList movieId={movie.id} />
      </section> */}

      {/* Footer */}
      <footer className="bg-gray-900 px-4 md:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="hover:text-white">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-white">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Movie Mania. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatMovie(movieData) {
  console.log(movieData);
  return {
    id: movieData.movieId,
    title: movieData.title,
    tagline: movieData.tagline,
    overview: movieData.overview,
    releaseDate: movieData.releaseDate,
    year: movieData.releaseDate
      ? new Date(movieData.releaseDate).getFullYear()
      : "N/A",
    runtime: formatRuntime(movieData.runtime),
    rating: movieData.voteAverage
      ? parseFloat(movieData.voteAverage.toFixed(1))
      : "N/A",
    voteCount: movieData.voteCount,
    genres: movieData.genres,
    posterPath: movieData.posterPath || "/poster.svg",
    backdropPath: movieData.backdropPath || "/backdrop.svg",
    budget: movieData.budget,
    revenue: movieData.revenue,
    status: movieData.status,
    originalLanguage: movieData.originalLanguage,
    originalTitle: movieData.originalTitle,
    popularity: movieData.popularity,
    productionCompanies: movieData.productionCompanies || [],
    productionCountries: movieData.productionCountries || [],
    spokenLanguages: movieData.spokenLanguages || [],
    homepage: movieData.homepage,
    cast: movieData.cast.map((actor) => ({
      id: actor.creditId,
      name: actor.originalName,
      character: actor.character,
      // Ensure profile path is a string or fallback
      profilePath:
        (typeof actor.profilePath === "string"
          ? actor.profilePath
          : actor.profilePath?.path) || "/profile.svg",
    })),
    crew: movieData.crew.map((person) => ({
      id: person.creditId,
      name: person.originalName,
      job: person.job,
      profilePath:
        (typeof person.profilePath === "string"
          ? person.profilePath
          : person.profilePath?.path) || "/profile.svg",
    })),
    downloads: movieData.downloads.map((file) => ({
      type: file.downloadType,
      quality: file.quality,
      videoType: file.videoType || "Unknown Type",
      // Ensure URLs are valid strings
      url: typeof file.link === "string" ? file.link : file.link?.url || "#",
    })),
    subtitles: movieData.subtitles.map((subtitle) => ({
      id: subtitle.id,
      language: subtitle.language,
      url: typeof subtitle.url === "string" ? subtitle.url : subtitle.url?.link || "#",
    })),
  };
}

function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return "N/A";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
