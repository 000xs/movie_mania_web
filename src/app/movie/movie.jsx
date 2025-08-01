"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  Calendar,
  Menu,
  X,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
} from "lucide-react";
import axios from "axios";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
    &copy; {new Date().getFullYear()} Movie Mania. All rights reserved.
  </footer>
);

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(24);

  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  /* ------------------------------------------------------------------ */
  /* 1.  Fetch movies once + hard-coded TMDB genre list                   */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const { data: res } = await axios.get("/api/movies");
        const movieArray = res?.results ?? [];

        const genreArray = [
          { id: 28, name: "Action" },
          { id: 12, name: "Adventure" },
          { id: 16, name: "Animation" },
          { id: 35, name: "Comedy" },
          { id: 80, name: "Crime" },
          { id: 99, name: "Documentary" },
          { id: 18, name: "Drama" },
          { id: 10751, name: "Family" },
          { id: 14, name: "Fantasy" },
          { id: 36, name: "History" },
          { id: 27, name: "Horror" },
          { id: 10402, name: "Music" },
          { id: 9648, name: "Mystery" },
          { id: 10749, name: "Romance" },
          { id: 878, name: "Science Fiction" },
          { id: 10770, name: "TV Movie" },
          { id: 53, name: "Thriller" },
          { id: 10752, name: "War" },
          { id: 37, name: "Western" },
        ];

        setMovies(movieArray);
        setFilteredMovies(movieArray);
        setGenres(genreArray);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, []);

  /* ------------------------------------------------------------------ */
  /* 2.  Filter & sort                                                  */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let list = [...movies];

    // search
    if (search.trim()) {
      list = list.filter((m) =>
        m.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // genre
    if (selectedGenre !== "all") {
      list = list.filter((m) => (m.genres || []).includes(selectedGenre));
    }

    // year
    if (selectedYear !== "all") {
      const target = Number(selectedYear);
      list = list.filter((m) => {
        const y = new Date(m.releaseDate || m.year).getFullYear();
        return y === target;
      });
    }

    // rating
    if (selectedRating !== "all") {
      const min = Number(selectedRating);
      list = list.filter(
        (m) => Number(m.voteAverage || m.rating) >= min
      );
    }

    // sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "year":
          return (
            new Date(b.releaseDate || b.year).getFullYear() -
            new Date(a.releaseDate || a.year).getFullYear()
          );
        case "rating":
          return (
            Number(b.voteAverage || b.rating) -
            Number(a.voteAverage || a.rating)
          );
        case "popularity":
        default:
          return Number(b.popularity || 0) - Number(a.popularity || 0);
      }
    });

    setFilteredMovies(list);
    setCurrentPage(1);
  }, [movies, search, selectedGenre, selectedYear, selectedRating, sortBy]);

  const handleSearch = (e) => e.preventDefault();

  /* ------------------------------------------------------------------ */
  /* 3.  Pagination                                                     */
  /* ------------------------------------------------------------------ */
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4">Loading movies…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between bg-black px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded flex items-center justify-center font-bold text-sm sm:text-xl">
                M
              </div>
              <span className="text-lg sm:text-xl font-bold text-red-600 hidden xs:block">Movie Mania</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6">
              <Link href="/" className="hover:text-gray-300 transition-colors text-sm">
                Home
              </Link>
              <Link href="/movie" className="text-red-500 hover:text-red-400 transition-colors text-sm font-semibold">
                Movies
              </Link>
              <Link href="/tv" className="hover:text-gray-300 transition-colors text-sm">
                TV Series
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies..."
                className="w-40 sm:w-48 md:w-64 px-3 sm:px-4 py-2 bg-black/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <Search className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-md transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black/95 border-t border-gray-800">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative sm:hidden">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full px-4 py-2 bg-black/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="hover:text-gray-300 transition-colors text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/movies"
                  className="text-red-500 hover:text-red-400 transition-colors text-sm py-2 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Movies
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>
      {/* Main */}
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Movies</h1>
          <p className="text-gray-400">{filteredMovies.length} movies found</p>
        </div>

        {/* Filter bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-md text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm"
              >
                <option value="popularity">Popularity</option>
                <option value="title">Title</option>
                <option value="year">Year</option>
                <option value="rating">Rating</option>
              </select>

              <div className="flex items-center space-x-1 bg-gray-800 rounded p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-red-600" : ""}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-red-600" : ""}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {filterOpen && (
            <div className="bg-gray-900 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm mb-1">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm"
                >
                  <option value="all">All Genres</option>
                  {/* deduplicated genre list */}
                  {Array.from(new Set(movies.flatMap(m => m.genres || []))).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm"
                >
                  <option value="all">All Years</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Min Rating</label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm"
                >
                  <option value="all">Any</option>
                  <option value="7">7+</option>
                  <option value="8">8+</option>
                  <option value="9">9+</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedGenre("all");
                  setSelectedYear("all");
                  setSelectedRating("all");
                  setSearch("");
                }}
                className="w-full px-4 py-2 bg-red-600 rounded-md text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Movies */}
        {currentMovies.length ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
                {currentMovies.map((m) => (
                  <Link key={m.id} href={`/movie/${m.movieId}`}>
                    <div className="group cursor-pointer">
                      <div className="relative aspect-[2/3] rounded overflow-hidden">
                        <Image
                          src={m.posterPath || "/placeholder.svg"}
                          alt={m.title}
                          fill
                          sizes="20vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80">
                          <h3 className="text-xs font-semibold truncate">{m.title}</h3>
                          <div className="flex justify-between items-center text-xs text-gray-300">
                            <span>{new Date(m.releaseDate || m.year).getFullYear()}</span>
                            <span>★ {m.voteAverage}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {currentMovies.map((m) => (
                  <Link key={m.id} href={`/movie/${m.movieId}`}>
                    <div className="flex bg-gray-900 rounded overflow-hidden hover:bg-gray-800">
                      <Image
                        src={m.posterPath || "/placeholder.svg"}
                        alt={m.title}
                        width={96}
                        height={144}
                        className="object-cover"
                      />
                      <div className="p-4 flex-1">
                        <h3 className="text-lg font-semibold">{m.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Year: {new Date(m.releaseDate || m.year).getFullYear()}</span>
                          <span>Rating: {m.voteAverage}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">{m.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 rounded-md text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-md text-sm ${currentPage === pageNum ? "bg-red-600" : "bg-gray-800"}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">No movies found</h3>
            <button
              onClick={() => {
                setSelectedGenre("all");
                setSelectedYear("all");
                setSelectedRating("all");
                setSearch("");
              }}
              className="px-6 py-2 bg-red-600 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}