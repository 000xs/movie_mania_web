"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar, Clock, Play, Info } from 'lucide-react';
import { getTVSeriesDetails, getImageUrl, getBackdropUrl, getTVSeasonDetails } from '@/lib/tmdb';

export default function SeasonPage() {
  const params = useParams();
  const { id, season_number } = params;
  const [series, setSeries] = useState(null);
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && season_number) {
      const fetchSeasonData = async () => {
        try {
          setLoading(true);
          const seriesData = await getTVSeriesDetails(id);
          const seasonData = await getTVSeasonDetails(id, season_number);
          setSeries(seriesData);
          setSeason(seasonData);
        } catch (error) {
          console.error('Error fetching season data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchSeasonData();
    }
  }, [id, season_number]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading season...</p>
        </div>
      </div>
    );
  }

  if (!series || !season) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Season not found.</p>
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{season.name}</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-300">{series.name}</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{new Date(season.air_date).getFullYear()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{season.episode_count} Episodes</span>
            </div>
          </div>
          <p className="text-lg mb-8 leading-relaxed max-w-xl">
            {season.overview || series.overview.slice(0, 150) + '...'}
          </p>
        </div>
      </section>

      {/* Episodes Section */}
      <main className="px-4 md:px-8 py-16">
        <h2 className="text-3xl font-bold mb-4">Episodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {season.episodes.map(episode => (
            <Link key={episode.id} href={`/tv/${id}/season/${season_number}/episode/${episode.episode_number}`}>
              <div className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                <Image
                  src={getImageUrl(episode.still_path, 'w300')}
                  alt={episode.name}
                  width={300}
                  height={170}
                  className="rounded mb-4 object-cover w-full"
                />
                <h3 className="text-xl font-semibold mb-2">E{episode.episode_number}: {episode.name}</h3>
                <p className="text-sm text-gray-400 mb-2">Air Date: {new Date(episode.air_date).toLocaleDateString()}</p>
                <p className="text-sm line-clamp-3">{episode.overview}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
