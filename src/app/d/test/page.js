// app/page.js
'use client';

import { useState, useEffect } from 'react';
import { Search, Film, Tv, Star, Calendar, Play, Info } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [moviesResponse, tvResponse] = await Promise.all([
        fetch('/api/movies?limit=8'),
        fetch('/api/tv?limit=8')
      ]);

      const moviesData = await moviesResponse.json();
      const tvData = await tvResponse.json();

      setMovies(moviesData.results || []);
      setTVSeries(tvData.results || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Film className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-white">MovieDB Clone</h1>
            </div>
            <Link 
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Movies & TV Shows
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Explore millions of movies and TV series from around the world
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for movies, TV shows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Search Results */}
      {searchTerm && (
        <section className="py-12 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold text-white mb-8">
              Search Results for "{searchTerm}"
            </h3>
            {searchLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-400">Searching...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {searchResults.map((item) => (
                  <MovieCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popular Movies */}
      <section className="py-12 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
            <Film className="h-6 w-6 mr-2" />
            Popular Movies
          </h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} item={movie} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular TV Series */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
            <Tv className="h-6 w-6 mr-2" />
            Popular TV Series
          </h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {tvSeries.map((tv) => (
                <MovieCard key={tv._id} item={tv} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 MovieDB Clone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// MovieCard Component
function MovieCard({ item }) {
  const title = item.title || item.name;
  const releaseDate = item.releaseDate || item.firstAirDate;
  const mediaType = item.media_type || (item.title ? 'movie' : 'tv');

  return (
    <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative">
        {item.posterPath ? (
          <img
            src={item.posterPath}
            alt={title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-64 bg-gray-600 flex items-center justify-center">
            {mediaType === 'movie' ? (
              <Film className="h-12 w-12 text-gray-400" />
            ) : (
              <Tv className="h-12 w-12 text-gray-400" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
              <Info className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-white font-semibold mb-2 truncate">{title}</h4>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            {item.voteAverage?.toFixed(1) || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
