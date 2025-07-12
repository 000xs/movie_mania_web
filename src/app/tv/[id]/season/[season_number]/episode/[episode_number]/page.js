"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar, Clock, Play, Info, Download } from 'lucide-react';
import { getTVSeriesDetails, getImageUrl, getBackdropUrl, getTVEpisodeDetails } from '@/lib/tmdb';

export default function EpisodePage() {
  const params = useParams();
  const { id, season_number, episode_number } = params;
  const [series, setSeries] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && season_number && episode_number) {
      const fetchEpisodeData = async () => {
        try {
          setLoading(true);
          const seriesData = await getTVSeriesDetails(id);
          const episodeData = await getTVEpisodeDetails(id, season_number, episode_number);
          setSeries(seriesData);
          setEpisode(episodeData);
        } catch (error) {
          console.error('Error fetching episode data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchEpisodeData();
    }
  }, [id, season_number, episode_number]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (!series || !episode) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Episode not found.</p>
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6">E{episode.episode_number}: {episode.name}</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-300">{series.name} - Season {season_number}</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm">{episode.vote_average.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{new Date(episode.air_date).getFullYear()}</span>
            </div>
            {episode.runtime && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{episode.runtime}m</span>
              </div>
            )}
          </div>
          <p className="text-lg mb-8 leading-relaxed max-w-xl">
            {episode.overview || series.overview.slice(0, 150) + '...'}
          </p>
          <div className="flex space-x-4">
            <button className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold rounded-md transition-colors flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Play Episode
            </button>
            {episode.downloads && episode.downloads.length > 0 && (
              <a href={episode.downloads[0].url} target="_blank" rel="noopener noreferrer" className="border border-gray-400 text-white hover:bg-gray-800 px-8 py-3 text-lg bg-transparent rounded-md transition-colors flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Download
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Episode Details Section */}
      <main className="px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-4">Overview</h2>
            <p className="text-gray-300 leading-relaxed">{episode.overview || series.overview}</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Details</h2>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p><strong>Episode Number:</strong> {episode.episode_number}</p>
              <p><strong>Season Number:</strong> {episode.season_number}</p>
              <p><strong>Air Date:</strong> {new Date(episode.air_date).toLocaleDateString()}</p>
              {episode.runtime && <p><strong>Runtime:</strong> {episode.runtime} minutes</p>}
              <p><strong>Vote Average:</strong> {episode.vote_average.toFixed(1)}</p>
              <p><strong>Vote Count:</strong> {episode.vote_count}</p>
            </div>

            {episode.guest_stars && episode.guest_stars.length > 0 && (
              <>
                <h2 className="text-3xl font-bold mt-8 mb-4">Guest Stars</h2>
                <div className="grid grid-cols-2 gap-4">
                  {episode.guest_stars.slice(0, 10).map(person => (
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
