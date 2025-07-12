"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Film, Download, Subtitles, Calendar, Star, Users, Clock, Image, FileText, X, Plus, Check } from "lucide-react";
import { getTVSeriesDetails } from "@/lib/tmdb-server";
import SubmitButton from "@/components/SubmitButton";
import InputField from "@/components/InputField";
import DownloadInput from "@/components/DownloadInput";
import SubtitleInput from "@/components/SubtitleInput";
import { v4 as uuidv4 } from 'uuid';

const telegramSend = async (message) => {
  try {
    const response = await fetch("/api/notify-telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send Telegram notification:", errorData.error || "Unknown error");
    } else {
      console.log("Telegram notification sent successfully!");
    }
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
};

export default function AddTVSeries() {
  const [name, setName] = useState("");
  const [overview, setOverview] = useState("");
  const [posterPath, setPosterPath] = useState("");
  const [backdropPath, setBackdropPath] = useState("");
  const [firstAirDate, setFirstAirDate] = useState("");
  const [voteAverage, setVoteAverage] = useState("");
  const [genres, setGenres] = useState([]);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [tmdbId, setTmdbId] = useState("");
  const [tvseriesId, setTvseriesId] = useState("");
  const [tmdbUrl, setTmdbUrl] = useState("");
  const [episodeRunTime, setEpisodeRunTime] = useState("");
  const [networks, setNetworks] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const extractTmdbIdFromUrl = (url) => {
    const match = url.match(/(movie|tv)\/(\d+)/);
    return match ? match[2] : null;
  };

  const handleTmdbFetch = async () => {
    let idToFetch = tmdbId;

    if (tmdbUrl) {
      const extractedId = extractTmdbIdFromUrl(tmdbUrl);
      if (extractedId) {
        idToFetch = extractedId;
        setTmdbId(extractedId);
      } else {
        setError("Invalid TMDB URL. Please provide a valid TV series URL.");
        return;
      }
    }

    if (!idToFetch) {
      setError("Please enter a TMDB ID or URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tvSeriesDetails = await getTVSeriesDetails(idToFetch);

      if (!tvSeriesDetails) {
        setError("TV series not found on TMDB.");
        return;
      }

      setName(tvSeriesDetails.name || "");
      setOverview(tvSeriesDetails.overview || "");
      setPosterPath(tvSeriesDetails.poster_path ? `https://image.tmdb.org/t/p/w500${tvSeriesDetails.poster_path}` : "");
      setBackdropPath(tvSeriesDetails.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tvSeriesDetails.backdrop_path}` : "");
      setFirstAirDate(tvSeriesDetails.first_air_date || "");
      setVoteAverage(tvSeriesDetails.vote_average ? tvSeriesDetails.vote_average.toString() : "");
      setGenres(tvSeriesDetails.genres?.map(genre => genre.name) || []);
      const credits = await fetch(`/api/tv/${idToFetch}/credits`).then(res => res.json());
      setCast(credits.cast ? credits.cast.slice(0, 5).map(c => c.name) : []);
      setCrew(credits.crew ? credits.crew.slice(0, 5).map(c => c.name) : []);
      setSuccessMessage("TV series details fetched successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (err) {
      setError("Failed to fetch TV series details from TMDB.");
      console.error("Error fetching TV series details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const tvSeriesData = {
      name,
      overview,
      posterPath,
      backdropPath,
      firstAirDate,
      voteAverage: parseFloat(voteAverage),
      genres: genres,
      cast,
      crew,
      downloads,
      subtitles,
      episodeRunTime,
      networks: networks.map(network => ({ name: network })),
      seasons,
    };

    try {
      const response = await fetch("/api/tv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tvSeriesData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create TV series.");
      }

      const data = await response.json();
      router.push("/dashboard"); // Redirect to dashboard after successful creation
      setSuccessMessage("TV series added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      telegramSend(`New TV Series Added: ${name}`);
    } catch (err) {
      setError(err.message);
      console.error("Error creating TV series:", err);
    } finally {
      setLoading(false);
    }
  };

  const addGenre = (genre) => {
    if (genre.trim() && !genres.includes(genre.trim())) {
      setGenres([...genres, genre.trim()]);
    }
  };

  const removeGenre = (index) => {
    setGenres(genres.filter((_, i) => i !== index));
  };

  const addCastMember = (member) => {
    if (cast.length >= 5) {
      setError("You can only add up to 5 cast members.");
      return;
    }
    if (member.trim() && !cast.includes(member.trim())) {
      setCast([...cast, member.trim()]);
    }
  };

  const removeCastMember = (index) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const addCrewMember = (member) => {
    if (crew.length >= 5) {
      setError("You can only add up to 5 crew members.");
      return;
    }
    if (member.trim() && !crew.includes(member.trim())) {
      setCrew([...crew, member.trim()]);
    }
  };

  const removeCrewMember = (index) => {
    setCrew(crew.filter((_, i) => i !== index));
  };

  const addDownload = () => {
    setDownloads([...downloads, { url: "", quality: "1080p", format: "MP4" }]);
  };

  const removeDownload = (index) => {
    setDownloads(downloads.filter((_, i) => i !== index));
  };

  const addSubtitle = () => {
    setSubtitles([...subtitles, { language: "", url: "" }]);
  };

  const removeSubtitle = (index) => {
    setSubtitles(subtitles.filter((_, i) => i !== index));
  };

  const TagInput = ({ placeholder, value, onAdd, onRemove, items, icon: Icon }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        onAdd(inputValue);
        setInputValue("");
      }
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                if (inputValue.trim()) {
                  onAdd(inputValue);
                  setInputValue("");
                }
              }}
              className="absolute right-3 top-3 text-blue-400 hover:text-blue-300"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="ml-2 text-blue-400 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-red-600">
            Add TV Series
          </h1>
          <p className="text-gray-400">Create a new TV series entry with detailed information</p>
        </div>

        {/* Notifications */}
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

        {/* TMDB Fetch Section */}
        <div className="mb-8 p-6 bg-gray-900 rounded-lg">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold">Fetch from TMDB</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="TMDB ID (e.g., 603)"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="TMDB URL"
                value={tmdbUrl}
                onChange={(e) => setTmdbUrl(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleTmdbFetch}
            disabled={loading}
            className="mt-4 w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Fetching...
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                TV Series Title *
              </label>
              <div className="relative">
                <Film className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter TV series title"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Air Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={firstAirDate}
                  onChange={(e) => setFirstAirDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                />
              </div>
            </div>
          </div>

          {/* Rating and Runtime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rating
              </label>
              <div className="relative">
                <Star className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={voteAverage}
                  onChange={(e) => setVoteAverage(e.target.value)}
                  step="0.1"
                  min="0"
                  max="10"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Episode Run Time (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={episodeRunTime.length > 0 ? episodeRunTime[0] : ''}
                  onChange={(e) => setEpisodeRunTime([e.target.value])}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          {/* Overview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Overview
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                rows="4"
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400 resize-none"
                placeholder="Enter TV series overview/description"
              />
            </div>
          </div>

          {/* Images */}
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
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="https://example.com/poster.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-2-gray-300 mb-2">
                Backdrop URL
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  value={backdropPath}
                  onChange={(e) => setBackdropPath(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="https://example.com/backdrop.jpg"
                />
              </div>
            </div>
          </div>

          {/* Genres */}
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

          {/* Cast & Crew */}
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

          {/* Downloads */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                Downloads
              </label>
              <button
                type="button"
                onClick={addDownload}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Add Download
              </button>
            </div>
            <div className="space-y-3">
              {downloads.map((download, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
                  <Download className="h-5 w-5 text-green-400" />
                  <input
                    type="url"
                    placeholder="Download URL"
                    value={download.url}
                    onChange={(e) => {
                      const newDownloads = [...downloads];
                      newDownloads[index].url = e.target.value;
                      setDownloads(newDownloads);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                  <select
                    value={download.quality}
                    onChange={(e) => {
                      const newDownloads = [...downloads];
                      newDownloads[index].quality = e.target.value;
                      setDownloads(newDownloads);
                    }}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  >
                    <option value="4K">4K</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeDownload(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subtitles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                Subtitles
              </label>
              <button
                type="button"
                onClick={addSubtitle}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Add Subtitle
              </button>
            </div>
            <div className="space-y-3">
              {subtitles.map((subtitle, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
                  <Subtitles className="h-5 w-5 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Language"
                    value={subtitle.language}
                    onChange={(e) => {
                      const newSubtitles = [...subtitles];
                      newSubtitles[index].language = e.target.value;
                      setSubtitles(newSubtitles);
                    }}
                    className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400"
                  />
                  <input
                    type="url"
                    placeholder="Subtitle URL"
                    value={subtitle.url}
                    onChange={(e) => {
                      const newSubtitles = [...subtitles];
                      newSubtitles[index].url = e.target.value;
                      setSubtitles(newSubtitles);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtitle(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <SubmitButton>
              <Plus className="h-5 w-5 mr-2" /> ADD
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
