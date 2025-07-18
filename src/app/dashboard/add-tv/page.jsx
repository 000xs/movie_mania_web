"use client";

import { useState } from "react";
import { getTVSeriesDetails, getTVSeasonDetails } from "@/lib/tmdb";
import DownloadInput from "@/components/DownloadInput";
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
  Users,
  Briefcase,
} from "lucide-react";


export default function AddTvSeries() {
  /* ---------- state ---------- */
  const [tmdbId, setTmdbId] = useState("");
  const [tmdbUrl, setTmdbUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedSeasons, setExpandedSeasons] = useState({});

  const [tvData, setTvData] = useState({
    tvseriesId: "",
    name: "",
    overview: "",
    posterPath: "",
    backdropPath: "",
    firstAirDate: "",
    lastAirDate: "",
    voteAverage: "",
    voteCount: "",
    popularity: "",
    adult: false,
    originalLanguage: "en",
    originalName: "",
    status: "Returning Series",
    tagline: "",
    homepage: "",
    tmdbId: "",
    numberOfEpisodes: 0,
    numberOfSeasons: 0,
    episodeRunTime: [],
    inProduction: false,
    type: "",
    genres: [],
    cast: [],
    crew: [],
    networks: [],
    productionCompanies: [],
    productionCountries: [],
    spokenLanguages: [],
    seasons: [],         // seasons -> episodes -> downloads / subtitles
  });

  /* ---------- helpers ---------- */
  const extractTmdbIdFromUrl = (url) => url.match(/tv\/(\d+)/)?.[1] ?? null;
  const toggleSeason = (sn) =>
    setExpandedSeasons((p) => ({ ...p, [sn]: !p[sn] }));

  /* ---------- fetch ---------- */
  const handleTmdbFetch = async () => {
    setError("");
    let idToFetch = tmdbId;
    if (tmdbUrl) {
      const ex = extractTmdbIdFromUrl(tmdbUrl);
      if (ex) {
        idToFetch = ex;
        setTmdbId(ex);
      } else {
        setError("Invalid TMDB URL.");
        return;
      }
    }
    if (!idToFetch) {
      setError("Enter TMDB ID or URL.");
      return;
    }

    setLoading(true);
    try {
      const d = await getTVSeriesDetails(idToFetch);
      if (!d) throw new Error("Show not found");

      const base = {
        tvseriesId: String(d.id),
        name: d.name || "",
        overview: d.overview || "",
        posterPath: d.poster_path
          ? `https://image.tmdb.org/t/p/w500${d.poster_path}`
          : "",
        backdropPath: d.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${d.backdrop_path}`
          : "",
        firstAirDate: d.first_air_date || "",
        lastAirDate: d.last_air_date || "",
        voteAverage: String(d.vote_average ?? ""),
        voteCount: String(d.vote_count ?? ""),
        popularity: String(d.popularity ?? ""),
        adult: d.adult ?? false,
        originalLanguage: d.original_language || "en",
        originalName: d.original_name || "",
        status: d.status || "Returning Series",
        tagline: d.tagline || "",
        homepage: d.homepage || "",
        tmdbId: d.id,
        numberOfEpisodes: d.number_of_episodes || 0,
        numberOfSeasons: d.number_of_seasons || 0,
        episodeRunTime: d.episode_run_time || [],
        inProduction: d.in_production ?? false,
        type: d.type || "",
        genres: d.genres?.map((g) => g.name) || [],
        networks: d.networks?.map((n) => ({
          id: n.id,
          name: n.name,
          logoPath: n.logo_path
            ? `https://image.tmdb.org/t/p/w200${n.logo_path}`
            : "",
          originCountry: n.origin_country,
        })) || [],
        productionCompanies: d.production_companies?.map((c) => ({
          name: c.name,
          logoPath: c.logo_path
            ? `https://image.tmdb.org/t/p/w200${c.logo_path}`
            : "",
          originCountry: c.origin_country,
        })) || [],
        productionCountries: d.production_countries?.map((c) => ({
          name: c.name,
          iso31661: c.iso_3166_1,
        })) || [],
        spokenLanguages: d.spoken_languages?.map((l) => ({
          name: l.name,
          iso6391: l.iso_639_1,
        })) || [],
        cast: [],
        crew: [],
        seasons: [],
      };

      try {
        const cr = await fetch(`/api/tv/${idToFetch}/credits`).then((r) =>
          r.json()
        );
        base.cast = cr.cast?.slice(0, 15).map((c) => ({
          name: c.name,
          character: c.character,
          profilePath: c.profile_path
            ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
            : "",
        }));
        base.crew = cr.crew?.slice(0, 15).map((c) => ({
          name: c.name,
          job: c.job,
          department: c.department,
          profilePath: c.profile_path
            ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
            : "",
        }));
      } catch {
        /* ignore */
      }

      const seasons = await Promise.all(
        d.seasons.map(async (s) => {
          try {
            const sd = await getTVSeasonDetails(idToFetch, s.season_number);
            return {
              airDate: s.air_date || "",
              episodeCount: s.episode_count,
              name: s.name || "",
              overview: s.overview || "",
              posterPath: s.poster_path
                ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
                : "",
              seasonNumber: s.season_number,
              episodes: sd.episodes.map((e) => ({
                episodeId: `${d.id}-${s.season_number}-${e.episode_number}`,
                name: e.name || "",
                overview: e.overview || "",
                airDate: e.air_date || "",
                episodeNumber: e.episode_number,
                seasonNumber: s.season_number,
                stillPath: e.still_path
                  ? `https://image.tmdb.org/t/p/w500${e.still_path}`
                  : "",
                voteAverage: e.vote_average || 0,
                voteCount: e.vote_count || 0,
                runtime: e.runtime || 0,
                downloads: [],
                subtitles: [],
              })),
            };
          } catch {
            return {
              airDate: s.air_date || "",
              episodeCount: s.episode_count,
              name: s.name || "",
              overview: s.overview || "",
              posterPath: s.poster_path
                ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
                : "",
              seasonNumber: s.season_number,
              episodes: [],
            };
          }
        })
      );
      base.seasons = seasons;

      setTvData(base);
      setSuccessMessage("TV details fetched!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to fetch TV details.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tvData.name.trim()) {
      setError("TV series name is required.");
      return;
    }

    const payload = {
      ...tvData,
      firstAirDate: tvData.firstAirDate ? new Date(tvData.firstAirDate) : null,
      lastAirDate: tvData.lastAirDate ? new Date(tvData.lastAirDate) : null,
      voteAverage: Number(tvData.voteAverage) || 0,
      voteCount: Number(tvData.voteCount) || 0,
      popularity: Number(tvData.popularity) || 0,
      tmdbId: Number(tmdbId || extractTmdbIdFromUrl(tmdbUrl)),
      tvseriesId: tmdbId || extractTmdbIdFromUrl(tmdbUrl),
      episodeRunTime: tvData.episodeRunTime.length
        ? tvData.episodeRunTime
        : tvData.runtime
          ? [Number(tvData.runtime)]
          : [],
      seasons: tvData.seasons.map((s) => ({
        ...s,
        airDate: s.airDate ? new Date(s.airDate) : null,
        episodes: s.episodes.map((e) => ({
          ...e,
          airDate: e.airDate ? new Date(e.airDate) : null,
          downloads: (e.downloads || []).filter(Boolean).map((d) => ({
            downloadType: d.downloadType || "DIRECT",
            videoType: d.videoType || "WEB_DL",
            quality: d.quality || "1080p",
            link: d.link || "https://placeholder.invalid",
          })),
          subtitles: (e.subtitles || []).filter(Boolean).map((s) => ({
            language: s.language || "English",
            url: s.url || "https://placeholder.invalid",
          })),
        })),
      })),
    };

    setLoading(true);
    try {
      const res = await fetch("/api/tv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg || "Submission failed.");
      }
      setSuccessMessage("TV series added!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------  RENDER  ------------------------- */
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-2">
            <Tv className="h-10 w-10 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-red-600">
              Add TV Series
            </h1>
          </div>
          <p className="text-gray-400">
            Fetch from TMDB, manage seasons / episodes, and attach download
            links.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center space-x-2">
            <Check className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TMDB Fetch */}
        <div className="mb-6 p-6 bg-gradient-to-r from-red-900/20 to-blue-900/20 rounded-2xl border border-red-600/30">
          <div className="flex items-center mb-4">
            <Search className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold">Fetch from TMDB</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="TMDB ID (e.g. 1399)"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-red-500"
            />
            <input
              type="text"
              placeholder="or TMDB URL"
              value={tmdbUrl}
              onChange={(e) => setTmdbUrl(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-red-500"
            />
          </div>
          <button
            type="button"
            onClick={handleTmdbFetch}
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg flex items-center"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            )}
            Fetch
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {tvData.name && (
            <>
              {/* Basic Info */}
              <div className="bg-gray-900/50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <Film className="h-6 w-6 text-red-500 mr-2" />
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    icon={<Tv className="w-4 h-4" />}
                    value={tvData.name}
                    onChange={(v) => setTvData({ ...tvData, name: v })}
                    required
                  />
                  <Input
                    label="Original Title"
                    icon={<Tv className="w-4 h-4" />}
                    value={tvData.originalName}
                    onChange={(v) => setTvData({ ...tvData, originalName: v })}
                  />
                  <Input
                    label="First Air Date"
                    type="date"
                    icon={<Calendar className="w-4 h-4" />}
                    value={tvData.firstAirDate}
                    onChange={(v) => setTvData({ ...tvData, firstAirDate: v })}
                  />
                  <Input
                    label="Last Air Date"
                    type="date"
                    icon={<Calendar className="w-4 h-4" />}
                    value={tvData.lastAirDate}
                    onChange={(v) => setTvData({ ...tvData, lastAirDate: v })}
                  />
                  <Input
                    label="Rating"
                    type="number"
                    step="0.1"
                    icon={<Star className="w-4 h-4" />}
                    value={tvData.voteAverage}
                    onChange={(v) => setTvData({ ...tvData, voteAverage: v })}
                  />
                  <Input
                    label="Runtime (min)"
                    type="number"
                    icon={<Clock className="w-4 h-4" />}
                    value={
                      tvData.episodeRunTime?.[0] || tvData.runtime || ""
                    }
                    onChange={(v) =>
                      setTvData({
                        ...tvData,
                        episodeRunTime: [Number(v)],
                        runtime: Number(v),
                      })
                    }
                  />
                  <Input
                    label="Poster URL"
                    icon={<ImageIcon className="w-4 h-4" />}
                    value={tvData.posterPath}
                    onChange={(v) => setTvData({ ...tvData, posterPath: v })}
                  />
                  <Input
                    label="Backdrop URL"
                    icon={<ImageIcon className="w-4 h-4" />}
                    value={tvData.backdropPath}
                    onChange={(v) => setTvData({ ...tvData, backdropPath: v })}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    Overview
                  </label>
                  <textarea
                    rows={3}
                    value={tvData.overview}
                    onChange={(e) =>
                      setTvData({ ...tvData, overview: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg"
                    placeholder="Short description..."
                  />
                </div>

                {/* Genres */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    Genres
                  </label>
                  <input
                    value={tvData.genres.join(", ")}
                    onChange={(e) =>
                      setTvData({
                        ...tvData,
                        genres: e.target.value
                          .split(",")
                          .map((g) => g.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg"
                    placeholder="Action, Drama, Fantasy"
                  />
                </div>

                {/* Cast / Crew thumbnails */}
                {tvData.cast.length > 0 && (
                  <div className="mt-6">
                    <h3 className="flex items-center mb-2">
                      <Users className="w-5 h-5 mr-2" /> Cast
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {tvData.cast.map((c) => (
                        <div key={c.name} className="w-28 shrink-0 text-center">
                          <img
                            src={c.profilePath || "/avatar.svg"}
                            alt={c.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto"
                          />
                          <p className="text-xs mt-1">{c.name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {c.character}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tvData.crew.length > 0 && (
                  <div className="mt-6">
                    <h3 className="flex items-center mb-2">
                      <Briefcase className="w-5 h-5 mr-2" /> Crew
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {tvData.crew.map((c) => (
                        <div key={c.name} className="w-28 shrink-0 text-center">
                          <img
                            src={c.profilePath || "/avatar.svg"}
                            alt={c.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto"
                          />
                          <p className="text-xs mt-1">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.job}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Seasons & Episodes */}
              <div className="bg-gray-900/50 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Tv className="w-6 h-6 mr-2" /> Seasons & Episodes
                </h2>
                {tvData.seasons.map((season, sIdx) => (
                  <div
                    key={season.seasonNumber}
                    className="border border-gray-700 rounded-lg mb-4"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSeason(season.seasonNumber)}
                      className="w-full flex items-center justify-between p-3"
                    >
                      <span>
                        Season {season.seasonNumber} – {season.name}
                      </span>
                      {expandedSeasons[season.seasonNumber] ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    {expandedSeasons[season.seasonNumber] && (
                      <div className="p-3 border-t border-gray-700">
                        {/* Episodes */}
                        <div className="space-y-4">
                          {season.episodes.map((ep, eIdx) => (
                            <div
                              key={ep.episodeNumber}
                              className="bg-gray-800/50 p-3 rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">
                                    Ep {ep.episodeNumber}: {ep.name}
                                  </h4>
                                  <p className="text-sm text-gray-400">
                                    {ep.airDate} • {ep.runtime} min
                                  </p>
                                </div>
                                {ep.stillPath && (
                                  <img
                                    src={ep.stillPath}
                                    alt={ep.name}
                                    className="w-28 h-16 object-cover rounded"
                                  />
                                )}
                              </div>

                              {/* Downloads */}
                              <div className="mt-3">
                                <DownloadInput
                                  downloads={ep.downloads}
                                  setDownloads={(newDownloads) => {
                                    const next = [...tvData.seasons];
                                    next[sIdx].episodes[eIdx].downloads =
                                      newDownloads;
                                    setTvData({ ...tvData, seasons: next });
                                  }}
                                />
                              </div>

                              {/* Subtitles */}
                              <div className="mt-3">
                                <h5 className="text-sm font-medium mb-1">
                                  Subtitles
                                </h5>
                                <DownloadInput
                                  downloads={ep.subtitles}
                                  setDownloads={(newSubs) => {
                                    const next = [...tvData.seasons];
                                    next[sIdx].episodes[eIdx].subtitles =
                                      newSubs.map((s) => ({
                                        language: s.downloadType || "",
                                        url: s.link || "",
                                      }));
                                    setTvData({ ...tvData, seasons: next });
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl flex items-center"
                >
                  {loading && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                  <Save className="w-5 h-5 mr-2" /> Save TV Series
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

/* -------------------------  Reusable Input  ------------------------- */
function Input({ label, icon, value, onChange, ...rest }) {
  const handleChange = (e) => {
    const v = e.target.value;
    onChange?.(rest.type === "number" ? Number(v) : v);
  };
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          {...rest}
          value={Array.isArray(value) ? value.join(", ") : value ?? ""}
          onChange={handleChange}
          className="w-full pl-10 pr-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>
    </div>
  );
}