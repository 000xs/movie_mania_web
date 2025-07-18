"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Search,
  Film,
  Subtitles,
  Calendar,
  Star,
  Users,
  Clock,
  Image,
  FileText,
  X,
  Plus,
  Check,
} from "lucide-react";
import { getMovieDetails } from "@/lib/tmdb-server";

import DownloadInput from "@/components/DownloadInput";

export default function EditMovie() {
  const router = useRouter();
  const { id } = useParams();

  

  /* ---------- state ---------- */
  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [posterPath, setPosterPath] = useState("");
  const [backdropPath, setBackdropPath] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [voteAverage, setVoteAverage] = useState("");
  const [genres, setGenres] = useState([]);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [productionCompanies, setProductionCompanies] = useState([]);
  const [productionCountries, setProductionCountries] = useState([]);
  const [spokenLanguages, setSpokenLanguages] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [runtime, setRuntime] = useState("");
  const [tmdbId, setTmdbId] = useState("");
  const [tmdbUrl, setTmdbUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ---------- fetch existing movie ---------- */
  useEffect(() => {
    if (!id) return;
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movies/${id}`);
        if (!res.ok) throw new Error("Movie not found");
        const resp = await res.json();
        const data = resp.results?.[0];
        console.log(data)
        if (ignore) return;
        setTitle(data.title ?? "err");
        setOverview(data.overview ?? "");
        setPosterPath(data.posterPath ?? "");
        setBackdropPath(data.backdropPath ?? "");
        setReleaseDate(data.releaseDate ?? "");
        setVoteAverage(data.voteAverage?.toString() ?? "");
        setRuntime(data.runtime?.toString() ?? "");
        setGenres(Array.isArray(data.genres) ? data.genres : []);
        setCast(Array.isArray(data.cast) ? data.cast : []);
        setCrew(Array.isArray(data.crew) ? data.crew : []);
        setProductionCompanies(Array.isArray(data.productionCompanies) ? data.productionCompanies : []);
        setProductionCountries(Array.isArray(data.productionCountries) ? data.productionCountries : []);
        setSpokenLanguages(Array.isArray(data.spokenLanguages) ? data.spokenLanguages : []);
        setDownloads(Array.isArray(data.downloads) ? data.downloads : []);
        setSubtitles(Array.isArray(data.subtitles) ? data.subtitles : []);
      } catch (err) {
        setError(err.message || "Could not load movie");
      } finally {
        setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [id]);

  /* ---------- optional TMDB re-fetch ---------- */
  const extractTmdbIdFromUrl = (url) =>
    url.match(/(movie|tv)\/(\d+)/)?.[2] ?? null;

  const handleTmdbFetch = async () => {
    let fetchId = tmdbId;
    if (tmdbUrl) {
      const extracted = extractTmdbIdFromUrl(tmdbUrl);
      if (!extracted) return setError("Invalid TMDB URL");
      fetchId = extracted;
      setTmdbId(extracted);
    }
    if (!fetchId) return setError("Enter TMDB ID or URL");

    setLoading(true);
    setError("");
    try {
      const details = await getMovieDetails(fetchId);
      if (!details) throw new Error("Not found");
      setTitle(details.title ?? "");
      setOverview(details.overview ?? "");
      setPosterPath(
        details.poster_path
          ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
          : ""
      );
      setBackdropPath(
        details.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
          : ""
      );
      setReleaseDate(details.release_date ?? "");
      setVoteAverage(details.vote_average?.toString() ?? "");
      setGenres(details.genres?.map((g) => g.name) ?? []);
      setRuntime(details.runtime?.toString() ?? "");

      const credits = await fetch(`/api/movies/${fetchId}/credits`).then((r) =>
        r.json()
      );
      setCast(credits.cast?.slice(0, 5) ?? []);
      setCrew(credits.crew?.slice(0, 5) ?? []);
    } catch (err) {
      setError("Failed to fetch from TMDB");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- update ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      title,
      overview,
      posterPath,
      backdropPath,
      releaseDate,
      voteAverage: parseFloat(voteAverage),
      genres,
      cast,
      crew,
      productionCompanies,
      productionCountries,
      spokenLanguages,
      downloads,
      subtitles,
      runtime,
    };
    try {
      const res = await fetch(`/api/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      await telegramSend({ type: "movie_edit", media: payload });
      setSuccessMessage("Movie updated!");
      setTimeout(() => router.push(`/movies/${id}`), 1500);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const telegramSend = async (body) => {
    await fetch("/api/notify-telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  /* ---------- UI helpers ---------- */
  const addGenre = (g) => {
    const trimmed = g.trim();
    if (trimmed && !genres.includes(trimmed)) setGenres([...genres, trimmed]);
  };
  const removeGenre = (i) => setGenres(genres.filter((_, idx) => idx !== i));

  const addCastMember = (name) => {
    if (cast.length >= 5) return setError("Max 5 cast");
    const trimmed = name.trim();
    if (trimmed && !cast.some((c) => c.name.toLowerCase() === trimmed.toLowerCase()))
      setCast([...cast, { name: trimmed, character: "", profilePath: "" }]);
  };
  const removeCastMember = (i) => setCast(cast.filter((_, idx) => idx !== i));

  const addCrewMember = (name) => {
    if (crew.length >= 5) return setError("Max 5 crew");
    const trimmed = name.trim();
    if (trimmed && !crew.some((c) => c.name.toLowerCase() === trimmed.toLowerCase()))
      setCrew([...crew, { name: trimmed, job: "", department: "", profilePath: "" }]);
  };
  const removeCrewMember = (i) => setCrew(crew.filter((_, idx) => idx !== i));

  const addSubtitle = () =>
    setSubtitles([...subtitles, { language: "", url: "" }]);
  const removeSubtitle = (i) =>
    setSubtitles(subtitles.filter((_, idx) => idx !== i));

  const TagInput = ({ placeholder, onAdd, onRemove, items, icon: Icon }) => {
    const [val, setVal] = useState("");
    const onKey = (e) => {
      if (e.key === "Enter" && val.trim()) {
        e.preventDefault();
        onAdd(val.trim());
        setVal("");
      }
    };
    return (
      <div className="space-y-2">
        <div className="relative">
          <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400"
          />
          {val && (
            <button
              type="button"
              onClick={() => {
                onAdd(val.trim());
                setVal("");
              }}
              className="absolute right-3 top-3 text-red-400"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((it, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-300 border border-red-500/30"
            >
              {typeof it === "object" ? it.name : it}
              <button
                onClick={() => onRemove(idx)}
                className="ml-2 text-red-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-red-600">Edit Movie</h1>
          <p className="text-gray-400">Update the movie details below</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* TMDB re-fetch */}
        <div className="mb-8 p-6 bg-gray-900 rounded-lg">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold">Re-fetch from TMDB</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="TMDB ID (e.g. 603)"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
            <input
              type="text"
              placeholder="TMDB URL"
              value={tmdbUrl}
              onChange={(e) => setTmdbUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <button
            type="button"
            onClick={handleTmdbFetch}
            disabled={loading}
            className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Search className="h-5 w-5 mr-2" />
            )}
            Re-fetch
          </button>
        </div>

        {/* Full form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Movie Title *
              </label>
              <div className="relative">
                <Film className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Release Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rating
              </label>
              <div className="relative">
                <Star className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={voteAverage}
                  onChange={(e) => setVoteAverage(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Runtime (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={runtime}
                  onChange={(e) => setRuntime(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Overview
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                rows={4}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poster URL
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  value={posterPath}
                  onChange={(e) => setPosterPath(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backdrop URL
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  value={backdropPath}
                  onChange={(e) => setBackdropPath(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genres
            </label>
            <TagInput
              placeholder="Add genre (press Enter)"
              onAdd={addGenre}
              onRemove={removeGenre}
              items={genres}
              icon={Film}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cast
              </label>
              <TagInput
                placeholder="Add cast member (press Enter)"
                onAdd={addCastMember}
                onRemove={removeCastMember}
                items={cast}
                icon={Users}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Crew
              </label>
              <TagInput
                placeholder="Add crew member (press Enter)"
                onAdd={addCrewMember}
                onRemove={removeCrewMember}
                items={crew}
                icon={Users}
              />
            </div>
          </div>

          <DownloadInput downloads={downloads} setDownloads={setDownloads} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                Subtitles
              </label>
              <button
                type="button"
                onClick={addSubtitle}
                className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-500/30 text-sm"
              >
                <Plus className="h-4 w-4 inline mr-1" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {subtitles.map((sub, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Subtitles className="h-5 w-5 text-purple-400" />
                  <input
                    placeholder="Language"
                    value={sub.language}
                    onChange={(e) => {
                      const next = [...subtitles];
                      next[i].language = e.target.value;
                      setSubtitles(next);
                    }}
                    className="w-32 px-2 py-1 bg-gray-700 rounded text-sm text-white"
                  />
                  <input
                    placeholder="URL"
                    type="url"
                    value={sub.url}
                    onChange={(e) => {
                      const next = [...subtitles];
                      next[i].url = e.target.value;
                      setSubtitles(next);
                    }}
                    className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm text-white"
                  />
                  <button onClick={() => removeSubtitle(i)}>
                    <X className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Check className="h-5 w-5 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}