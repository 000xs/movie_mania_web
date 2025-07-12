"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMovieDetails } from "@/lib/tmdb-server";
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";

export default function EditMovie({ params }) {
  const { id } = params;
  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [posterPath, setPosterPath] = useState("");
  const [backdropPath, setBackdropPath] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [voteAverage, setVoteAverage] = useState("");
  const [genres, setGenres] = useState([]);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [tmdbId, setTmdbId] = useState("");
  const [tmdbUrl, setTmdbUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const res = await fetch(`/api/movies/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch movie data.");
        }
        const data = await res.json();
        const movie = data.results[0]; // Assuming the API returns an array with one movie

        setTitle(movie.title || "");
        setOverview(movie.overview || "");
        setPosterPath(movie.posterPath || "");
        setBackdropPath(movie.backdropPath || "");
        setReleaseDate(movie.releaseDate ? movie.releaseDate.split('T')[0] : ""); // Format date for input type="date"
        setVoteAverage(movie.voteAverage ? movie.voteAverage.toString() : "");
        setGenres(movie.genres?.map(genre => genre.name) || []);
        setCast(movie.cast || []);
        setCrew(movie.crew || []);
        setDownloads(movie.downloads || []);
        setSubtitles(movie.subtitles || []);
        setTmdbId(movie.tmdbId || ""); // Assuming tmdbId is stored in the movie object
      } catch (err) {
        setError(err.message);
        console.error("Error fetching movie for edit:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieData();
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

      setTitle(movieDetails.title || "");
      setOverview(movieDetails.overview || "");
      setPosterPath(movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : "");
      setBackdropPath(movieDetails.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : "");
      setReleaseDate(movieDetails.release_date || "");
      setVoteAverage(movieDetails.vote_average ? movieDetails.vote_average.toString() : "");
      setGenres(movieDetails.genres?.map(genre => genre.name) || []);
      const credits = await fetch(`/api/movies/${idToFetch}/credits`).then(res => res.json());
      setCast(credits.cast?.map(member => member.name) || []);
      setCrew(credits.crew?.map(member => member.name) || []);

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
      genres: genres.map(genre => ({ name: genre })),
      cast,
      crew,
      downloads,
      subtitles,
      tmdbId, // Include tmdbId in the data to be saved
    };

    try {
      const response = await fetch(`/api/movies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update movie.");
      }

      const data = await response.json();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Error updating movie:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading movie data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Edit Movie</h1>
      {error && <div className="bg-red-500 text-white p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <InputField label="Overview" id="overview" type="textarea" value={overview} onChange={(e) => setOverview(e.target.value)} rows="3" />
        <InputField label="Poster URL" id="posterPath" value={posterPath} onChange={(e) => setPosterPath(e.target.value)} />
        <InputField label="Backdrop URL" id="backdropPath" value={backdropPath} onChange={(e) => setBackdropPath(e.target.value)} />
        <InputField label="Release Date" id="releaseDate" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
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
        <div>
          <InputField label="TMDB ID" id="tmdbId" value={tmdbId} onChange={(e) => setTmdbId(e.target.value)} />
          <InputField label="TMDB URL" id="tmdbUrl" value={tmdbUrl} onChange={(e) => setTmdbUrl(e.target.value)} placeholder="e.g., https://www.themoviedb.org/movie/12345" />
          <button
            type="button"
            onClick={handleTmdbFetch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 mt-2"
          >
            {loading ? "Fetching..." : "Fetch from TMDB"}
          </button>
        </div>
        <SubmitButton loading={loading}>Update Movie</SubmitButton>
      </form>
    </div>
  );
}
