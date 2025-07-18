"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Play,
  Info,
  Star,
  Calendar,
  Clock,
  Menu,
  X,
} from "lucide-react";
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getGenres,
  getImageUrl,
  getBackdropUrl,
  getTrendingTvSeries,
} from "../lib/tmdb";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [movieCategories, setMovieCategories] = useState([]);
  const [tvSeriesCategories, setTvSeriesCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get genre names from genre IDs
  const getGenreNames = (genreIds) => {
    return genreIds
      .map((id) => {
        const genre = genres.find((g) => g.id === id);
        return genre ? genre.name : "";
      })
      .filter((name) => name !== "");
  };

  // Format movie data with genre names - handles both TMDB and local database formats
  const formatMovieWithGenres = (movie) => {
    // Handle local database format
    if (movie._id || movie.movieId) {
      return {
        id: movie.movieId || movie._id,
        title: movie.title,
        year: movie.releaseDate
          ? new Date(movie.releaseDate).getFullYear()
          : "N/A",
        rating: movie.voteAverage ? movie.voteAverage.toFixed(1) : "N/A",
        image: movie.posterPath || "/placeholder.svg",
        backdrop: movie.backdropPath || "/placeholder.svg",
        genre: movie.genres || [],
        description: movie.overview,
        duration: movie.runtime ? `${movie.runtime}m` : "N/A",
      };
    }
    // Handle TMDB format
    return {
      id: movie.id,
      title: movie.title,
      year: movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "N/A",
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
      image: getImageUrl(movie.poster_path),
      backdrop: getBackdropUrl(movie.backdrop_path),
      genre: getGenreNames(movie.genre_ids || []),
      description: movie.overview,
      duration: movie.runtime ? `${movie.runtime}m` : "N/A",
    };
  };

  // Format TV series data with genre names
  const formatTvWithGenres = (tvsers) => {
    // Handle local database format
    if (tvsers._id || tvsers.tvseriesId) {
      return {
        id: tvsers.tvseriesId || tvsers._id,
        title: tvsers.name,
        year: tvsers.firstAirDate
          ? new Date(tvsers.firstAirDate).getFullYear()
          : "N/A",
        rating: tvsers.voteAverage ? tvsers.voteAverage.toFixed(1) : "N/A",
        image: tvsers.posterPath || "/placeholder.svg",
        backdrop: tvsers.backdropPath || "/placeholder.svg",
        genre: tvsers.genres || [],
        description: tvsers.overview,
        duration: tvsers.runtime ? `${tvsers.runtime}m` : "N/A",
      };
    }
    // Handle TMDB format
    return {
      id: tvsers.id,
      title: tvsers.title,
      year: tvsers.release_date
        ? new Date(tvsers.release_date).getFullYear()
        : "N/A",
      rating: tvsers.vote_average ? tvsers.vote_average.toFixed(1) : "N/A",
      image: getImageUrl(tvsers.poster_path),
      backdrop: getBackdropUrl(tvsers.backdrop_path),
      genre: getGenreNames(tvsers.genre_ids || []),
      description: tvsers.overview,
      duration: tvsers.runtime ? `${tvsers.runtime}m` : "N/A",
    };
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        // Fetch genres first
        const genresData = await getGenres();
        setGenres(genresData);
        // Fetch different movie and TV series categories
        const [
          trendingMovies,
          popularMovies,
          topRatedMovies,
          nowPlayingMovies,
          trendingTvSeries,
        ] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTopRatedMovies(),
          getNowPlayingMovies(),
          getTrendingTvSeries(),
        ]);

        // Set featured movie (first trending movie)
        if (trendingMovies && trendingMovies.length > 0) {
          const featured = trendingMovies[0];
          setFeaturedMovie({
            id: featured.id,
            title: featured.title,
            year: featured.releaseDate
              ? new Date(featured.releaseDate).getFullYear()
              : "N/A",
            rating: featured.voteAverage
              ? featured.voteAverage.toFixed(1)
              : "N/A",
            duration: "N/A",
            genre: getGenreNames(featured.genre_ids || []),
            description: featured.overview,
            backdrop: featured.backdropPath,
            logo: null,
          });

          // const featured = trendingTvSeries[0];
          // setFeaturedMovie({
          //   id: featured.id,
          //   title: featured.name,
          //   year: featured.firstAirDate
          //     ? new Date(featured.firstAirDate).getFullYear()
          //     : "N/A",
          //   rating: featured.voteAverage
          //     ? featured.voteAverage.toFixed(1)
          //     : "N/A",
          //   duration: "N/A",
          //   genre: getGenreNames(featured.genre_ids || []),
          //   description: featured.overview,
          //   backdrop: featured.backdropPath,
          //   logo: null,
          // });

          console.log("Featured movie set:", featured.title);
        }

        // Format movie categories
        const movieCategories = [
          {
            title: "New Movies",
            movies: trendingMovies.slice(0, 12).map(formatMovieWithGenres),
          },
        ];
        setMovieCategories(movieCategories);

        // Format TV series categories
        const tvSeriesCategories = [
          {
            title: "Trending TV Series",
            series: trendingTvSeries.slice(0, 12).map(formatTvWithGenres),
          },
        ];
        setTvSeriesCategories(tvSeriesCategories);
      } catch (error) {
        console.error("Error fetching movie data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${search}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded flex items-center justify-center font-bold text-sm sm:text-xl">
                M
              </div>
              <span className="text-lg sm:text-xl font-bold text-red-600 hidden xs:block">
                Movie Mania
              </span>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6">
              <Link
                href="/"
                className="hover:text-gray-300 transition-colors text-sm"
              >
                Home
              </Link>
              <Link
                href="/movies"
                className="hover:text-gray-300 transition-colors text-sm"
              >
                Movies
              </Link>
              <Link
                href="/tv-shows"
                className="hover:text-gray-300 transition-colors text-sm"
              >
                TV Shows
              </Link>
              <Link
                href="/my-list"
                className="hover:text-gray-300 transition-colors text-sm"
              >
                My List
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-gray-300 transition-colors text-sm"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search */}
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
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full"></div>
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
                  className="hover:text-gray-300 transition-colors text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Movies
                </Link>
                <Link
                  href="/tv-shows"
                  className="hover:text-gray-300 transition-colors text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  TV Shows
                </Link>
                <Link
                  href="/my-list"
                  className="hover:text-gray-300 transition-colors text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My List
                </Link>
                <Link
                  href="/dashboard"
                  className="hover:text-gray-300 transition-colors text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      {featuredMovie && (
        <section className="relative min-h-screen flex items-center pt-16 sm:pt-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${featuredMovie.backdrop})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40 sm:to-transparent"></div>
          </div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              {featuredMovie.title}
            </h1>
            <div className="flex flex-wrap items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{featuredMovie.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{featuredMovie.year}</span>
              </div>
              {featuredMovie.duration !== "N/A" && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{featuredMovie.duration}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {featuredMovie.genre.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed max-w-2xl">
              {featuredMovie.description.slice(0, 150)}...
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-md transition-colors flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                Play
              </button>
              <button className="border border-gray-400 text-white hover:bg-gray-800 px-6 sm:px-8 py-3 text-base sm:text-lg bg-transparent rounded-md transition-colors flex items-center justify-center">
                <Info className="w-5 h-5 mr-2" />
                More Info
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Movie and TV Series Categories */}
      <main className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-8 sm:space-y-12">
        {/* Movie Categories */}
        {movieCategories.map((category) => (
          <section key={category.title}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              {category.title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {category.movies.map((movie) => (
                <Link key={movie.id} href={`/movie/${movie.id}`}>
                  <div className="group cursor-pointer transition-transform hover:scale-105">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                      <Image
                        src={movie.image || "/placeholder.svg"}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-2">
                          {movie.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <span>{movie.year}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{movie.rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
                          {movie.genre.slice(0, 2).map((g) => (
                            <span
                              key={g}
                              className="text-xs bg-gray-800/80 text-gray-300 px-1 py-0.5 rounded"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* TV Series Categories */}
        {tvSeriesCategories.map((category) => (
          <section key={category.title}>
            {/* {console.log(category.series)} */}
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              {category.title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {category.series.map((series) => (
                <Link key={series.id} href={`/tv/${series.id}`}>
                  <div className="group cursor-pointer transition-transform hover:scale-105">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                      <Image
                        src={series.image || "/placeholder.svg"}
                        alt={series.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-2">
                          {series.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <span>{series.year}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{series.rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
                          {series.genre.slice(0, 2).map((g) => (
                            <span
                              key={g}
                              className="text-xs bg-gray-800/80 text-gray-300 px-1 py-0.5 rounded"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Company
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="hover:text-white transition-colors"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Support
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="hover:text-white transition-colors"
                  >
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Legal
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Connect
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2025 Movie Mania. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
