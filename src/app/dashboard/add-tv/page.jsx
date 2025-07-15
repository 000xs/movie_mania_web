"use client"
import { useState } from "react"
import { getTVSeriesDetails, getTVSeasonDetails } from "@/lib/tmdb"
import {
  Search,
  Plus,
  X,
  Film,
  Calendar,
  Star,
  Clock,
  ImageIcon,
  FileText,
  Download,
  Tv,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Save,
} from "lucide-react"

export default function AddTvSeries() {
  const [tmdbId, setTmdbId] = useState("")
  const [tmdbUrl, setTmdbUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [expandedSeasons, setExpandedSeasons] = useState({})

  // Complex nested TV data with seasons, episodes and downloads
  const [tvData, setTvData] = useState({
    title: "",
    overview: "",
    posterPath: "",
    backdropPath: "",
    firstAirDate: "",
    voteAverage: "",
    runtime: "",
    genres: [],
    cast: [],
    crew: [],
    seasons: [],
  })

  const extractTmdbIdFromUrl = (url) => {
    const match = url.match(/tv\/(\d+)/)
    return match ? match[1] : null
  }

  const toggleSeason = (seasonNumber) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [seasonNumber]: !prev[seasonNumber],
    }))
  }

  const handleTmdbFetch = async () => {
    setError("")
    let idToFetch = tmdbId

    if (tmdbUrl) {
      const extractedId = extractTmdbIdFromUrl(tmdbUrl)
      if (extractedId) {
        idToFetch = extractedId
        setTmdbId(extractedId)
      } else {
        setError("Invalid TMDB URL. Please provide a valid TV series URL.")
        return
      }
    }

    if (!idToFetch) {
      setError("Please enter TMDB ID or URL")
      return
    }

    setLoading(true)
    try {
      const tvDetails = await getTVSeriesDetails(idToFetch)
      if (!tvDetails) {
        setError("TV show not found")
        setLoading(false)
        return
      }

      // Map basic info
      const baseData = {
        title: tvDetails.name || "",
        overview: tvDetails.overview || "",
        posterPath: tvDetails.poster_path ? `https://image.tmdb.org/t/p/w500${tvDetails.poster_path}` : "",
        backdropPath: tvDetails.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tvDetails.backdrop_path}` : "",
        firstAirDate: tvDetails.first_air_date || "",
        voteAverage: tvDetails.vote_average ? tvDetails.vote_average.toString() : "",
        runtime: tvDetails.episode_run_time?.[0]?.toString() || "",
        genres: tvDetails.genres?.map((g) => g.name) || [],
        cast: [],
        crew: [],
        seasons: [],
      }

      // Fetch credits (cast and crew)
      try {
        const credits = await fetch(`/api/tv/${idToFetch}/credits`).then((res) => res.json())
        baseData.cast = credits.cast?.slice(0, 5) || []
        baseData.crew = credits.crew?.slice(0, 5) || []
      } catch (creditsError) {
        console.warn("Could not fetch credits:", creditsError)
      }

      const seasonsWithEpisodes = await Promise.all(
        tvDetails.seasons.map(async (season) => {
          try {
            const seasonDetails = await getTVSeasonDetails(idToFetch, season.season_number)
            return {
              seasonNumber: season.season_number,
              name: season.name || "",
              airDate: season.air_date || "",
              episodeCount: season.episode_count || 0,
              overview: season.overview || "",
              posterPath: season.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : "",
              episodes: seasonDetails.episodes.map((ep) => ({
                episodeNumber: ep.episode_number,
                name: ep.name || "",
                overview: ep.overview || "",
                airDate: ep.air_date || "",
                runtime: ep.runtime || 0,
                stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : "",
                downloads: [], // empty downloads array initially
                subtitles: [], // you can add subtitles if available
              })),
            }
          } catch (seasonError) {
            console.warn(`Could not fetch season ${season.season_number}:`, seasonError)
            return {
              seasonNumber: season.season_number,
              name: season.name || "",
              airDate: season.air_date || "",
              episodeCount: season.episode_count || 0,
              episodes: [],
            }
          }
        })
      )


      baseData.seasons = seasonsWithEpisodes
      setTvData(baseData)
      setSuccessMessage("TV details fetched successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      console.error(err)
      setError("Failed to fetch TV details from TMDB")
    } finally {
      setLoading(false)
    }
  }

  // Handlers to update downloads for an episode inside a season
  const addDownloadToEpisode = (seasonIndex, episodeIndex) => {
    const newData = { ...tvData }
    newData.seasons[seasonIndex].episodes[episodeIndex].downloads.push({
      title: "",
      url: "",
      format: "MP4",
      quality: "1080p",
    })
    setTvData(newData)
  }

  const updateDownloadField = (seasonIndex, episodeIndex, downloadIndex, field, value) => {
    const newData = { ...tvData }
    newData.seasons[seasonIndex].episodes[episodeIndex].downloads[downloadIndex][field] = value
    setTvData(newData)
  }

  const removeDownloadFromEpisode = (seasonIndex, episodeIndex, downloadIndex) => {
    const newData = { ...tvData }
    newData.seasons[seasonIndex].episodes[episodeIndex].downloads.splice(downloadIndex, 1)
    setTvData(newData)
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validation
    if (!tvData.title.trim()) {
      setError("TV series title is required")
      setLoading(false)
      return
    }

    // Add required fields for backend validation if needed
    const payload = {
      ...tvData,
      name: tvData.title, // if backend expects name instead of title
      tvseriesId: tmdbId || extractTmdbIdFromUrl(tmdbUrl),
    }

    try {
      const res = await fetch("/api/tv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to add TV series")
      }

      setSuccessMessage("TV Series added successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Tv className="h-10 w-10 text-red-600" />
            <h1 className="text-4xl font-bold text-red-600">Add TV Series</h1>
          </div>
          <p className="text-gray-400 text-lg">Fetch TV series details from TMDB and manage episodes with downloads</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center space-x-3">
            <Check className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TMDB Fetch Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-red-900/20 to-blue-900/20 rounded-2xl border border-red-600/30">
          <div className="flex items-center mb-6">
            <Search className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-2xl font-semibold">Fetch from TMDB</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">TMDB ID</label>
              <input
                type="text"
                placeholder="e.g., 1399 (Game of Thrones)"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">TMDB URL</label>
              <input
                type="text"
                placeholder="https://www.themoviedb.org/tv/1399"
                value={tmdbUrl}
                onChange={(e) => setTmdbUrl(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleTmdbFetch}
            disabled={loading}
            className="w-full lg:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Fetching from TMDB...
              </div>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Fetch from TMDB
              </>
            )}
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center mb-6">
              <Film className="h-6 w-6 text-red-500 mr-3" />
              <h2 className="text-2xl font-semibold">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tv className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={tvData.title}
                    onChange={(e) => setTvData({ ...tvData, title: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter TV series title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Air Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={tvData.firstAirDate}
                    onChange={(e) => setTvData({ ...tvData, firstAirDate: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <div className="relative">
                  <Star className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={tvData.voteAverage}
                    onChange={(e) => setTvData({ ...tvData, voteAverage: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                    placeholder="0.0 - 10.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Runtime (minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={tvData.runtime}
                    onChange={(e) => setTvData({ ...tvData, runtime: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Poster URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={tvData.posterPath}
                    onChange={(e) => setTvData({ ...tvData, posterPath: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="https://image.tmdb.org/t/p/w500/..."
                  />
                </div>
                {tvData.posterPath && (
                  <div className="mt-3">
                    <img
                      src={tvData.posterPath || "/placeholder.svg"}
                      alt="Poster preview"
                      className="w-24 h-36 object-cover rounded-lg border border-gray-700"
                      onError={(e) => {
                        e.target.style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Backdrop URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={tvData.backdropPath}
                    onChange={(e) => setTvData({ ...tvData, backdropPath: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="https://image.tmdb.org/t/p/w1280/..."
                  />
                </div>
                {tvData.backdropPath && (
                  <div className="mt-3">
                    <img
                      src={tvData.backdropPath || "/placeholder.svg"}
                      alt="Backdrop preview"
                      className="w-full h-20 object-cover rounded-lg border border-gray-700"
                      onError={(e) => {
                        e.target.style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Overview</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  rows="4"
                  value={tvData.overview}
                  onChange={(e) => setTvData({ ...tvData, overview: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                  placeholder="Enter detailed description of the TV series"
                />
              </div>
            </div>
          </div>

          {/* Seasons and Episodes */}
          {tvData.seasons.length > 0 && (
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <div className="flex items-center mb-6">
                <Tv className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-2xl font-semibold">Seasons & Episodes</h2>
                <span className="ml-3 px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                  {tvData.seasons.length} Season{tvData.seasons.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-6">
                {console.log(tvData.seasons)}
                {tvData.seasons.map((season, sIdx) => (
                  <div key={season.season_number} className="border border-gray-700 rounded-xl bg-gray-800/30">
                    <button
                      type="button"
                      onClick={() => toggleSeason(season.season_number)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors rounded-t-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 font-bold">{season.season_number}</span>
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-white">{season.name}</h3>
                          <p className="text-sm text-gray-400">
                            {season.air_date} • {season.episode_count || season.episodes.length} episodes
                          </p>
                        </div>
                      </div>
                      {expandedSeasons[season.season_number] ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    {expandedSeasons[season.season_number] && (
                      <div className="p-4 border-t border-gray-700">
                        <div className="space-y-4">
                          {season.episodes.map((ep, eIdx) => (
                            <div key={ep.episode_number} className="bg-gray-700/30 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-1">
                                    Episode {ep.episode_number}: {ep.name}
                                  </h4>
                                  {ep.overview && (
                                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{ep.overview}</p>
                                  )}
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    {ep.air_date && (
                                      <span className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {ep.air_date}
                                      </span>
                                    )}
                                    {ep.runtime && (
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {ep.runtime}min
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {ep.still_path && (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                    alt={ep.name}
                                    className="w-20 h-12 object-cover rounded border border-gray-600 ml-4"
                                    onError={(e) => {
                                      e.target.style.display = "none"
                                    }}
                                  />
                                )}
                              </div>

                              {/* Downloads Section */}
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-sm font-semibold text-gray-300 flex items-center">
                                    <Download className="w-4 h-4 mr-2 text-green-400" />
                                    Downloads ({ep.downloads.length})
                                  </h5>
                                  <button
                                    type="button"
                                    onClick={() => addDownloadToEpisode(sIdx, eIdx)}
                                    className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-600/30 transition-all text-sm flex items-center"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Download
                                  </button>
                                </div>

                                <div className="space-y-3">
                                  {ep.downloads.map((dl, dIdx) => (
                                    <div
                                      key={dIdx}
                                      className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gray-600/20 rounded-lg border border-gray-600/30"
                                    >
                                      <div className="md:col-span-4">
                                        <input
                                          type="text"
                                          placeholder="Download title"
                                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                                          value={dl.title}
                                          onChange={(e) =>
                                            updateDownloadField(sIdx, eIdx, dIdx, "title", e.target.value)
                                          }
                                        />
                                      </div>
                                      <div className="md:col-span-4">
                                        <input
                                          type="url"
                                          placeholder="Download URL"
                                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                                          value={dl.url}
                                          onChange={(e) => updateDownloadField(sIdx, eIdx, dIdx, "url", e.target.value)}
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <select
                                          value={dl.quality}
                                          onChange={(e) =>
                                            updateDownloadField(sIdx, eIdx, dIdx, "quality", e.target.value)
                                          }
                                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white text-sm"
                                        >
                                          <option value="4K">4K</option>
                                          <option value="1080p">1080p</option>
                                          <option value="720p">720p</option>
                                          <option value="480p">480p</option>
                                        </select>
                                      </div>
                                      <div className="md:col-span-1">
                                        <select
                                          value={dl.format}
                                          onChange={(e) =>
                                            updateDownloadField(sIdx, eIdx, dIdx, "format", e.target.value)
                                          }
                                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white text-sm"
                                        >
                                          <option value="MP4">MP4</option>
                                          <option value="MKV">MKV</option>
                                          <option value="AVI">AVI</option>
                                        </select>
                                      </div>
                                      <div className="md:col-span-1 flex justify-center">
                                        <button
                                          type="button"
                                          onClick={() => removeDownloadFromEpisode(sIdx, eIdx, dIdx)}
                                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                          title="Remove download"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  {ep.downloads.length === 0 && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                      No downloads added yet. Click "Add Download" to get started.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[200px]"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving TV Series...
                </div>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Add TV Series
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
