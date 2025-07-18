"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Head from 'next/head';
import { ArrowLeft, Play, Plus, Share, Star, Calendar, Clock, Globe } from "lucide-react"
import { getImageUrl, getBackdropUrl } from "../../../lib/tmdb"

export default function MoviePage({ params }) {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const mId = params.id

  // Set SEO metadata
  useEffect(() => {
    if (movie) {
      document.title = `${movie.title} (${movie.year}) | Movie Mania`;
      
      // Update meta description
      const description = movie.overview.substring(0, 160);
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;

      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = `${movie.title} (${movie.year})`;
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.content = description;
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.content = movie.posterPath;
    }
  }, [movie]);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/movies/${mId}`)
        const responseData = await response.json()
        if (!responseData.results || responseData.results.length === 0) {
          throw new Error("Movie not found")
        }
        const movieData = responseData.results[0]
        setMovie(formatMovie(movieData))
      } catch (err) {
        setError(err.message || "Failed to load movie")
      } finally {
        setLoading(false)
      }
    }

    fetchMovieData()
  }, [mId])

  // SEO: Add canonical URL
  const canonicalUrl = `https://www.moviemanialk.com/movie/${mId}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Head>
          <title>Loading... | Movie Mania</title>
          <meta name="description" content="Loading movie details" />
        </Head>
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl">Loading movie details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Head>
          <title>Error | Movie Mania</title>
          <meta name="description" content="Error loading movie" />
        </Head>
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
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Head>
          <title>Movie Not Found | Movie Mania</title>
          <meta name="description" content="The movie you're looking for doesn't exist" />
        </Head>
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Movie Not Found</h1>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">The movie you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors inline-flex items-center text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>{movie.title} ({movie.year}) | Movie Mania</title>
        <meta name="description" content={movie.overview.substring(0, 160)} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${movie.title} (${movie.year})`} />
        <meta property="og:description" content={movie.overview.substring(0, 160)} />
        <meta property="og:image" content={movie.posterPath} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={`${movie.title} (${movie.year})`} />
        <meta property="twitter:description" content={movie.overview.substring(0, 160)} />
        <meta property="twitter:image" content={movie.posterPath} />
      </Head>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded flex items-center justify-center font-bold text-sm sm:text-xl">
                M
              </div>
              <span className="text-lg sm:text-xl font-bold text-red-600 hidden xs:block">Movie Mania</span>
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
          style={{ backgroundImage: `url(${getBackdropUrl(movie.backdropPath)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40 sm:to-transparent"></div>
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Movie Poster */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="relative aspect-[3/4] max-w-xs sm:max-w-sm mx-auto lg:mx-0">
                <Image
                  src={movie.posterPath || "/placeholder.svg"}
                  alt={`${movie.title} movie poster`}
                  fill
                  className="object-cover rounded-lg shadow-2xl"
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
                  priority
                />
              </div>
            </div>
            {/* Movie Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight">
                  {movie.title}
                </h1>
                {movie.tagline && <p className="text-lg sm:text-xl text-gray-300 italic mb-4">{movie.tagline}</p>}
              </div>
              {/* Movie Meta */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
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
                <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">{movie.status}</span>
              </div>
              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded-full border border-red-600/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              {/* Description */}
              <p className="text-base sm:text-lg leading-relaxed max-w-3xl text-gray-200">{movie.overview}</p>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-md transition-colors flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  Play Trailer
                </button>
                <button className="border border-gray-400 text-white hover:bg-gray-800 px-6 sm:px-8 py-3 text-base sm:text-lg bg-transparent rounded-md transition-colors flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add to List
                </button>
                {movie.homepage && (
                  <a
                    href={movie.homepage}
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

      {/* Top Cast Section */}
      {movie.cast.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Top Cast</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
            {movie.cast.slice(0, 6).map((actor, index) => {
              const profileImageUrl = getImageUrl(actor.profilePath, "w185")
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
                  <p className="text-white font-medium text-xs sm:text-sm line-clamp-2">{actor.name}</p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{actor.character}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Downloads & Subtitles Section */}
      {(movie.downloads.length > 0 || movie.subtitles.length > 0) && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-red-900/20 to-blue-900/20 rounded-2xl border border-red-600/30 p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
              🎬 Downloads & Subtitles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {movie.downloads.length > 0 && (
                <div className="bg-black/40 p-4 sm:p-6 rounded-xl border border-red-600/50">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-red-400 flex items-center">
                    📥 Available Downloads
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {movie.downloads
                      .reduce((acc, download) => {
                        if (acc.length === 0 || acc[acc.length - 1].type !== download.type) {
                          acc.push({ type: download.type, items: [download] })
                        } else {
                          acc[acc.length - 1].items.push(download)
                        }
                        return acc
                      }, [])
                      .map((group, index) => (
                        <div key={index} className="bg-black/30 p-3 sm:p-5 rounded-lg border border-red-700/50">
                          <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-red-300">{group.type}</h4>
                          <div className="space-y-3">
                            {group.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-red-900/20 p-3 sm:p-4 rounded-md border border-red-800/50 gap-3"
                              >
                                <div>
                                  <p className="text-white font-medium text-sm sm:text-base">
                                    {item.quality || "Unknown Quality"}
                                  </p>
                                  <p className="text-gray-400 text-xs">{item.videoType || "Unknown Type"}</p>
                                </div>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white text-sm font-semibold transition-colors text-center"
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
                <div className="bg-black/40 p-4 sm:p-6 rounded-xl border border-blue-600/50">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-blue-400 flex items-center">
                    💬 Available Subtitles
                  </h3>
                  <div className="space-y-3">
                    {movie.subtitles.map((subtitle, index) => (
                      <div
                        key={subtitle.id ?? index}
                        className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-4 sm:p-5 rounded-lg border border-blue-600/40 hover:border-blue-500 transition-shadow duration-300 shadow-lg hover:shadow-blue-600/20"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <div>
                            <p className="text-white font-bold text-base sm:text-lg">{subtitle.language}</p>
                          </div>
                          <a
                            href={subtitle.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-bold transition-all transform hover:scale-105 text-center text-sm sm:text-base"
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
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="hover:text-white transition-colors">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-white transition-colors">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Connect</h3>
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
  )
}

function formatMovie(movieData) {
  return {
    id: movieData.movieId,
    title: movieData.title,
    tagline: movieData.tagline,
    overview: movieData.overview,
    releaseDate: movieData.releaseDate,
    year: movieData.releaseDate ? new Date(movieData.releaseDate).getFullYear() : "N/A",
    runtime: formatRuntime(movieData.runtime),
    rating: movieData.voteAverage ? Number.parseFloat(movieData.voteAverage.toFixed(1)) : "N/A",
    voteCount: movieData.voteCount,
    genres: movieData.genres,
    posterPath: movieData.posterPath || "/poster.svg",
    backdropPath: movieData.backdropPath || "/backdrop.svg",
    status: movieData.status,
    originalLanguage: movieData.originalLanguage,
    homepage: movieData.homepage,
    cast: movieData.cast.map((actor) => ({
      id: actor.creditId,
      name: actor.originalName,
      character: actor.character,
      profilePath:
        (typeof actor.profilePath === "string" ? actor.profilePath : actor.profilePath?.path) || "/profile.svg",
    })),
    downloads: movieData.downloads.map((file) => ({
      type: file.downloadType,
      quality: file.quality,
      videoType: file.videoType || "Unknown Type",
      url: typeof file.link === "string" ? file.link : file.link?.url || "#",
    })),
    subtitles: movieData.subtitles.map((subtitle) => ({
      id: subtitle.id,
      language: subtitle.language,
      url: typeof subtitle.url === "string" ? subtitle.url : subtitle.url?.link || "#",
    })),
  }
}

function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return "N/A"
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}