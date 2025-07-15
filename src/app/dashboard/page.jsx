"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import MovieCard from "@/components/MovieCard";
import TVSeriesCard from "@/components/TVSeriesCard";
import Image from "next/image";

async function getMovies() {
  const res = await fetch("/api/movies");
  const data = await res.json();
  return data.results;
}

async function getTVSeries() {
  const res = await fetch("/api/tv");
  const data = await res.json();
  return data.results;
}

export default function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const moviesData = await getMovies();
        const tvSeriesData = await getTVSeries();
        setMovies(moviesData);
        setTVSeries(tvSeriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      {movies.length > 0 && (
        <div
          className="relative h-96 bg-cover bg-center flex items-end p-8"
          style={{ backgroundImage: `url(${movies[0].backdropPath || movies[0].posterPath || '/placeholder.svg'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-bold mb-2 text-white">{movies[0].title}</h2>
            <p className="text-lg text-gray-300 mb-4 line-clamp-3">{movies[0].overview}</p>
            <Link href={`/movie/${movies[0].movieId}`} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
              Watch Now
            </Link>
          </div>
        </div>
      )}

      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

        {/* Action Buttons */}
        <div className="mb-8 flex space-x-4">
          <Link href="/dashboard/add-movie" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-block">
            Add Movie
          </Link>
          <Link href="/dashboard/add-tv" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-block">
            Add TV Series
          </Link>
        </div>

        {/* Movie Management */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Movies</h2>
          {movies.length === 0 ? (
            <p className="text-gray-400">No movies found. Add some to get started!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {/* TV Series Management */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">TV Series</h2>
          {tvSeries.length === 0 ? (
            <p className="text-gray-400">No TV series found. Add some to get started!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {tvSeries.map((series) => (
                <TVSeriesCard key={series.tvseriesId} series={series} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
