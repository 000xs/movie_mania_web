"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTVSeriesDetails } from "@/lib/tmdb-server";
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";

export default function EditTVSeries({ params }) {
  const { id } = params;
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
  const [tmdbUrl, setTmdbUrl] = useState("");
  const [episodeRunTime, setEpisodeRunTime] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchTVSeriesData = async () => {
      try {
        const res = await fetch(`/api/tv/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch TV series data.");
        }
        const data = await res.json();
        const series = data; // Assuming the API returns the TV series object directly

        setName(series.name || "");
        setOverview(series.overview || "");
        setPosterPath(series.posterPath || "");
        setBackdropPath(series.backdropPath || "");
        setFirstAirDate(series.firstAirDate ? series.firstAirDate.split('T')[0] : ""); // Format date for input type="date"
        setVoteAverage(series.voteAverage ? series.voteAverage.toString() : "");
        setGenres(series.genres?.map(genre => genre.name) || []);
        setCast(series.cast || []);
        setCrew(series.crew || []);
        setDownloads(series.downloads || []);
        setSubtitles(series.subtitles || []);
        setTmdbId(series.tmdbId || ""); // Assuming tmdbId is stored in the series object
        setEpisodeRunTime(series.episodeRunTime || []);
        setNetworks(series.networks?.map(network => network.name) || []);
        setSeasons(series.seasons || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching TV series for edit:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTVSeriesData();
    }
  }, [id]);

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
      setCast(credits.cast?.map(member => member.name) || []);
      setCrew(credits.crew?.map(member => member.name) || []);
      setEpisodeRunTime(tvSeriesDetails.episode_run_time || []);
      setNetworks(tvSeriesDetails.networks?.map(network => network.name) || []);
      setSeasons(tvSeriesDetails.seasons || []);

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
      genres: genres.map(genre => ({ name: genre })),
      cast,
      crew,
      downloads,
      subtitles,
      tmdbId, // Include tmdbId in the data to be saved
      episodeRunTime,
      networks: networks.map(network => ({ name: network })),
      seasons,
    };

    try {
      const response = await fetch(`/api/tv/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tvSeriesData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update TV series.");
      }

      const data = await response.json();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Error updating TV series:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading TV series data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Edit TV Series</h1>
      {error && <div className="bg-red-500 text-white p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Title" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <InputField label="Overview" id="overview" type="textarea" value={overview} onChange={(e) => setOverview(e.target.value)} rows="3" />
        <InputField label="Poster URL" id="posterPath" value={posterPath} onChange={(e) => setPosterPath(e.target.value)} />
        <InputField label="Backdrop URL" id="backdropPath" value={backdropPath} onChange={(e) => setBackdropPath(e.target.value)} />
        <InputField label="First Air Date" id="firstAirDate" type="date" value={firstAirDate} onChange={(e) => setFirstAirDate(e.target.value)} />
        <InputField label="Rating" id="voteAverage" type="number" value={voteAverage} onChange={(e) => setVoteAverage(e.target.value)} step="0.1" />
        <InputField label="Genres (comma separated)" id="genres" value={genres.join(",")} onChange={(e) => setGenres(e.target.value.split(",").map(g => g.trim()))} />
        <InputField label="Cast (comma separated)" id="cast" value={cast.join(",")} onChange={(e) => setCast(e.target.value.split(",").map(c => c.trim()))} />
        <InputField label="Crew (comma separated)" id="crew" value={crew.join(",")} onChange={(e) => setCrew(e.target.value.split(",").map(c => c.trim()))} />
        <InputField
          label="Downloads (JSON array)"
          id="downloads"
          type="textarea"
          value={JSON.stringify(downloads, null, 2)}
          onChange={(e) => {
            try {
              setDownloads(JSON.parse(e.target.value));
            } catch (error) {
              // Handle JSON parsing errors
            }
          }}
          rows="3"
        />
        <InputField
          label="Subtitles (JSON array)"
          id="subtitles"
          type="textarea"
          value={JSON.stringify(subtitles, null, 2)}
          onChange={(e) => {
            try {
              setSubtitles(JSON.parse(e.target.value));
            } catch (error) {
              // Handle JSON parsing errors
            }
          }}
          rows="3"
        />
        <InputField
          label="Episode Run Time (JSON array)"
          id="episodeRunTime"
          type="textarea"
          value={JSON.stringify(episodeRunTime, null, 2)}
          onChange={(e) => {
            try {
              setEpisodeRunTime(JSON.parse(e.target.value));
            } catch (error) {
              // Handle JSON parsing errors
            }
          }}
          rows="3"
        />
        <InputField label="Networks (comma separated)" id="networks" value={networks.join(",")} onChange={(e) => setNetworks(e.target.value.split(",").map(n => n.trim()))} />
        <InputField
          label="Seasons (JSON array)"
          id="seasons"
          type="textarea"
          value={JSON.stringify(seasons, null, 2)}
          onChange={(e) => {
            try {
              setSeasons(JSON.parse(e.target.value));
            } catch (error) {
              // Handle JSON parsing errors
            }
          }}
          rows="3"
        />
        <div>
          <InputField label="TMDB ID" id="tmdbId" value={tmdbId} onChange={(e) => setTmdbId(e.target.value)} />
          <InputField label="TMDB URL" id="tmdbUrl" value={tmdbUrl} onChange={(e) => setTmdbUrl(e.target.value)} placeholder="e.g., https://www.themoviedb.org/tv/12345" />
          <button
            type="button"
            onClick={handleTmdbFetch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 mt-2"
          >
            {loading ? "Fetching..." : "Fetch from TMDB"}
          </button>
        </div>
        <SubmitButton loading={loading}>Update TV Series</SubmitButton>
      </form>
    </div>
  );
}
