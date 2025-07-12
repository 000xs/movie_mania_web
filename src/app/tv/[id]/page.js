"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar, Clock, Play, Info } from 'lucide-react';
import { getTVSeriesDetails, getImageUrl, getBackdropUrl, getTVSeriesCredits } from '@/lib/tmdb';

export default function TVSeriesPage() {
  const params = useParams();
  const { id } = params;
  const [series, setSeries] = useState(null);
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTVSeriesData = async () => {
        try {
          setLoading(true);
          const seriesData = await getTVSeriesDetails(id);
          const creditsData = await getTVSeriesCredits(id);
          setSeries(seriesData);
          setCredits(creditsData);
        } catch (error) {
          console.error('Error fetching TV series data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTVSeriesData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading TV series...</p>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">TV Series not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getBackdropUrl(series.backdrop_path)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        </div>
        <div className="relative z-10 px-4 md:px-8 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{series.name}</h1>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm">{series.vote_average.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{new Date(series.first_air_date).getFullYear()}</span>
            </div>
            {series.episode_run_time && series.episode_run_time.length > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{series.episode_run_time[0]}m/ep</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {series.genres.slice(0, 3).map((g) => (
              <span
                key={g.id}
                className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
              >
                {g.name}
              </span>
            ))}
          </div>
          <p className="text-lg mb-8 leading-relaxed max-w-xl">
            {series.overview.slice(0, 150)}...
          </p>
          <div className="flex space-x-4">
            <button className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold rounded-md transition-colors flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Play Trailer
            </button>
            <button className="border border-gray-400 text-white hover:bg-gray-800 px-8 py-3 text-lg bg-transparent rounded-md transition-colors flex items-center">
              <Info className="w-5 h-5 mr-2" />
              More Info
            </button>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <main className="px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-4">Overview</h2>
            <p className="text-gray-300 leading-relaxed">{series.overview}</p>

            <h2 className="text-3xl font-bold mt-8 mb-4">Seasons ({series.number_of_seasons})</h2>
            <div className="space-y-4">
              {series.seasons.map(season => (
                <Link key={season.id} href={`/tv/${id}/season/${season.season_number}`}>
                  <div className="bg-gray-900 p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-800 transition-colors">
                    <Image
                      src={getImageUrl(season.poster_path)}
                      alt={season.name}
                      width={80}
                      height={120}
                      className="rounded"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{season.name}</h3>
                      <p className="text-sm text-gray-400">{new Date(season.air_date).getFullYear()} | {season.episode_count} Episodes</p>
                      <p className="text-sm mt-2 line-clamp-2">{season.overview}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Details</h2>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p><strong>Status:</strong> {series.status}</p>
              <p><strong>First Air Date:</strong> {series.first_air_date}</p>
              <p><strong>Last Air Date:</strong> {series.last_air_date}</p>
              <p><strong>Number of Episodes:</strong> {series.number_of_episodes}</p>
              <p><strong>Original Language:</strong> {series.original_language.toUpperCase()}</p>
            </div>

            <h2 className="text-3xl font-bold mt-8 mb-4">Cast</h2>
            <div className="grid grid-cols-2 gap-4">
              {credits.cast.slice(0, 10).map(person => (
                <div key={person.id} className="flex items-center space-x-2">
                  <Image
                    src={getImageUrl(person.profile_path, 'w185')}
                    alt={person.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm">{person.name}</p>
                    <p className="text-xs text-gray-400">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
