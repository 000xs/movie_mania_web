"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Film, Subtitles, Calendar, Star, Users, Clock, Image, FileText, X, Plus, Check } from "lucide-react";
import { getMovieDetails } from "@/lib/tmdb-server";
import DownloadInput from "@/components/DownloadInput";
export default function AddMovie() {
  const router = useRouter();
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
  const [tmdbId, setTmdbId] = useState("");
  const [tmdbUrl, setTmdbUrl] = useState("");
  const [runtime, setRuntime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
        setError("Invalid TMDB URL. Please provide a valid movie URL.");
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
      const movieDetails = await getMovieDetails(idToFetch);

      if (!movieDetails) {
        setError("Movie not found on TMDB.");
        return;
      }

      // console.log(movieDetails)

      setTitle(movieDetails.title || "");
      setOverview(movieDetails.overview || "");
      setPosterPath(movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : "");
      setBackdropPath(movieDetails.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : "");
      setReleaseDate(movieDetails.release_date || "");
      setVoteAverage(movieDetails.vote_average ? movieDetails.vote_average.toString() : "");
      setGenres(movieDetails.genres?.map(genre => genre.name) || []);
      setProductionCompanies(movieDetails.production_companies || []);
      setProductionCountries(movieDetails.production_countries || []);
      setSpokenLanguages(movieDetails.spoken_languages || []);
      const credits = await fetch(`/api/movies/${idToFetch}/credits`).then(res => res.json());

      setCast(credits.cast ? credits.cast.slice(0, 5) : []);
      setCrew(credits.crew ? credits.crew.slice(0, 5) : []);
      // console.log(credits.cast, credits.crew);
      setRuntime(movieDetails.runtime?.toString() || "");

      setSuccessMessage("Movie details fetched successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (err) {
      setError("Failed to fetch movie details from TMDB.");
      console.error("Error fetching movie details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const movieData = {
      title,
      overview,
      posterPath,
      backdropPath,
      releaseDate,
      voteAverage: parseFloat(voteAverage),
      genres: genres,
      cast,
      crew,
      productionCompanies,
      productionCountries,
      spokenLanguages,
      downloads,
      subtitles,
      runtime: runtime,
    };
    // / Prepare download info for telegram notification
    const telegramPayload = {
      type: 'movie',
      media: {
        ...movieData,
        downloads: movieData.downloads // ✅ keep as array
      }
    };
    const message_id = telegramSend(telegramPayload)

    if (message_id) {
      console.log(message_id)
      setSuccessMessage("Telegram added succesfully!")

      // save databse mive data 

      try {
        const response = await fetch("/api/movies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(movieData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create movie.");
        } else {


        }

        setSuccessMessage("Movie added successfully!");
        // router.push("/dashboard");


      } catch (err) {
        setError(err.message);
        console.error("Error creating movie:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Tellegram add errr!")
    }

  };

  const telegramSend = async (data) => {
    try {
      const response = await fetch("/api/notify-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {

        const errorData = await response.json();
        const data = await response.json();
        console.log(data)
        console.error("Failed to send Telegram notification:", errorData.error || "Unknown error");
        return data.message_id
      } else {
        console.log("Telegram notification sent successfully!");
      }
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
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

  const addCastMember = (memberName) => {
    if (cast.length >= 5) {
      setError("You can only add up to 5 cast members.");
      return;
    }
    const newMember = { name: memberName.trim(), character: '', profilePath: '' };
    if (memberName.trim() && !cast.some(m => m.name.toLowerCase() === memberName.trim().toLowerCase())) {
      setCast([...cast, newMember]);
    }
  };

  const removeCastMember = (index) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const addCrewMember = (memberName) => {
    if (crew.length >= 5) {
      setError("You can only add up to 5 crew members.");
      return;
    }
    const newMember = { name: memberName.trim(), job: '', department: '', profilePath: '' };
    if (memberName.trim() && !crew.some(m => m.name.toLowerCase() === memberName.trim().toLowerCase())) {
      setCrew([...crew, newMember]);
    }
  };

  const removeCrewMember = (index) => {
    setCrew(crew.filter((_, i) => i !== index));
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
                {typeof item === 'object' && item.name ? item.name : item}
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
            Add Movie
          </h1>
          <p className="text-gray-400">Create a new movie entry with detailed information</p>
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
                Movie Title *
              </label>
              <div className="relative">
                <Film className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter movie title"
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
                Runtime (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={runtime}
                  onChange={(e) => setRuntime(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                  placeholder="120"
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
                placeholder="Enter movie overview/description"
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
          <DownloadInput downloads={downloads} setDownloads={setDownloads} />

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
                    className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
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
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-48"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding Movie...
                </div>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Movie
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
