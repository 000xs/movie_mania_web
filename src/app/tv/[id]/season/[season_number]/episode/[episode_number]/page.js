"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, Plus, Share, Star, Calendar, Clock, Download } from "lucide-react"
import { getBackdropUrl } from "../../../../../../../lib/tmdb"

export default function EpisodePage({ params }) {
  const [episode, setEpisode] = useState(null)
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { id: seriesId, seasonNumber, episodeNumber } = params

  useEffect(() => {
    const fetchEpisodeData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [episodeResponse, seriesResponse] = await Promise.all([
          fetch(`/api/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`),
          fetch(`/api/tv/${seriesId}`),
        ])

        if (!episodeResponse.ok || !seriesResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const [episodeData, seriesData] = await Promise.all([episodeResponse.json(), seriesResponse.json()])

        if (!episodeData.results || !seriesData.results) {
          throw new Error("Episode or series not found")
        }

        setEpisode(episodeData.results[0])
        setSeries(seriesData.results[0])
      } catch (err) {
        console.error("Error fetching episode:", err)
        setError(err.message || "Failed to load episode")
      } finally {
        setLoading(false)
      }
    }

    if (seriesId && seasonNumber && episodeNumber) {
      fetchEpisodeData()
    }
  }, [seriesId, seasonNumber, episodeNumber])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl">Loading episode details...</p>
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
            href={`/tv/${seriesId}/season/${seasonNumber}`}
            className="bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors inline-flex items-center text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Season
          </Link>
        </div>
      </div>
    )
  }

  if (!episode || !series) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Episode Not Found</h1>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">The episode you&apos;re looking for doesn't exist.</p>
          <Link
            href={`/tv/${seriesId}/season/${seasonNumber}`}
            className="bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors inline-flex items-center text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Season
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
              href={`/tv/${seriesId}/season/${seasonNumber}`}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Back to Season</span>
            </Link>
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
          style={{ backgroundImage: `url(${getBackdropUrl(episode.stillPath || series.backdropPath)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40 sm:to-transparent"></div>
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Episode Image */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="relative aspect-video max-w-md mx-auto lg:mx-0">
                <Image
                  src={episode.stillPath || "/placeholder.svg"}
                  alt={episode.name}
                  fill
                  className="object-cover rounded-lg shadow-2xl"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 40vw"
                />
                <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer rounded-lg">
                  <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
              </div>
            </div>
            {/* Episode Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
              <div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm sm:text-base mb-2">
                  <Link href={`/tv/${seriesId}`} className="hover:text-white transition-colors">
                    {series.title}
                  </Link>
                  <span>•</span>
                  <Link href={`/tv/${seriesId}/season/${seasonNumber}`} className="hover:text-white transition-colors">
                    Season {seasonNumber}
                  </Link>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight">
                  {episode.episodeNumber}. {episode.name}
                </h1>
              </div>
              {/* Episode Meta */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{episode.voteAverage?.toFixed(1) || "N/A"}</span>
                  <span className="text-gray-400">({episode.voteCount || 0} votes)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{episode.airDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{episode.runtime || series.episodeRunTime}min</span>
                </div>
              </div>
              {/* Description */}
              <p className="text-base sm:text-lg leading-relaxed max-w-3xl text-gray-200">{episode.overview}</p>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-md transition-colors flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Episode
                </button>
                <button className="border border-gray-400 text-white hover:bg-gray-800 px-6 sm:px-8 py-3 text-base sm:text-lg bg-transparent rounded-md transition-colors flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Downloads & Subtitles Section */}
      {(episode.downloads?.length > 0 || episode.subtitles?.length > 0) && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-red-900/20 to-blue-900/20 rounded-2xl border border-red-600/30 p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
              📺 Episode Downloads & Subtitles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {episode.downloads?.length > 0 && (
                <div className="bg-black/40 p-4 sm:p-6 rounded-xl border border-red-600/50">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-red-400 flex items-center">
                    📥 Available Downloads
                  </h3>
                  <div className="space-y-3">
                    {episode.downloads.map((download, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-red-900/20 p-3 sm:p-4 rounded-md border border-red-800/50 gap-3"
                      >
                        <div>
                          <p className="text-white font-medium text-sm sm:text-base">
                            {download.quality || "Unknown Quality"}
                          </p>
                          <p className="text-gray-400 text-xs">{download.videoType || "Unknown Type"}</p>
                        </div>
                        <a
                          href={download.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white text-sm font-semibold transition-colors text-center flex items-center justify-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {episode.subtitles?.length > 0 && (
                <div className="bg-black/40 p-4 sm:p-6 rounded-xl border border-blue-600/50">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-blue-400 flex items-center">
                    💬 Available Subtitles
                  </h3>
                  <div className="space-y-3">
                    {episode.subtitles.map((subtitle, index) => (
                      <div
                        key={index}
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
                            className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-bold transition-all transform hover:scale-105 text-center text-sm sm:text-base flex items-center justify-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
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
