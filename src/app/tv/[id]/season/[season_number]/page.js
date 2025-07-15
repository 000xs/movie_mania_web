"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, Star, Calendar, Clock, ChevronRight } from "lucide-react"
import { getBackdropUrl } from "../../../../../lib/tmdb"

export default function SeasonPage({ params }) {
  const [season, setSeason] = useState(null)
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { id: seriesId, seasonNumber } = params

  useEffect(() => {
    const fetchSeasonData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [seasonResponse, seriesResponse] = await Promise.all([
          fetch(`/api/tv/${seriesId}/season/${seasonNumber}`),
          fetch(`/api/tv/${seriesId}`),
        ])

        if (!seasonResponse.ok || !seriesResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const [seasonData, seriesData] = await Promise.all([seasonResponse.json(), seriesResponse.json()])

        if (!seasonData.results || !seriesData.results) {
          throw new Error("Season or series not found")
        }

        setSeason(seasonData.results[0])
        setSeries(seriesData.results[0])
      } catch (err) {
        console.error("Error fetching season:", err)
        setError(err.message || "Failed to load season")
      } finally {
        setLoading(false)
      }
    }

    if (seriesId && seasonNumber) {
      fetchSeasonData()
    }
  }, [seriesId, seasonNumber])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl">Loading season details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Error</h1>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">{error}</p>
          <Link
            href={`/tv/${seriesId}`}
            className="bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors inline-flex items-center text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Series
          </Link>
        </div>
      </div>
    )
  }

  if (!season || !series) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Season Not Found</h1>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">The season you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href={`/tv/${seriesId}`}
            className="bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors inline-flex items-center text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Series
          </Link>
        </div>
      </div>
    )
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
              <span className="text-lg sm:text-xl font-bold text-red-600 hidden xs:block">Movie Mania</span>
            </Link>
            <Link
              href={`/tv/${seriesId}`}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Back to Series</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center pt-16 sm:pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getBackdropUrl(series.backdropPath)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40 sm:to-transparent"></div>
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Season Poster */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="relative aspect-[3/4] max-w-xs sm:max-w-sm mx-auto lg:mx-0">
                <Image
                  src={season.posterPath || "/placeholder.svg"}
                  alt={season.name}
                  fill
                  className="object-cover rounded-lg shadow-2xl"
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
            {/* Season Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
              <div>
                <p className="text-gray-400 text-sm sm:text-base mb-2">{series.title}</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight">
                  {season.name}
                </h1>
              </div>
              {/* Season Meta */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{season.voteAverage?.toFixed(1) || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{season.airDate}</span>
                </div>
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30">
                  {season.episodeCount} Episodes
                </span>
              </div>
              {/* Description */}
              {season.overview && (
                <p className="text-base sm:text-lg leading-relaxed max-w-3xl text-gray-200">{season.overview}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Episodes</h2>
        <div className="space-y-4 sm:space-y-6">
          {season.episodes.map((episode) => (
            <Link
              key={episode.episodeNumber}
              href={`/tv/${seriesId}/season/${seasonNumber}/episode/${episode.episodeNumber}`}
            >
              <div className="group bg-gray-900/50 hover:bg-gray-800/50 rounded-lg p-4 sm:p-6 transition-colors cursor-pointer">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                  {/* Episode Image */}
                  <div className="md:col-span-1">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={episode.stillPath || "/placeholder.svg"}
                        alt={episode.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                  {/* Episode Details */}
                  <div className="md:col-span-3 space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-semibold group-hover:text-red-400 transition-colors">
                        {episode.episodeNumber}. {episode.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{episode.voteAverage?.toFixed(1) || "N/A"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{episode.runtime || series.episodeRunTime}min</span>
                        </div>
                        <span>{episode.airDate}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                      {episode.overview}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>Season {seasonNumber}</span>
                        <span>•</span>
                        <span>Episode {episode.episodeNumber}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
