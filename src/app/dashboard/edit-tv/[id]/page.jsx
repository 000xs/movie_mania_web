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
} from "lucide-react";

export default function EditTvSeries() {
  const router = useRouter();
  const { id } = useParams();

  /* ---------- state ---------- */
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  

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

  /* ---------- fetch ---------- */
  useEffect(() => {
    fetch(`/api/tv/${id}`)
      .then((r) => r.json())
      .then((d) => setTvData(d))
      .finally(() => setLoading(false));
  }, [id]);

  /* ---------- helpers ---------- */
  const toggleSeason = (sn) =>
    setTvData((prev) => ({
      ...prev,
      seasons: prev.seasons.map((s) =>
        s.seasonNumber === sn ? { ...s, _expanded: !s._expanded } : s
      ),
    }));

  const addSubtitleToEpisode = (sIdx, eIdx) => {
    const copy = { ...tvData };
    copy.seasons[sIdx].episodes[eIdx].subtitles.push({
      language: "English",
      url: "",
    });
    setTvData(copy);
  };

  const updateSubtitle = (sIdx, eIdx, subIdx, field, value) => {
    const copy = { ...tvData };
    copy.seasons[sIdx].episodes[eIdx].subtitles[subIdx][field] = value;
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

    /* safe defaults */
    const payload = {
      ...tvData,
      seasons: tvData.seasons.map((s) => ({
        ...s,
        episodes: s.episodes.map((ep) => ({
          ...ep,
          downloads: (ep.downloads || []).map((d) => ({
            downloadType: d.downloadType || "DIRECT",
            videoType: d.videoType || "WEB_DL",
            quality: d.quality || "1080p",
            link: d.link || "https://placeholder.invalid",
          })),
          subtitles: (ep.subtitles || []).map((sub) => ({
            language: sub.language || "English",
            url: sub.url || "https://placeholder.invalid",
          })),
        })),
      })),
    };

    try {
      const res = await fetch(`/api/tv/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      alert("Series updated!");
      router.push(`/tv/${id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href={`/tv/${id}`} className="flex items-center space-x-2 text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Edit {tvData.name}</span>
          </Link>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-10 pt-24">
        {/* Basic Info */}
        <div className="bg-gray-900/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Star className="w-6 h-6 mr-3 text-red-500" /> Basic Information
          </h2>
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
        </div>

        {/* Seasons */}
        {tvData.seasons.map((season, sIdx) => (
          <div key={season.seasonNumber} className="bg-gray-900/50 rounded-lg p-4">
            <button type="button" onClick={() => toggleSeason(season.seasonNumber)} className="w-full flex justify-between items-center mb-3">
              <span className="font-semibold">Season {season.seasonNumber} – {season.name}</span>
              {season._expanded ? <ChevronUp /> : <ChevronDown />}
            </button>

            {season._expanded && (
              <>
                {/* Episodes */}
                {season.episodes.map((ep, eIdx) => (
                  <div key={ep.episodeNumber} className="mt-4 p-3 bg-gray-800 rounded">
                    <h4 className="font-semibold">Ep {ep.episodeNumber}: {ep.name}</h4>

                    {/* Downloads */}
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

                    {/* Subtitles */}
                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-1">Subtitles</h5>
                      {ep.subtitles.map((sub, subIdx) => (
                        <div key={subIdx} className="grid grid-cols-11 gap-2 text-xs mb-1">
                          <input
                            placeholder="Language"
                            value={sub.language}
                            onChange={(e) =>
                              updateSubtitle(sIdx, eIdx, subIdx, "language", e.target.value)
                            }
                            className="col-span-5 bg-gray-700 rounded px-2 py-1"
                          />
                          <input
                            placeholder="Subtitle URL"
                            value={sub.url}
                            onChange={(e) =>
                              updateSubtitle(sIdx, eIdx, subIdx, "url", e.target.value)
                            }
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
              </>
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

/* ---------- tiny helper ---------- */
function Input({ label, type = "text", value, onChange, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        required={required}
        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
      />
    </div>
  );
}