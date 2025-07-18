"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DownloadInput from "@/components/DownloadInput";
import {
  ArrowLeft,
  Save,
  Search,
  Plus,
  X,
  Star,
  Calendar,
  Clock,
  Tv,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  RotateCcw,
} from "lucide-react";

/* ---------- helpers ---------- */
const Input = ({ label, type = "text", value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      value={Array.isArray(value) ? value.join(", ") : value ?? ""}
      onChange={(e) =>
        onChange(type === "number" ? Number(e.target.value) : e.target.value)
      }
      required={required}
      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
    />
  </div>
);

export default function EditTvSeries() {
  const router = useRouter();
  const { id } = useParams();

  /* ---------- state ---------- */
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [refetchUrl, setRefetchUrl] = useState("");

  const [tvData, setTvData] = useState({
    name: "",
    overview: "",
    posterPath: "",
    backdropPath: "",
    firstAirDate: "",
    lastAirDate: "",
    voteAverage: "",
    genres: [],
    seasons: [],
  });

  /* ---------- fetch existing ---------- */
  useEffect(() => {
    fetch(`/api/tv/${id}`)
      .then((r) => r.json())
      .then(setTvData)
      .finally(() => setLoading(false));
  }, [id]);

  /* ---------- refetch from tmdb ---------- */
  const handleRefetch = async () => {
    if (!tvData.tmdbId) return setError("tmdbId missing");
    setRefetching(true);
    try {
      const res = await fetch(`/api/tv/${tvData.tmdbId}`);
      if (!res.ok) throw new Error("TMDB not found");
      const d = await res.json();

      /* keep user subtitles/downloads */
      const freshSeasons = d.seasons.map((fresh) => ({
        ...fresh,
        episodes: fresh.episodes.map((ep) => {
          const oldEp = tvData.seasons
            .find((s) => s.seasonNumber === fresh.seasonNumber)
            ?.episodes.find((e) => e.episodeNumber === ep.episodeNumber);
          return {
            ...ep,
            downloads: oldEp?.downloads || [],
            subtitles: oldEp?.subtitles || [],
          };
        }),
      }));

      setTvData({ ...d, seasons: freshSeasons });
      setSuccess("Refreshed from TMDB");
    } catch (e) {
      setError(e.message);
    } finally {
      setRefetching(false);
    }
  };

  /* ---------- helpers ---------- */

  const extractTmdbIdFromUrl = (url) => url.match(/tv\/(\d+)/)?.[1] ?? null;


  const toggleSeason = (sn) =>
    setTvData((prev) => ({
      ...prev,
      seasons: prev.seasons.map((s) =>
        s.seasonNumber === sn ? { ...s, _expanded: !s._expanded } : s
      ),
    }));

  const addSubtitleToEpisode = (sIdx, eIdx) => {
    const copy = { ...tvData };
    const subs = copy.seasons[sIdx].episodes[eIdx].subtitles || [];
    subs.push({ language: "English", url: "" });
    copy.seasons[sIdx].episodes[eIdx].subtitles = subs;
    setTvData(copy);
  };

  const updateSubtitle = (sIdx, eIdx, subIdx, field, val) => {
    const copy = { ...tvData };
    copy.seasons[sIdx].episodes[eIdx].subtitles[subIdx][field] = val;
    setTvData(copy);
  };

  const removeSubtitle = (sIdx, eIdx, subIdx) => {
    const copy = { ...tvData };
    copy.seasons[sIdx].episodes[eIdx].subtitles.splice(subIdx, 1);
    setTvData(copy);
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...tvData,
      seasons: tvData.seasons.map((s) => ({
        ...s,
        episodes: s.episodes.map((ep) => ({
          ...ep,
          downloads: (ep.downloads || []).filter(Boolean),
          subtitles: (ep.subtitles || []).filter(Boolean),
        })),
      })),
    };
    try {
      const res = await fetch(`/api/tv/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      setSuccess("Saved!");
      setTimeout(() => router.push(`/tv/${id}`), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- render ---------- */
  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href={`/tv/${id}`} className="flex items-center space-x-2 text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Edit {tvData.name || "TV Series"}</span>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleRefetch}
              disabled={refetching || !tvData.tmdbId}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-md text-sm flex items-center"
            >
              {refetching && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              <RotateCcw className="w-4 h-4 mr-1" /> Refetch TMDB
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-2">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-2">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>{success}</span>
          </div>
        </div>
      )}


      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-10 pt-24">
        {/* Basic Info */}
        <div className="bg-gray-900/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Star className="w-6 h-6 mr-3 text-red-500" /> Basic Information
          </h2>

          
          <div className="max-w-4xl mx-auto px-6 pb-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="TMDB URL (e.g. https://www.themoviedb.org/tv/1399)"
                value={refetchUrl}
                onChange={(e) => setRefetchUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={async () => {
                  const tmdbId = extractTmdbIdFromUrl(refetchUrl);
                  if (!tmdbId) return setError("Invalid TMDB URL");
                  setRefetching(true);
                  try {
                    const res = await fetch(`/api/tv/${tmdbId}`);
                    if (!res.ok) throw new Error("TMDB not found");
                    const d = await res.json();
                    // merge user-added downloads / subtitles
                    const freshSeasons = d.seasons.map((fresh) => ({
                      ...fresh,
                      episodes: fresh.episodes.map((ep) => {
                        const oldEp = tvData.seasons
                          .find((s) => s.seasonNumber === fresh.seasonNumber)
                          ?.episodes.find((e) => e.episodeNumber === ep.episodeNumber);
                        return {
                          ...ep,
                          downloads: oldEp?.downloads || [],
                          subtitles: oldEp?.subtitles || [],
                        };
                      }),
                    }));
                    setTvData({ ...d, seasons: freshSeasons });
                    setSuccess("Refreshed from TMDB");
                  } catch (e) {
                    setError(e.message);
                  } finally {
                    setRefetching(false);
                  }
                }}
                disabled={refetching}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-md text-sm flex items-center"
              >
                {refetching && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                <RotateCcw className="w-4 h-4 mr-1" /> Refetch
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title" value={tvData.name} onChange={(v) => setTvData({ ...tvData, name: v })} required />
            <Input label="Original Title" value={tvData.originalName} onChange={(v) => setTvData({ ...tvData, originalName: v })} />
            <Input type="date" label="First Air Date" value={tvData.firstAirDate} onChange={(v) => setTvData({ ...tvData, firstAirDate: v })} />
            <Input type="date" label="Last Air Date" value={tvData.lastAirDate} onChange={(v) => setTvData({ ...tvData, lastAirDate: v })} />
            <Input type="number" step="0.1" label="Rating" value={tvData.voteAverage} onChange={(v) => setTvData({ ...tvData, voteAverage: v })} />
            <Input type="number" label="Runtime (min)" value={tvData.episodeRunTime?.[0] || ""} onChange={(v) => setTvData({ ...tvData, episodeRunTime: [Number(v)] })} />
            <Input label="Poster URL" value={tvData.posterPath} onChange={(v) => setTvData({ ...tvData, posterPath: v })} />
            <Input label="Backdrop URL" value={tvData.backdropPath} onChange={(v) => setTvData({ ...tvData, backdropPath: v })} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Overview</label>
            <textarea rows={4} value={tvData.overview} onChange={(e) => setTvData({ ...tvData, overview: e.target.value })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Genres</label>
            <input
              value={tvData.genres?.join(", ")}
              onChange={(e) => setTvData({ ...tvData, genres: e.target.value.split(",").map((g) => g.trim()) })}
              placeholder="Action, Drama, Fantasy"
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg"
            />
          </div>
        </div>

        {/* Seasons & Episodes */}
        {tvData.seasons?.map((season, sIdx) => (
          <div key={season.seasonNumber} className="bg-gray-900/50 rounded-lg p-4">
            <button type="button" onClick={() => toggleSeason(season.seasonNumber)} className="w-full flex justify-between items-center mb-3">
              <span className="font-semibold">Season {season.seasonNumber} – {season.name}</span>
              {season._expanded ? <ChevronUp /> : <ChevronDown />}
            </button>

            {season._expanded && (
              <div className="p-3 border-t border-gray-700">
                {season.episodes.map((ep, eIdx) => (
                  <div key={ep.episodeNumber} className="mt-4 p-3 bg-gray-800 rounded">
                    <h4 className="font-semibold">Ep {ep.episodeNumber}: {ep.name}</h4>
                    <p className="text-sm text-gray-400">{ep.airDate} • {ep.runtime} min</p>

                    <div className="mt-2">
                      <label className="text-sm font-medium mb-1">Downloads</label>
                      <DownloadInput
                        downloads={ep.downloads}
                        setDownloads={(newDl) => {
                          const next = [...tvData.seasons];
                          next[sIdx].episodes[eIdx].downloads = newDl;
                          setTvData({ ...tvData, seasons: next });
                        }}
                      />
                    </div>

                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-1">Subtitles</h5>
                      {(ep.subtitles || []).map((sub, subIdx) => (
                        <div key={subIdx} className="grid grid-cols-11 gap-2 text-xs mb-1">
                          <input
                            placeholder="Language"
                            value={sub.language}
                            onChange={(e) => updateSubtitle(sIdx, eIdx, subIdx, "language", e.target.value)}
                            className="col-span-5 bg-gray-700 rounded px-2 py-1"
                          />
                          <input
                            placeholder="URL"
                            value={sub.url}
                            onChange={(e) => updateSubtitle(sIdx, eIdx, subIdx, "url", e.target.value)}
                            className="col-span-5 bg-gray-700 rounded px-2 py-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeSubtitle(sIdx, eIdx, subIdx)}
                            className="col-span-1 flex justify-center items-center text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSubtitleToEpisode(sIdx, eIdx)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-xs px-2 py-1 rounded"
                      >
                        + Add Subtitle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Submit */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl flex items-center"
          >
            {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
            <Save className="w-5 h-5 mr-2" /> Update Series
          </button>
        </div>
      </form>
    </div>
  );
}